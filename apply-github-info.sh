echo "Applying Github variables to build files"
echo "This script is just to handle the chicken-and-egg problem with apply-ci-env-variables-to-files for Ratchet"
echo "no one else should use it"
find . -wholename "*/dist/*/build/*.js" -type f -exec sed -i "s/LOCAL-SNAPSHOT/$GITHUB_RUN_NUMBER/g" {} \;
find . -wholename "*/dist/*/build/*.js" -type f -exec sed -i "s/LOCAL-BRANCH/$GITHUB_REF_NAME/g" {} \;
find . -wholename "*/dist/*/build/*.js" -type f -exec sed -i "s/LOCAL-HASH/$GITHUB_SHA/g" {} \;
find . -wholename "*/dist/*/build/*.js" -type f -exec sed -i "s/LOCAL-TAG/$GITHUB_REF_NAME/g" {} \;
CURRENT_DATE=`date +"%Y-%m-%dT%H:%M:%S%z"` && find . -wholename "*/dist/*/build/*.js" -type f -exec sed -i "s/LOCAL-TIME-ISO/$CURRENT_DATE/g" {} \;
find . -wholename "*/dist/*/build/*.js" -type f -exec sed -i "s/LOCAL-NOTES//g" {} \;
find . -wholename "*/dist/*/build/*.js" -type f -exec sed -i "s/LOCAL-ACTOR/$GITHUB_ACTOR/g" {} \;
find . -wholename "*/dist/*/build/*.js" -type f -exec sed -i "s/LOCAL-REPOSITORY/$GITHUB_REPOSITORY/g" {} \;



