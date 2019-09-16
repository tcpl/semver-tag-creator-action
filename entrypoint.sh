#!/bin/bash 

MAJOR_VERSION=$1
GITHUB_REPOSITORY_URL=https://$GITHUB_ACTOR:$GITHUB_TOKEN@github.com/$GITHUB_REPOSITORY.git
PATCH_VERSION=0

git fetch --tags $GITHUB_REPOSITORY_URL

MOST_RECENT_TAG="$(git tag -l --sort=-version:refname "$MAJOR_VERSION.*.$PATCH_VERSION" | head -n 1)"
if [ -z "$MOST_RECENT_TAG" ]
then
    NEW_TAG="$MAJOR_VERSION.1.$PATCH_VERSION"
else
    IFS=. read -a ARRAY <<< "$MOST_RECENT_TAG"
    NEW_TAG="$MAJOR_VERSION.$((${ARRAY[2]} + 1)).$PATCH_VERSION"
fi

git push $GITHUB_REPOSITORY_URL $NEW_TAG

echo ::set-output name=version::$NEW_TAG