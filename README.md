# @bitblit/Ratchet

Common utilities for Typescript and Node.

## Introduction

This library is very similar to my [Wrench](https://github.com/bitblit/Wrench) library - a set of things that I
find myself doing over and over again. As Node/Typescript is a relatively new language for me in 2017/2018 (although
Javascript on the client side is not), it is quite likely that there are better ways of doing things than the way I
am doing them here.

You may wish to read [the changelog](CHANGELOG.md)


### Coming from @bitblit/ratchet or @bitblit/epsilon?
Those libraries are the previous versions of this code before I moved to a mono-repo build process, and split the
libaries to be more clear which things are usable on node-only vs usable on both node and browser.  In general, packages
like @bitblit/ratchet/common are now @bitblit/ratchet-common, etc.  Version 4.1.106 of @bitblit/ratchet and 4.1.100
of @bitblit/epsilon are expected to be the final releases of those branches.


## Installation

For example, 
`yarn install @bitblit/ratchet-common`

## Usage

TBD

### Barrel Files And Modular Architecture
Although I hate the import pollution, I have gradually been dragged to the belief that barrel files are an
antipattern in Typescript given how much they mess up tree shaking, etc.  I finally removed them entirely.

## Utilities and Stuff
### Daemon

The Daemon subpackage is to handle the case on AWS where you want to run a process asynchronously via Lambda (not waiting
for the return on a API Gateway request) and check its results until it is finished. Daemon offers a thin wrapper around
an S3 object that can be updated until it is finally replaced by the final results themselves. The end customer can
be given the key to check on synchronously. Items are broken down by day (for easy flushing later) and by groups if
desired.

### Site Uploader

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

## Dependencies

### Direct Dependencies
Since this is meant to be a very generic library, I don't want to pull in a bunch of transitive
dependencies, I am keeping myself to very, very few upstream libraries. However, I am making the following exceptions,
because I use these libraries in literally every project I have ever done:

- Luxon - because I always need better date handling than what comes with Javascript (was moment before 0.12.x)

### Optional Dependencies

Check out the package.json file for libraries that are optional - basically, if you wish to use the code that
uses those libraries, you need to also include those libraries.  Otherwise, they can be safely ignored.

#### AWS Library Notes
For most of my non-super-heavy-load stuff I work in _us-east-1_. I do this both
because I am lazy and because that is where AWS releases the new stuff first. Because of this, you will see that
while my code allows you to override the region, I always set a biased default. If you don't like that... sorry?

Since AWS version 3 has broken out all the services into separate libraries, there can be issues if you have
libraries with different versions since they depend on different versions of the '@aws-sdk/types' library.  Therefor,
Ratchet when upgraded ships with the most recent version of AWS libraries that ALL the dependant libraries support,
so that we don't get weird matching issues.  See https://github.com/m-radzikowski/aws-sdk-client-mock/issues/10
for background if you care.

#### Athena

AthenaRatchet is a special case because the datasets you use with Athena tend to be so large you'll often
need to work with only a chunk of them at a time. The AthenaRatchet depends on a couple more libraries
that you'll need to use a chunk of the functionality - csv parses output files from Athena locally (much faster
than having them do it) and tmp creates local tmp files for storage. It also uses 'fs' so, in case it's not
already abundantly clear, this only works in Node, not in the browser. Not that you'd do much Athena
work in the browser anyway, but I may break this up later if I see a need for that.

To use the AthenaRatchet, in addition to *aws-lib* you will need *csv* and *tmp*

#### RXJS

The Observable ratchet is based on Observables through RXJS, you'll need to install it.

#### Handlebars and CrossFetch

The simplified mailer for SES (aws/ses/mailer) can be provided with a remote template renderer, which assumes the template
is a Handlebars template. If you use it, you'll need Handlebars (and Handlebars-Layouts, which isn't required but
is highly recommended if you are doing much Handlebars work needing templates) and CrossFetch installed.

I use CrossFetch to keep Ratchet usable on both the client and server side.

### ModelValidator Dependencies

Ratchet includes a helper for validating objects that match swagger schemas in the model-validator package.  If you 
use it, you'll need to include *js-yaml* and *swagger-model-validator*.

# Testing

Ha! No, seriously - all testing is done using ViTest (I moved from Jest when it became clear that 
it didn't support ESM well and had no intentions to anytime soon).  To run them:

`yarn test`

# Why not X? (Where X=Lodash, Underscore, Ramda, etc...)

Originally, my answer would be because I just didn't know about them.  I know about them now (2019) and I use them
quite a lot myself.  Any code has impedence mismatches (either with the problem domain, or just with how I 
_think_ about the problem) and so Ratchet is how _I_ tackle some of these.  If you think like me, Ratchet is for you!
If not, it's ok - go use X.  We're still friends.

# Deployment

I'll write notes-to-self here on how my deployment on Github actions is actually going to work.

Following the notes from [here](https://docs.npmjs.com/getting-started/publishing-npm-packages). Important points:

- Everything in the package that isn't in .gitignore or .npmignore gets uploaded. Review before post

* Set a release tag and push to Github, Github actions takes care of the rest:

```
    git commit -m "New stuff"
    mytag release
    git push origin master --tags

```

Also following notes from [here](https://ljn.io/posts/publishing-typescript-projects-with-npm/) on converting the
typescript into usable javascript+mapping stuff.

# Contributing

Pull requests are welcome, although I'm not sure why you'd be interested!

## Notes on ECMAScript Modules

Ratchet is now ESM only.  As a former Java guy who is jealous of how well that module system was ready to go
in version 1.0.2 in 1995 (!!!) I find Javascript's module system to be a wretched hive of scum and villainy,
but what can you do, other than use the current best available?