echo "Applying version number to all package.json files"
 find . -regex "\./modules/[^/]*/package.json" -type f -exec sed -i -e "s/\"*\"/$0/g" {} \;



