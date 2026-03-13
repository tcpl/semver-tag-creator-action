import * as core from "@actions/core";
import * as github from "@actions/github";

async function run(): Promise<void> {
  try {
    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      throw new Error("GITHUB_TOKEN environment variable is required");
    }

    const octokit = github.getOctokit(token);
    const { owner, repo } = github.context.repo;

    const majorVersion = core.getInput("major-version");
    const patchVersion = 1;

    // List all tags matching the major version prefix (e.g. "tags/1.")
    const allRefs = await octokit.paginate(octokit.rest.git.listMatchingRefs, {
      owner,
      repo,
      ref: `tags/${majorVersion}.`,
    });

    // Find the highest minor version
    let highestMinor = 0;
    for (const ref of allRefs) {
      const tagName = ref.ref.replace("refs/tags/", "");
      const parts = tagName.split(".");
      if (parts.length === 3 && parts[2] === String(patchVersion)) {
        const minor = parseInt(parts[1]);
        if (minor > highestMinor) {
          highestMinor = minor;
        }
      }
    }

    const newTag =
      allRefs.length === 0
        ? `${majorVersion}.1.${patchVersion}`
        : `${majorVersion}.${highestMinor + 1}.${patchVersion}`;

    await octokit.rest.git.createRef({
      owner,
      repo,
      ref: `refs/tags/${newTag}`,
      sha: github.context.sha,
    });

    core.notice(`Version Tag: ${newTag}`);
    core.setOutput("version", newTag);
  } catch (error: any) {
    core.setFailed(error.message);
  }
}

run();
