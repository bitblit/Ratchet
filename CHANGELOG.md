# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Notes]
The comments above about changelogs and semantic versioning start about 2022-09-05.  I'm trying to be better about
documenting things now, but earlier versions of Ratchet don't necessarily fully follow semantic versioning.

Alpha releases are exactly what they sound like - places where I am trying out new things that aren't ready for prime
time, but I need published to see how they interact with the rest of my software ecosystem.  If you use an alpha
package without knowing why it is alpha you'll get exactly what you deserve.

## [Unreleased]
- All my work to date on making Ratchet ESM friendly is in cw/feat/esm .   See the README for my current rant on the state
 of this

## In Flight
* StringReadable : Adapters from string to readable


## [2.4.x] - 2022-12-13
### Changed
- Updated dependant libraries
- Changed minimal Node version to 16.x

## [2.3.x] - 2022-12-03
### Added
- JwtRatchet gets helper methods to list time remaining in tokens
### Changed
- DynamoRatchet refactored so that FullyExecuteScan* and FullyExecuteQuery* methods auto-recover from ProvisionedThroughputExceededException
- DynamoRatchet refactored so that BatchWrite and BatchDelete methods auto-recover from ProvisionedThroughputExceededException
- JwtRatchet now correctly handles malformed JWT's with exp values set in MS (this isnt allowed by the spec)

## [2.2.x] - 2022-11-21
### Added
- Added JwtTokenBase to more clearly follow spec
- Added ability for JwtRatchet to accept multiple encryption keys and select one at random
- Changed JwtRatchet to use Epoch seconds instead of milliseconds (see https://www.rfc-editor.org/rfc/rfc7519#section-2, NumericDate)
- Added RefreshToken ability to JwtRatchet
- Added PrototypeDao for simple website prototyping
### Changed
- Updated sub libraries


## [2.1.x] - 2022-11-14
### Added
- Adding expiring code support
### Changed
- Updated sub libraries

## [2.0.x] - 2022-09-05
### Changed
- Changed out the cli params to use the correct node package.json approach

## [1.0.x] - 2022-08-23
### Added
- New logger instances, structured logging support for AWS
### Changed
- CSV library major version and fixes for that
- Moved things that we're causing libraries to be sucked in via barrel.  

## [0.22.x] - 2022-08-10
### Changed
-TBD for when I feel like doing repo diving

## [0.21.x] - 2022-07-08
### Changed
- Updated libraries
- Made backwards-incompatible change to make EnvironmentService non-static and extensible (Thanks to Bilal Shahid)

## [0.20.x] - 2022-02-25
### Added
- Aws-batch-ratchet
- Inbound-email
- s3-cache-to-local
- s3-location-sync
- sync-lock
- jwt
- google-recaptcha ratchets

### Changed
- Updated dependant libs

## [0.19.x] - 2022-02-15
### Changed
- Generic update of dependant libraries

## [0.18.x] - 2022-01-25
### Changed
- Moved to github actions
- Refactored CI settings to support both Github actions and CircleCI

## [0.17.x] - 2021-11-18
### Added
- TransactionRatchet
### Changed
- Moved/Refactored SimpleCache to use different storage tech, in a non-backwards compatible way

## [0.16.x] - 2021-08-04
### Changed
- Replaced isomorphic-fetch with cross-fetch since it has a "realFetch.call is not a fn" bug and is less supported

## [0.15.x] - 2021-07-15
### Changed
- Replaced portable-fetch with isomorphic-fetch once I saw that portable is just a less-supported branch

## [0.14.x] - 2021-06-18
### Added
- Streaming processors to DynamoRatchet
### Changed
- Updated libraries

## [0.13.x] - 2021-02-28
### Added
- Model-validator
### Changed
- Updated libraries
- Moving to Barrelsby

## [0.12.x] - 2021-02-26
### Changed
-Switched to Jest internally
- Updated libraries
- Switched from Moment to Luxon

## [0.11.x] - 2021-01-25
### Added
- Ec2 ratchet
- Barrel files MapRatchet expander
- Max sizes to mailer config
- StringWritable
- Streaming CSV writer
- Ability to stream to a Daemon target
### Changed
- Wrap classes with CLI extensions
- Trying a new module output

## [0.10.x] - 2021-01-08
### Added
- CSV comparison
- Logger passthru functions for console on browser
### Changed
- Updating dependant libraries

## [0.9.x] - 2020-09-11
### Added
- CLI Ratchet
### Changed
- Updating dependant libraries for security holes

## [0.8.x] - 2020-06-09
### Added
- Adding cloudwatch insights helpers
### Changed
- Updated to require Node 12.x.
- Switched to eslint 

## [0.7.x] - 2020-05-04
### Changed
- Breaking change to Mailer (switch to config object, add allowedDestinationEmails handling)
- Removed Gulp for security reasons.

## [0.6.x] - 2020-04-22
### Changed
-Breaking change to Mailer (adding Handlebars layouts)

## [0.5.x] - 2019-10-19
### Changed
-Breaking change to AthenaRatchet

## [0.4.x] - 2019-09-06
### Changed
-TBD for when I feel like doing repo diving

## [0.3.x] - 2019-07-26
### Changed
-TBD for when I feel like doing repo diving

## [0.2.x] - 2019-07-08
### Changed
-TBD for when I feel like doing repo diving

## [0.1.x] - 2019-06-14
### Changed
-TBD for when I feel like doing repo diving

## [0.0.x] - 2018-03-23
### Initial Release
-TBD for when I feel like doing repo diving

