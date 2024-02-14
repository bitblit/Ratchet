# Misc

This is random stuff that didn't fit anywhere else and I didn't want to make people have to include the weight.

## Brevo

Brevo is a service for sending marketing and transactional emails.  I'm leaning on it for now both because it
lets me pretty easily outsource the mail design to my biz partners, and also because AWS SES is getting harder and
harder to get approval for - no idea why.  Sure, spam.

Anyway, I generate the OpenAPI spec here since I realized that's all they are doing in their "official" client,
and they are using an ancient version with bad Typescript and request dependencies - at least this uses fetch.  I
am doing the typical weirdness for working around multi-import issues in the typescript-fetch generator.

Using the OpenAPI spec taken from here: https://api.brevo.com/v3/swagger_definition.yml
Snapshotting it locally so that a bad web server cant break a build