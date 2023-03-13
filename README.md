# @bitblit/Ratchet

Common utilities for Typescript and Node.

## Introduction

This library is very similar to my [Wrench](https://github.com/bitblit/Wrench) library - a set of things that I
find myself doing over and over again. As Node/Typescript is a relatively new language for me in 2017/2018 (although
Javascript on the client side is not), it is quite likely that there are better ways of doing things than the way I
am doing them here.

You may wish to read [the changelog](CHANGELOG.md)

This library is my first attempt to publish to NPM. I make no guarantees other than the standard one I make for all
my libraries - that I will always rev the major version number if I do something that is not backwards compatible. As
I improve this paragraph should go away.


## Installation

`yarn install @bitblit/ratchet`

## Usage

TBD

### Barrel Files
A Note on barrel files - All of Ratchet's barrel files are one level down. This is because otherwise everything
I said above about transitive dependencies gets thrown out the window if you put them all in one big barrel file


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

Ha! No, seriously - all testing is done using Jest.  To run them:

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

CAW 2022-03-22 : It is my full intention to convert Ratchet (and my other NodeJS libraries) to ECMAScript
modules.  However, I have lots of other things to do besides getting that mess working when Typescript
doesn't support it cleanly yet.  [Support was pulled from Typescript 4.5](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-5.html#esm-nodejs)
but as soon as it is supported it'll be on the top of my list of changes.

CAW 2022-09-05 : Took another multi-week run at making this an ECMAScript module.  It is actually kinda amazing that
a full 7 years after this spec came out support is STILL so weak across the ecosystem for it.  Typescript has 
issues unless you use some hacks (e.g., default Typescript imports are extensionless, but ECMAScript REQUIRES an extension
on the imports.  Default ESLint hates this).   Jest works, but only with some hacks ("cross-env NODE_OPTIONS=--experimental-vm-modules jest").  
Barrel files still a huge mess to try to make tree shaking working cleanly downstream.  Barrelsby won't put extensions
on the index files so that's a SED hack, and then unless you wanna completely destroy tree shaking you better list every
folder separately in the "exports" section of the package.json file.  

Worst of all, the Typescript infrastructure is such that if I make Ratchet ESM-only (as opposed to a dual-built ESM and 
CJS module) then everything downstream of it (notably Epsilon and ALL my various projects which use Ratchet, which is 
to say all of them) must also be ESM only.  Given that Neon uses Ratchet, and that everything up until this point has 
been incredibly fragile, I'm going to commit everything I have into a branch (cw/feat/esm) and push it, and then put 
it back on the shelf for 6 months to age.  We'll see how it looks then - until then, I'm not willing to take on that 
much risk just to get rid of a warning in my Angular builds.

If I was primarily a front-end, non-webpack guy the value would be higher since getting rid of sync imports is huge,
but given that I'm a 92% Node / 8% web guy, this is still way too far out on the value chain for me.
