import path from 'path';
import crypto from 'crypto';
import { EVALIPIE_SAMPLE_PROJECT, VirtualFile } from '../../demo/sampleProject.js';
import { RepoMetadata } from '../../../../shared/types.js';

export interface IngestedProject {
  projectName: string;
  files: VirtualFile[];
  metadata: RepoMetadata;
  readmeContent?: string;
  requirementsContent?: string;
}

export class RepoIngestionService {
  /**
   * Sanitizes a file path to strictly block path traversal (e.g. `../../etc/passwd`).
   */
  public sanitizeFilePath(filePath: string): string {
    const normalized = path.normalize(filePath).replace(/^(\.\.(\/|\\|$))+/, '');
    if (normalized.includes('\0') || normalized.startsWith('/') || normalized.startsWith('\\')) {
      throw new Error(`Invalid or dangerous file path detected: ${filePath}`);
    }
    return normalized;
  }

  /**
   * Ingests the demo fintech sample project.
   */
  public async ingestDemo(): Promise<IngestedProject> {
    const files = EVALIPIE_SAMPLE_PROJECT.files;
    const metadata = this.calculateMetadata(files);

    return {
      projectName: EVALIPIE_SAMPLE_PROJECT.name,
      files,
      metadata,
      readmeContent: `# ${EVALIPIE_SAMPLE_PROJECT.name}\n${EVALIPIE_SAMPLE_PROJECT.description}\n\nClaims:\n- Atomic debit balance with 0-balance guarantee\n- Owner-only invoice access\n- Non-stackable coupons`,
      requirementsContent: EVALIPIE_SAMPLE_PROJECT.requirementsDoc
    };
  }

  /**
   * Ingests a public GitHub repository using GitHub's REST API.
   */
  public async ingestGitHubRepo(repoUrl: string, branch = 'main'): Promise<IngestedProject> {
    // Extract owner and repo: e.g. https://github.com/facebook/react or git@github.com:...
    const match = repoUrl.match(/github\.com\/([^/]+)\/([^/#?]+)/);
    if (!match) {
      throw new Error('Invalid GitHub repository URL. Expected format: https://github.com/owner/repository');
    }

    const owner = match[1];
    const repo = match[2].replace(/\.git$/, '');

    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`;
    const headers: Record<string, string> = {
      'User-Agent': 'Evalipie-Code-Auditor/1.0',
      'Accept': 'application/vnd.github.v3+json'
    };

    let treeData: any;
    try {
      const res = await fetch(apiUrl, { headers });
      if (!res.ok) {
        // Try fallback to 'master' if 'main' was 404
        if (res.status === 404 && branch === 'main') {
          const resFallback = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/master?recursive=1`, { headers });
          if (resFallback.ok) {
            treeData = await resFallback.json();
          } else {
            throw new Error(`GitHub returned HTTP ${res.status}: ${res.statusText}`);
          }
        } else {
          throw new Error(`GitHub returned HTTP ${res.status}: ${res.statusText}`);
        }
      } else {
        treeData = await res.json();
      }
    } catch (err: any) {
      throw new Error(`Failed to access repository ${owner}/${repo}: ${err.message}`);
    }

    const files: VirtualFile[] = [];
    const validExtensions = new Set(['.js', '.ts', '.jsx', '.tsx', '.json', '.py', '.go', '.rs', '.java', '.md', '.html', '.css', '.yml', '.yaml']);
    const ignoreFolders = ['node_modules/', '.git/', 'dist/', 'build/', 'vendor/', '.next/', '__pycache__/'];

    const treeEntries = (treeData.tree || []).filter((entry: any) => {
      if (entry.type !== 'blob') return false;
      const p = entry.path.toLowerCase();
      if (ignoreFolders.some(f => p.includes(f))) return false;
      const ext = path.extname(p);
      return validExtensions.has(ext);
    }).slice(0, 40); // Cap at top 40 key source files for rapid evaluation

    let readmeContent = '';
    let requirementsContent = '';

    for (const item of treeEntries) {
      try {
        const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${item.path}`;
        const fileRes = await fetch(rawUrl, { headers });
        if (fileRes.ok) {
          const content = await fileRes.text();
          const lines = content.split('\n').length;
          files.push({
            path: this.sanitizeFilePath(item.path),
            content,
            linesOfCode: lines
          });

          if (item.path.toLowerCase() === 'readme.md') {
            readmeContent = content;
          }
          if (item.path.toLowerCase().includes('requirement') || item.path.toLowerCase().includes('spec')) {
            requirementsContent = content;
          }
        }
      } catch {
        // Skip failed individual file fetch
      }
    }

    if (files.length === 0) {
      throw new Error(`No analyzable code files found in repository ${owner}/${repo}`);
    }

    const metadata = this.calculateMetadata(files);

    return {
      projectName: repo,
      files,
      metadata,
      readmeContent: readmeContent || undefined,
      requirementsContent: requirementsContent || undefined
    };
  }

  /**
   * Computes repository metadata: files count, total lines of code, language breakdown.
   */
  public calculateMetadata(files: VirtualFile[]): RepoMetadata {
    let linesOfCode = 0;
    const languages: Record<string, number> = {};

    for (const file of files) {
      linesOfCode += file.linesOfCode;
      const ext = path.extname(file.path).toLowerCase();
      let lang = 'Other';
      if (['.js', '.mjs', '.cjs'].includes(ext)) lang = 'JavaScript';
      else if (['.ts', '.mts'].includes(ext)) lang = 'TypeScript';
      else if (['.jsx', '.tsx'].includes(ext)) lang = 'React JSX/TSX';
      else if (['.py'].includes(ext)) lang = 'Python';
      else if (['.go'].includes(ext)) lang = 'Go';
      else if (['.rs'].includes(ext)) lang = 'Rust';
      else if (['.java'].includes(ext)) lang = 'Java';
      else if (['.json'].includes(ext)) lang = 'JSON';
      else if (['.md'].includes(ext)) lang = 'Markdown';

      languages[lang] = (languages[lang] || 0) + file.linesOfCode;
    }

    // Determine primary language
    let primaryLanguage = 'JavaScript';
    let maxLines = 0;
    for (const [lang, count] of Object.entries(languages)) {
      if (['JSON', 'Markdown', 'Other'].includes(lang)) continue;
      if (count > maxLines) {
        maxLines = count;
        primaryLanguage = lang;
      }
    }

    return {
      filesCount: files.length,
      linesOfCode,
      languages,
      primaryLanguage,
      dependenciesCount: 0,
      vulnerableDependenciesCount: 0
    };
  }
}

export const repoIngestionService = new RepoIngestionService();
