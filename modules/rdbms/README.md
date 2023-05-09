# @bitblit/ratchet-rdbms

Typescript library to simplify using relational database systems by externalizing the queries.

## Introduction

Meant to be very similar to the ibatis/mybatis library in Java, which has the right level of abstraction
of the RDBMS in my opinion.

You may wish to read [the changelog](CHANGELOG.md)

## Installation

`yarn install @bitblit/ratchet-rdbms`

## Usage

### Paginator
(To understand the terminology here you may want to read [this](https://nordicapis.com/understanding-5-types-of-web-api-pagination/))

This library natively supports:
* Cursor pagination (use columnName, sort, min, limit)
* Keyset API pagination (use columnName, sort, min, max, maybe limit)
* Seek API pagination (use columnName, sort, min, max, maybe limit)
* Time-based (use columnName on a time column, sort, min, max, maybe limit)

This library doesn't support offset pagination (e.g., using limit/offset in MySql) out of the box.  It does this
on purpose - in general for large datasets offset pagination is an anti-pattern, and I hope by not supporting
it natively it'll make it a little less likely that I'll use it when I get in a rush.  Obviously its possible
to still implement it using this architecture.  At some point in the future I may give in and do it.

# Testing

Ha! No, seriously - all testing is done using Jest.  To run them:

`yarn test`

# Contributing

Pull requests are welcome, although I'm not sure why you'd be interested!

