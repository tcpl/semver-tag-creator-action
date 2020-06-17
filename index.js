const core = require("@actions/core");
const github = require("@actions/github");

try {
  const majorVersion = 1; //core.getInput("major-version");
  const patchVersion = 1;
  const dryRun = core.getInput("dry-run");
  console.log(`Hello ${majorVersion}!`);

  exec("git fetch --tags");

  // const mostRecentTag = !!(await exec("git tag")).stdout.trim();
  // const mostRecentTag ="$(git tag -l --sort=-version:refname "$MAJOR_VERSION.*.$PATCH_VERSION" | head -n 1)"

  const time = new Date().toTimeString();
  core.setOutput("version", time);
} catch (error) {
  core.setFailed(error.message);
}
