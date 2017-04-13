# CashFarm Store

## Goal

The goal of this library is to facilitate **simple** queries against a relational database.
It was designed from start with denormalized tables in mind. The kind we use when we want
to store projections of events in what becomes the read model, use in CQRS/ES arquitectures.

## API

### Store

The Store class represents a set of objects that can be stored and queried. It's NOT your entity
repository (as in a DDD).

### Table

Table child classes is how you map a DB table. To create a store you'll have to extend the Table class,
define the database table name, fields and primary key.

### Criteria

A class which reads the table definition and allows you to construct queries against it.

## Development

1. Install yarn if you didn't yet (`npm i -g yarn`)
2. Clone the repository
3. From the root of the project run `yarn setup:dev` (or `npm run setup:dev`)

Profit!

To continuously compile and run tests simply run `yarn test:watch`