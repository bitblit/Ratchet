# @bitblit/ratchet-warden-server

Typescript library to simplify using simplewebauthn and secondary auth methods over GraphQL.

## Introduction

I really like using the [SimpleWebAuthn](https://simplewebauthn.dev/) library for Authentication but it has a couple
pieces of code that I still end up re-writing over and over - adding the secondary login methods (like single-use
code sent to email/text) and setting it up to run over GraphQL, which I use regularly and don't really want to 
add a bunch of special methods when they are boilerplate inside anyway once I nail down storage.

So, Warden handles that stuff for me.  Relies heavily on my [Ratchet](https://github.com/bitblit/Ratchet) library
for supporting code.

You may wish to read [the changelog](CHANGELOG.md)

## Installation

`yarn install @bitblit/warden`

## Usage

TBD

### Barrel Files
A Note on barrel files - All of Warden's barrel files are one level down. This is because otherwise everything
I said above about transitive dependencies gets thrown out the window if you put them all in one big barrel file

# Testing

Ha! No, seriously - all testing is done using Jest.  To run them:

`yarn test`

# Contributing

Pull requests are welcome, although I'm not sure why you'd be interested!

