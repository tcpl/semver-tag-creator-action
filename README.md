# Creates a tag based on Semantic Versioning

Useful in builds where you want to increment the version number of a package each time you do a build.

## Building this action

```
npm run build
git commit
git tag -a [tag] -m ""
git push origin [tag]
```

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
