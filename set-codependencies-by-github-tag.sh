if [ $# -eq 0 ]; then
    >&2 echo "No arguments provided"
    exit 1
fi

# Determine version based on GITHUB_REF_NAME
VERSION="$1"
if [[ "$GITHUB_REF_NAME" == release-* ]]; then
    echo "Release branch detected (${GITHUB_REF_NAME}), using version: ${VERSION}"
elif [[ "$GITHUB_REF_NAME" == alpha-* ]]; then
    VERSION="${1}-alpha"
    echo "Alpha branch detected (${GITHUB_REF_NAME}), using version: ${VERSION}"
else
    echo "Using version: ${VERSION}"
fi

echo "Applying version number to all package.json files: ${VERSION}"
find . -regex "\./modules/[^/]*/package.json" -type f -exec sed -i -e "s/0.0.0-snapshot/${VERSION}/g" {} \;
