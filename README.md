# Creates a tag based on Semantic Versioning

Useful in builds where you want to increment the version number of a package each time do a build.

## Usage

### New workflow
```yaml
name: Create Tag
on: [push]
jobs:
    build:
        runs-on: ubuntu-latest
        steps:
        - name: Tag
            if: github.ref == 'refs/heads/master'
            uses: tcpl/semver-tag-creator-action@master
            with:
                major-version: 1
                repository-url: https://$GITHUB_ACTOR:$GITHUB_TOKEN@github.com/[owner]/[repository].git
```

## Arguments

`major-version` - the number to use for the major-version number (defaults to 1)
`repository-url` - The GITHUB repository URL to use to fetch/push tags