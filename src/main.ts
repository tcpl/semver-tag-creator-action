import * as core from '@actions/core'
import { exec } from "@actions/exec";

async function run(): Promise<void> {
  try {
    await exec("git fetch --tags");
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()