import { VirtualFile } from '../../demo/sampleProject.js';
import { RepoMetadata } from '../../../../shared/types.js';

export interface TechDetectionResult {
  metadata: RepoMetadata;
  framework?: string;
  buildTool?: string;
  testFramework?: string;
  dependencies: Array<{ name: string; version: string; isVulnerable?: boolean; cve?: string }>;
}

export class TechDetectionService {
  public detect(files: VirtualFile[], existingMetadata: RepoMetadata): TechDetectionResult {
    let framework: string | undefined = undefined;
    let buildTool: string | undefined = undefined;
    let testFramework: string | undefined = undefined;
    const dependencies: Array<{ name: string; version: string; isVulnerable?: boolean; cve?: string }> = [];

    // 1. Inspect package.json
    const pkgFile = files.find(f => f.path.endsWith('package.json'));
    if (pkgFile) {
      try {
        const pkg = JSON.parse(pkgFile.content);
        const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };

        for (const [name, version] of Object.entries(allDeps)) {
          let isVulnerable = false;
          let cve: string | undefined;

          // Known dependency vulnerability heuristic
          if (name === 'lodash' && String(version).includes('4.17.15')) {
            isVulnerable = true;
            cve = 'CVE-2020-8203 (Prototype Pollution)';
          } else if (name === 'axios' && String(version).includes('0.21.1')) {
            isVulnerable = true;
            cve = 'CVE-2021-3749 (SSRF vulnerability)';
          }

          dependencies.push({ name, version: String(version), isVulnerable, cve });
        }

        if (allDeps['next']) framework = 'Next.js';
        else if (allDeps['express']) framework = 'Express.js';
        else if (allDeps['fastify']) framework = 'Fastify';
        else if (allDeps['react']) framework = 'React';
        else if (allDeps['vue']) framework = 'Vue';
        else if (allDeps['@nestjs/core']) framework = 'NestJS';

        if (allDeps['vite']) buildTool = 'Vite';
        else if (allDeps['webpack']) buildTool = 'Webpack';
        else if (allDeps['esbuild']) buildTool = 'esbuild';

        if (allDeps['jest']) testFramework = 'Jest';
        else if (allDeps['vitest']) testFramework = 'Vitest';
        else if (allDeps['mocha']) testFramework = 'Mocha';
      } catch {
        // Skip malformed package.json
      }
    }

    // 2. Python requirements.txt or pyproject.toml
    const reqFile = files.find(f => f.path.endsWith('requirements.txt'));
    if (reqFile) {
      const lines = reqFile.content.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const parts = trimmed.split(/==|>=|<=|~=/);
          const name = parts[0].trim();
          const version = parts[1]?.trim() || '*';
          dependencies.push({ name, version });

          if (name.toLowerCase() === 'fastapi') framework = 'FastAPI';
          else if (name.toLowerCase() === 'django') framework = 'Django';
          else if (name.toLowerCase() === 'flask') framework = 'Flask';

          if (name.toLowerCase() === 'pytest') testFramework = 'PyTest';
        }
      }
    }

    const vulnerableCount = dependencies.filter(d => d.isVulnerable).length;

    const metadata: RepoMetadata = {
      ...existingMetadata,
      framework: framework || 'Standard Library / Custom',
      buildTool: buildTool || 'Node / Native Toolchain',
      packageManager: pkgFile ? 'npm / yarn' : reqFile ? 'pip' : 'Native',
      dependenciesCount: dependencies.length,
      vulnerableDependenciesCount: vulnerableCount
    };

    return {
      metadata,
      framework,
      buildTool,
      testFramework,
      dependencies
    };
  }
}

export const techDetectionService = new TechDetectionService();
