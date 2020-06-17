import * as core from '@actions/core'
import { exec as _exec } from "@actions/exec";

async function exec(command: string) {
  let stdout = "";
  let stderr = "";

  try {
    const options = {
      listeners: {
        stdout: (data: Buffer) => {
          stdout += data.toString();
        },
        stderr: (data: Buffer) => {
          stderr += data.toString();
        },
      },
    };

    const code = await _exec(command, undefined, options);

    return {
      code,
      stdout,
      stderr,
    };
  } catch (err) {
    return {
      code: 1,
      stdout,
      stderr,
      error: err,
    };
  }
}

async function run(): Promise<void> {
  try {
    await exec("git fetch --tags");

    const majorVersion = core.getInput("major-version");
    const patchVersion = 1;

    const mostRecentTag = (
      await exec(`git tag -l --sort=-version:refname "${majorVersion}.*.${patchVersion}" | head -n 1)`)
    ).stdout.trim();

    core.setOutput("version", mostRecentTag);

  } catch (error) {
    core.setFailed(error.message)
  }
}

run()