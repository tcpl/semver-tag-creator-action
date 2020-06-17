const core = require("@actions/core");
// const github = require("@actions/github");

try {
  const majorVersion = core.getInput("major-version");
  console.log(`Hello ${majorVersion}!`);

  const time = new Date().toTimeString();
  core.setOutput("version", time);
} catch (error) {
  core.setFailed(error.message);
}
