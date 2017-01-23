import {
  graphql,
  GraphQLSchema,
  GraphQLInt,
  GraphQLObjectType,
} from 'graphql';
import {describe, it} from 'mocha';
import {expect} from 'chai';
import {GraphQLInputInt} from '../lib';


const getSchema = (options) => new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: {
      input: {
        type: GraphQLInt,
        args: {
          value: {
            type: GraphQLInputInt(options),
          },
        },
        resolve: (_, {value}) => value,
      },
    },
  }),
});


const runQuery = (schema, value) =>
  graphql(schema, `{ input(value: ${JSON.stringify(value)}) }`)
    .then((res) => res.data.input);

const testEqual = (schema, done, value, expected) =>
  runQuery(schema, value)
    .then((input) => { expect(input).to.eql(expected); })
    .then(done, done);

const testError = (schema, done, value, expected) =>
  graphql(schema, `{ input(value: ${JSON.stringify(value)}) }`)
    .then((res) => {
      expect(res.errors[0].message).to.match(expected);
    })
    .then(done, done);


describe('GraphQLInputInt', () => {
  it('default', (done) => {
    const schema = getSchema({
      name: 'default',
    });

    const value = 3;
    const expected = value;

    testEqual(schema, done, value, expected);
  });

  it('sanitize', (done) => {
    const schema = getSchema({
      name: 'sanitize',
      sanitize: (x) => 2 * x,
    });

    const value = 3;
    const expected = 6;

    testEqual(schema, done, value, expected);
  });

  it('non-int bad', (done) => {
    const schema = getSchema({
      name: 'NonInt',
    });

    const value = '3';

    testError(schema, done, value, /type/i);
  });

  it('non-int ok', (done) => {
    const schema = getSchema({
      name: 'NonInt',
    });

    const value = 3;

    testEqual(schema, done, value, value);
  });

  it('min bad', (done) => {
    const schema = getSchema({
      name: 'min',
      min: 3,
    });

    const value = 2;

    testError(schema, done, value, /minimum.*3/i);
  });

  it('min ok', (done) => {
    const schema = getSchema({
      name: 'min',
      min: 3,
    });

    const value = 3;

    testEqual(schema, done, value, value);
  });

  it('max bad', (done) => {
    const schema = getSchema({
      name: 'max',
      max: 5,
    });

    const value = 6;

    testError(schema, done, value, /maximum.*5/i);
  });

  it('max ok', (done) => {
    const schema = getSchema({
      name: 'max',
      max: 5,
    });

    const value = 5;

    testEqual(schema, done, value, value);
  });

  it('test bad', (done) => {
    const schema = getSchema({
      name: 'test',
      test: (x) => x < 3,
    });

    const value = 3;

    testError(schema, done, value, /invalid/i);
  });

  it('test ok', (done) => {
    const schema = getSchema({
      name: 'test',
      test: (x) => x < 3,
    });

    const value = 2;

    testEqual(schema, done, value, value);
  });

  it('error', (done) => {
    const schema = getSchema({
      name: 'error',
      min: 3,
      error: (err) => err.value - 3,
    });

    const value = 2;

    runQuery(schema, value)
      .then((input) => {
        expect(input).to.equal(-1);
      })
      .then(done, done);
  });

  it('parse', (done) => {
    const schema = getSchema({
      name: 'parse',
      max: 5,
      parse: (x) => 2 * x,
    });

    const value = 3;
    const expected = 6;

    testEqual(schema, done, value, expected);
  });

  it('name', () => {
    expect(() => GraphQLInputInt({
      // name is required
    })).to.throw(/name/i);
  });

  it('description', () => {
    const description = 'this is description';
    const type = GraphQLInputInt({
      name: 'desc',
      description,
    });
    expect(type.description).to.equal(description);
  });

  it('serialize', (done) => {
    const schema = new GraphQLSchema({
      query: new GraphQLObjectType({
        name: 'Query',
        fields: {
          output: {
            type: GraphQLInputInt({
              name: 'output',
              parse: (x) => 2 * x,
            }),
            resolve: () => 3,
          },
        },
      }),
    });

    graphql(schema, '{ output }')
      .then((res) => {
        // parse is only applied to input
        expect(res.data.output).to.equal(3);
      })
      .then(done, done);
  });
});
