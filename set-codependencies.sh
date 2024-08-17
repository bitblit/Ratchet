if [ $# -eq 0 ]; then
    >&2 echo "No arguments provided"
    exit 1
fi
echo "Applying version number to all package.json files: $1"
find . -regex "\./modules/[^/]*/package.json" -type f -exec sed -i -e "s/0.0.0-snapshot/$1/g" {} \;
find . -regex "\./angular-modules/[^/]*/package.json" -type f -exec sed -i -e "s/0.0.0-snapshot/$1/g" {} \;



