echo "Applying Github variables to build files"
echo "This script is just to handle the chicken-and-egg problem with apply-ci-env-variables-to-files for Ratchet"
echo "no one else should use it"
CURRENT_DATE=`date +"%Y-%m-%dT%H:%M:%S%z"` && find . -wholename "*/dist/*/build/*.js" -type f -exec sed -i -e "s/LOCAL-TIME-ISO/$CURRENT_DATE/g" \
-e "s/LOCAL-SNAPSHOT/$GITHUB_RUN_NUMBER/g" \
-e "s/LOCAL-BRANCH/$GITHUB_REF_NAME/g" \
-e "s/LOCAL-HASH/$GITHUB_SHA/g" \
-e "s/LOCAL-TAG/$GITHUB_REF_NAME/g" \
-e "s/LOCAL-NOTES//g" \
-e "s/LOCAL-ACTOR/$GITHUB_ACTOR/g" \
-e "s/LOCAL-REPOSITORY/$GITHUB_REPOSITORY/g" {} \;



