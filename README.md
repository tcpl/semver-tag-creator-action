# Creates a tag based on Semantic Versioning

Useful in builds where you want to increment the version number of a package each time you do a build.

## Releasing

Before releasing, run `npm run build` locally and commit the resulting `dist/` to the branch you intend to release from.

Then, in the GitHub UI, go to **Actions** → **Release** → **Run workflow**, pick the branch in the **Use workflow from** dropdown (use `main` for normal releases, a feature branch for RC tags like `1.4.0-rc1`), enter the new tag (e.g. `1.3.8`), and click **Run workflow**. The workflow rebuilds `dist/` and fails if it doesn't match what's committed — that's the signal you forgot to rebuild. If `dist/` is current, it creates the tag and pushes it.

## Usage

### Example

Replace `[tag version]` with the latest tag of the action.

```yaml
name: Create Tag
on: [push]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4
      - name: tag
        id: tag
        uses: tcpl/semver-tag-creator-action@[tag version]
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          GITHUB_ACTOR: ${{ github.actor }}
          GITHUB_REPOSITORY: ${{ github.repository }}
        with:
          major-version: 1
      - name: Print Tag
        run: echo "The tag is ${{ steps.tag.outputs.version }}"
```
