# @bitblit/Ratchet

Common utilities for Typescript and Node.

## Introduction

This library is very similar to my [Wrench](https://github.com/bitblit/Wrench) library - a set of things that I
find myself doing over and over again.  As Node/Typescript is a relatively new language for me in 2017/2018 (although
Javascript on the client side is not), it is quite likely that there are better ways of doing things than the way I
am doing them here.  

This library is my first attempt to publish to NPM.  I make no guarantees other than the standard one I make for all
my libraries - that I will always rev the major version number if I do something that is not backwards compatible.  As
I improve this paragraph should go away.

## Installation
`npm install @bitblit/ratchet`

## Usage

TBD

## Dependencies

Since this is meant to be a very generic library and therefore I don't want to pull in a bunch of transitive 
dependencies, I am keeping myself to very, very few upstream libraries.  However, I am making the following exceptions,
because I use these libraries in literally every project I have ever done:

* Moment - because I always need better date handling than what comes with Javascript
* Moment-Timezone - because I always need timezone specific handling of date


#### Daemon

The Daemon subpackage is to handle the case on AWS where you want to run a process asynchronously via Lambda (not waiting
for the return on a API Gateway request) and check its results until it is finished.  Daemon offers a thin wrapper around
an S3 object that can be updated until it is finally replaced by the final results themselves.  The end customer can
be given the key to check on synchronously.  Items are broken down by day (for easy flushing later) and by groups if 
desired.


## Site Uploader
There is a tool in here called site uploader that is designed to help put completely static sites into S3 (basically
a glorified **aws s3 cp --recursive ...**), while allowing you to set some of the more popular HTTP headers like
Cache-Expires.  If you use it you'll need to add this to your dev dependencies (since I didn't want it in the
dependencies of Ratchet which is meant to also be used in the browser)

```
    "walk": "^2.3.4"
``` 

It will expect you to provide it a configuration file.  I'll document it better later, but here is an 
example of such a configuration file (an Angular app I use, with a couple of custom HTML files with no
extensionss)

```json
{
  "customMimeTypeMapping" : {
    "md" : "text/markdown; charset=UTF-8"
  },

  "mapping" : [
    {
      "prefixMatch" : "assets.*",
      "fileMatch" : ".*",
      "putParams" : {
        "CacheControl" : "max-age=600",
        "Metadata" : {
        }
      }
    },
    {
      "description": "Files with no extension in the root dir",
      "prefixMatch": "$",
      "fileMatch" : "^([^.]+)$",
      "putParams" : {
        "CacheControl" : "max-age=600",
        "ContentType" : "text/html; charset=UTF-8"
      }
    },
    {
      "description": "Javascript bundles in the root dir",
      "prefixMatch": "$",
      "fileMatch" : ".*\\.bundle\\.js",
      "putParams" : {
        "CacheControl" : "max-age=86400"
      }
    },
    {
      "description": "Default rule",
      "putParams" : {
        "CacheControl" : "max-age=30"
      }
    }

  ]
}
```


## Notes on libraries that are used but must be purposely included (transitive dependencies)

### AWS
Originally I was going to package this as 2 different libraries - one for just my AWS stuff, and the other for more
generic stuff.  But then I realized that even with the AWS stuff I would bring in AWS lib as a dev dependency because
I do so much stuff on Lambda and Lambda already has the AWS library on it.  So - Important note!  If you use the
AWS stuff in here you will need to do your own AWS dependency, something like :

```
    "aws-sdk": "^2.195.0",
```

Or none of the AWS stuff is going to work.

One more note on the AWS stuff - for most of my non-super-heavy-load stuff I work in *us-east-1*.  I do this both
because I am lazy and because that is where AWS releases the new stuff first.  Because of this, you will see that 
while my code allows you to override the region, I always set a biased default.  If you don't like that... sorry?


### Express
There are also a few classes in here for simplifying using Express as a processor for Lambda on Node.  Similarly to
AWS above, Express is included as a dev dependency for this library - if you want to use those classes you are 
probable already including Express in your package.  If not:

```
    "express": "^4.15.2",
    "@types/express": "^4.0.33",
```

### RXJS
The Observable ratchet is based on Observables through RXJS.  If you use it, you'll need:

```
    "rxjs": "5.5.6",
```

### Handlebars and PortableFetch
The simplified mailer for SES (aws/ses/mailer) can be provided with a remote template renderer, which assumes the template
is a handlebars template.  If you use it, you'll need Handlebars and PortableFetch installed:

```
    "handlebars": "4.1.2",
    "portable-fetch": "3.0.0"
```

I use PortableFetch to keep Ratchet useable on both the client and server side.


# Testing
Ha!  No, seriously - I am actually improving on this in Node, slowly (2018-03-23)

To run the tests that ARE in here,

`npm test`

# Why not Lodash?
Honestly, because when I first started writing this I hadn't discovered Lodash yet.  The odds are quite good that in 
future releases of Ratchet some duplicative functionality may end up being marked deprecated and turned into thin
pipes into Lodash functions instead.


# Deployment

I'll write notes-to-self here on how my deployment from [CircleCI](https://circleci.com) is actually going to work.

Following the notes from [here](https://docs.npmjs.com/getting-started/publishing-npm-packages).  Important points:

* Everything in the package that isn't in .gitignore or .npmignore gets uploaded.  Review before post

For circleci using [these notes](https://circleci.com/docs/1.0/npm-continuous-deployment/)

Looks like its my standard - set a release tag and push to Github, CircleCI takes care of the rest:

```
    git commit -m "New stuff"
    git tag -a release-0.0.5 -m "Because I like it a lot"
    git push origin master --tags

```

Also following notes from [here](https://ljn.io/posts/publishing-typescript-projects-with-npm/) on converting the
typescript into usable javascript+mapping stuff.



# Contributing

Pull requests are welcome, although I'm not sure why you'd be interested!
