# Spark Ratchet

Common utilities for Typescript and Node from Spark Ventures.

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

* Winston - because I always need logging
* Moment - because I always need better date handling than what comes with Javascript
* Moment-Timezone - because I always need timezone specific handling of date

## A special note on AWS Library

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

# Testing
Ha!  No, seriously - I am actually improving on this in Node, slowly (2018-03-23)

To run the tests that ARE in here,

`npm test`


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


# Contributing

Pull requests are welcome, although I'm not sure why you'd be interested!
