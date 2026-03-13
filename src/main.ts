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
    const patchVersion = 0;

    // List all tags matching our pattern
    const tags: string[] = [];
    for await (const response of octokit.paginate.iterator(
      octokit.rest.repos.listTags,
      { owner, repo, per_page: 100 },
    )) {
      for (const tag of response.data) {
        const pattern = new RegExp(
          `^${majorVersion}\\.\\d+\\.${patchVersion}$`,
        );
        if (pattern.test(tag.name)) {
          tags.push(tag.name);
        }
      }
    }

    // Sort by minor version descending to find the highest
    tags.sort((a, b) => {
      const minorA = parseInt(a.split(".")[1]);
      const minorB = parseInt(b.split(".")[1]);
      return minorB - minorA;
    });

    let newTag: string;

    if (tags.length === 0) {
      newTag = `${majorVersion}.1.${patchVersion}`;
    } else {
      const highestMinor = parseInt(tags[0].split(".")[1]);
      newTag = `${majorVersion}.${highestMinor + 1}.${patchVersion}`;
    }

    // Create the tag via the API
    const sha = github.context.sha;

    await octokit.rest.git.createRef({
      owner,
      repo,
      ref: `refs/tags/${newTag}`,
      sha,
    });

    core.notice(`Version Tag: ${newTag}`);
    core.setOutput("version", newTag);
  } catch (error: any) {
    core.setFailed(error.message);
  }
}

run();
