if [ $# -eq 0 ]; then
    >&2 echo "No arguments provided"
    exit 1
fi

echo Github tag reported as $GITHUB_REF_NAME

# Determine version based on GITHUB_REF_NAME
VERSION="$1"

case "$GITHUB_REF_NAME" in
  release-*)
    echo "Release branch detected (${GITHUB_REF_NAME}), using version: ${VERSION}"
    ;;
  alpha-*)
    VERSION="${1}-alpha"
    echo "Alpha branch detected (${GITHUB_REF_NAME}), using version: ${VERSION}"
    ;;
  *)
    echo "Using version: ${VERSION}"
    ;;
esac

echo "Applying version number to all package.json files: ${VERSION}"
find . -regex "\./modules/[^/]*/package.json" -type f -exec sed -i -e "s/0.0.0-snapshot/${VERSION}/g" {} \;
