import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { EVALIPIE_SAMPLE_PROJECT, VirtualFile } from '../../demo/sampleProject.js';
import { EvaluationFinding, VerificationStatus } from '../../../../shared/types.js';

export interface ReproductionResult {
  findingId: string;
  status: VerificationStatus;
  exitCode: number;
  stdout: string;
  stderr: string;
  durationMs: number;
}

export class BugReproductionService {
  /**
   * Executes reproduction scripts in an isolated temporary sandbox environment.
   */
  public async reproduceBug(
    finding: EvaluationFinding,
    files: VirtualFile[]
  ): Promise<ReproductionResult> {
    const startTime = Date.now();

    // Check if finding matches our verified reproduction suites
    const matchingSuite = EVALIPIE_SAMPLE_PROJECT.reproductionSuites.find(
      s => s.bugTitle.toLowerCase() === finding.title.toLowerCase() ||
           finding.title.toLowerCase().includes(s.id.replace('repro-', '').split('-')[0])
    );

    const scriptToRun = matchingSuite?.scriptContent || finding.reproductionCode;

    if (!scriptToRun) {
      return {
        findingId: finding.id,
        status: 'LIKELY',
        exitCode: 0,
        stdout: '[EVALIPIE SANDBOX] No standalone automated reproduction script available. Static AST evidence preserved.',
        stderr: '',
        durationMs: Date.now() - startTime
      };
    }

    // Create a temporary sandbox directory
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'evalipie-sandbox-'));

    try {
      // Write virtual files to the sandbox directory
      for (const file of files) {
        const fullFilePath = path.join(tempDir, file.path);
        fs.mkdirSync(path.dirname(fullFilePath), { recursive: true });
        fs.writeFileSync(fullFilePath, file.content, 'utf-8');
      }

      // Write reproduction harness script
      const harnessPath = path.join(tempDir, 'repro_runner.js');
      fs.writeFileSync(harnessPath, scriptToRun, 'utf-8');

      // Execute in child process with strict isolation & timeout
      const result = await new Promise<{ exitCode: number; stdout: string; stderr: string }>(resolve => {
        exec(
          `node "${harnessPath}"`,
          {
            cwd: tempDir,
            timeout: 5000,
            maxBuffer: 1024 * 1024,
            env: {
              NODE_ENV: 'test',
              PATH: process.env.PATH,
              EVALIPIE_SANDBOX: '1'
            }
          },
          (error, stdout, stderr) => {
            const exitCode = error ? (typeof error.code === 'number' ? error.code : 1) : 0;
            resolve({
              exitCode,
              stdout: stdout || '',
              stderr: stderr || ''
            });
          }
        );
      });

      const durationMs = Date.now() - startTime;
      const combinedOutput = (result.stdout + '\n' + result.stderr).trim();

      // In reproduction suites, an exitCode of 1 or matching specific failure text confirms reproduction
      const isConfirmed = result.exitCode === 1 || combinedOutput.includes('REPRODUCTION CONFIRMED');

      return {
        findingId: finding.id,
        status: isConfirmed ? 'REPRODUCED' : 'LIKELY',
        exitCode: result.exitCode,
        stdout: result.stdout,
        stderr: result.stderr,
        durationMs
      };
    } catch (err: any) {
      return {
        findingId: finding.id,
        status: 'LIKELY',
        exitCode: 2,
        stdout: '',
        stderr: `Sandbox execution failed: ${err.message}`,
        durationMs: Date.now() - startTime
      };
    } finally {
      // Clean up sandbox directory
      try {
        fs.rmSync(tempDir, { recursive: true, force: true });
      } catch {
        // Ignore cleanup failure
      }
    }
  }
}

export const bugReproductionService = new BugReproductionService();
