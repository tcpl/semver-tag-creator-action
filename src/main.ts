import * as core from "@actions/core";
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
    const gitHubRepositoryUrl = `https://${process.env.GITHUB_ACTOR}:${process.env.GITHUB_TOKEN}@github.com/${process.env.GITHUB_REPOSITORY}.git`;

    await exec(`git fetch --tags ${gitHubRepositoryUrl}`);

    const majorVersion = core.getInput("major-version");
    const patchVersion = 1;

    const mostRecentTag = (
      await exec(
        `git tag -l --sort=-version:refname "${majorVersion}.*.${patchVersion}" | head -n 1)`
      )
    ).stdout.trim();

    let newTag;

    if (!mostRecentTag) {
      newTag = `${majorVersion}.1.${patchVersion}`;
    } else {
      const tagParts = mostRecentTag.split(".");
      const newMinor = parseInt(tagParts[1]) + 1;

      newTag = `${majorVersion}.${newMinor}.${patchVersion}`;
    }

    await exec(`git tag ${newTag}`);
    await exec(`git push ${gitHubRepositoryUrl} ${newTag}`);

    // annotates the build with the new version tag
    core.notice(`Version Tag: ${newTag}`);
    core.setOutput("version", newTag);
  } catch (error: any) {
    core.setFailed(error.message);
  }
}

run();
