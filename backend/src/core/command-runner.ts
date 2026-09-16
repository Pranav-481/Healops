import { spawn } from 'node:child_process';

export interface CommandResult { output: string[]; exitCode: number; }

export async function runCommand(command: string, args: string[], cwd?: string, timeoutMs = 10 * 60_000): Promise<CommandResult> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd, shell: false, windowsHide: true, env: process.env });
    const output: string[] = [];
    const onData = (chunk: Buffer) => output.push(...chunk.toString().split(/\r?\n/).filter(Boolean));
    child.stdout.on('data', onData);
    child.stderr.on('data', onData);
    const timer = setTimeout(() => { child.kill('SIGTERM'); reject(new Error(`${command} timed out after ${timeoutMs}ms`)); }, timeoutMs);
    child.on('error', (error) => { clearTimeout(timer); reject(error); });
    child.on('close', (exitCode) => {
      clearTimeout(timer);
      if (exitCode === 0) resolve({ output, exitCode });
      else reject(new Error(`${command} exited with code ${exitCode}. ${output.slice(-8).join('\n')}`));
    });
  });
}
