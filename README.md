# @bitblit/Ratchet

Common utilities for Typescript and Node.

## Introduction

This library is very similar to my [Wrench](https://github.com/bitblit/Wrench) library - a set of things that I
find myself doing over and over again. As Node/Typescript is a relatively new language for me in 2017/2018 (although
Javascript on the client side is not), it is quite likely that there are better ways of doing things than the way I
am doing them here.

This library is my first attempt to publish to NPM. I make no guarantees other than the standard one I make for all
my libraries - that I will always rev the major version number if I do something that is not backwards compatible. As
I improve this paragraph should go away.

## Installation

`yarn install @bitblit/ratchet`

## Usage

TBD

## Dependencies

Since this is meant to be a very generic library and therefore I don't want to pull in a bunch of transitive
dependencies, I am keeping myself to very, very few upstream libraries. However, I am making the following exceptions,
because I use these libraries in literally every project I have ever done:

- Luxon - because I always need better date handling than what comes with Javascript (was moment before 0.12.x)

* Note on barrel files - All of Ratchet's barrel files are one level down. This is because otherwise everything
  I said above about transitive dependencies gets thrown out the window if you put them all in one big barrel file

#### Daemon

The Daemon subpackage is to handle the case on AWS where you want to run a process asynchronously via Lambda (not waiting
for the return on a API Gateway request) and check its results until it is finished. Daemon offers a thin wrapper around
an S3 object that can be updated until it is finally replaced by the final results themselves. The end customer can
be given the key to check on synchronously. Items are broken down by day (for easy flushing later) and by groups if
desired.

## Site Uploader

There is a tool in here called site uploader that is designed to help put completely static sites into S3 (basically
a glorified **aws s3 cp --recursive ...**), while allowing you to set some of the more popular HTTP headers like
Cache-Expires. If you use it you'll need to add this to your dev dependencies (since I didn't want it in the
dependencies of Ratchet which is meant to also be used in the browser)

```
    "walk": "^2.3.14"
```

It will expect you to provide it a configuration file. I'll document it better later, but here is an
example of such a configuration file (an Angular app I use, with a couple of custom HTML files with no
extensions)

```json
{
  "customMimeTypeMapping": {
    "md": "text/markdown; charset=UTF-8"
  },

  "mapping": [
    {
      "prefixMatch": "assets.*",
      "fileMatch": ".*",
      "putParams": {
        "CacheControl": "max-age=600",
        "Metadata": {}
      }
    },
    {
      "description": "Files with no extension in the root dir",
      "prefixMatch": "$",
      "fileMatch": "^([^.]+)$",
      "putParams": {
        "CacheControl": "max-age=600",
        "ContentType": "text/html; charset=UTF-8"
      }
    },
    {
      "description": "Javascript bundles in the root dir",
      "prefixMatch": "$",
      "fileMatch": ".*\\.bundle\\.js",
      "putParams": {
        "CacheControl": "max-age=86400"
      }
    },
    {
      "description": "Default rule",
      "putParams": {
        "CacheControl": "max-age=30"
      }
    }
  ]
}
```

## Notes on libraries that are used but must be purposely included (transitive dependencies)

### AWS

Originally I was going to package this as 2 different libraries - one for just my AWS stuff, and the other for more
generic stuff. Then I realized that even with the AWS stuff I would bring in AWS lib as a dev dependency because
I do so much stuff on Lambda and Lambda already has the AWS library on it. So - Important note! If you use the
AWS stuff in here you will need to do your own AWS dependency, something like :

```
    "aws-sdk": "^2.906.0",
```

Or none of the AWS stuff is going to work.

One more note on the AWS stuff - for most of my non-super-heavy-load stuff I work in _us-east-1_. I do this both
because I am lazy and because that is where AWS releases the new stuff first. Because of this, you will see that
while my code allows you to override the region, I always set a biased default. If you don't like that... sorry?

#### Athena

AthenaRatchet is a special case because the datasets you use with Athena tend to be so large you'll often
need to work with only a chunk of them at a time. The AthenaRatchet depends on a couple more libraries
that you'll need to use a chunk of the functionality - csv parses output files from Athena locally (much faster
than having them do it) and tmp creates local tmp files for storage. It also uses 'fs' so, in case it's not
already abundantly clear, this only works in Node, not in the browser. Not that you'd do much Athena
work in the browser anyway, but I may break this up later if I see a need for that.

```
    "csv": "5.5.0",
    "tmp": "0.2.1",
```

### RXJS

The Observable ratchet is based on Observables through RXJS. If you use it, you'll need:

```
    "rxjs": "7.0.1",
```

### Handlebars and CrossFetch

The simplified mailer for SES (aws/ses/mailer) can be provided with a remote template renderer, which assumes the template
is a Handlebars template. If you use it, you'll need Handlebars (and Handlebars-Layouts, which isn't required but
is highly recommended if you are doing much Handlebars work needing templates) and CrossFetch installed:

```
    "handlebars": "4.7.7",
    "handlebars-layouts": "3.1.4",
    "cross-fetch": "3.1.4"
```

I use PortableFetch to keep Ratchet usable on both the client and server side.

### ModelValidator

Ratchet includes a helper for validating objects that match swagger schemas in the model-validator package.  If you 
use it, you'll need to include:

```
    "js-yaml": "4.0.0",
    "swagger-model-validator": "3.0.20",
```

# Testing

Ha! No, seriously - all testing is done using Jest.  To run them:

`yarn test`

# Why not X? (Where X=Lodash, Underscore, Ramda, etc...)

Originally, my answer would be because I just didn't know about them.  I know about them now (2019) and I use them
quite a lot myself.  Any code has impedence mismatches (either with the problem domain, or just with how I 
_think_ about the problem) and so Ratchet is how _I_ tackle some of these.  If you think like me, Ratchet is for you!
If not, it's ok - go use X.  We're still friends.

# Deployment

I'll write notes-to-self here on how my deployment from [CircleCI](https://circleci.com) is actually going to work.

Following the notes from [here](https://docs.npmjs.com/getting-started/publishing-npm-packages). Important points:

- Everything in the package that isn't in .gitignore or .npmignore gets uploaded. Review before post

For circleci using [these notes](https://circleci.com/docs/1.0/npm-continuous-deployment/)

Looks like it's my standard - set a release tag and push to Github, CircleCI takes care of the rest:

```
    git commit -m "New stuff"
    git tag -a release-0.0.5 -m "Because I like it a lot"
    git push origin master --tags

```

Also following notes from [here](https://ljn.io/posts/publishing-typescript-projects-with-npm/) on converting the
typescript into usable javascript+mapping stuff.

# Contributing

Pull requests are welcome, although I'm not sure why you'd be interested!

# Version history

- 0.0.x : Initial releases
- 0.1.x - 0.4.x : TBD for when I feel like doing repo diving
- 0.5.x : Breaking change to AthenaRatchet
- 0.6.x : Breaking change to Mailer (adding Handlebars layouts)
- 0.7.x : Breaking change to Mailer (switch to config object, add allowedDestinationEmails handling). Removed Gulp for security reasons.
- 0.8.x : Updated to require Node 12.x. Switched to eslint. Adding cloudwatch insights helpers
- 0.9.x : Adding CLI Ratchet, updating dependant libraries for security holes
- 0.10.x : Adding CSV comparison, updating dependant libraries, Logger passthru functions for console on browser
- 0.11.x : Adding ec2 ratchet, barrel files, wrap classes with CLI extensions, MapRatchet expander, trying a new module output, added max sizes to mailer config
- Added StringWritable and Streaming CSV writer, ability to stream to a Daemon target
- 0.12.x : Switched to Jest internally, updated libraries, switched from Moment to Luxon
- 0.13.x : Updated libraries, moving to Barrelsby, adding model-validator
- 0.14.x : Updated libraries, added streaming processors to DynamoRatchet
- 0.15.x : Replaced portable-fetch with isomorphic-fetch once I saw that portable is just a less-supported branch
- 0.16.x : Replaced isomorphic-fetch with cross-fetch since it has a "realFetch.call is not a fn" bug and is less supported
- 0.17.x : Moved/Refactored SimpleCache to use different storage tech, in a non-backwards compatible way

* Added CSVRatchet and AlbAthenaLogRatchet
* Added simplePutWithCollisionAvoidance to DynamoRatchet
* Added simpleGetWithCounterDecrement to DynamoRatchet
