import {
  graphql,
  GraphQLSchema,
  GraphQLFloat,
  GraphQLObjectType,
} from 'graphql';
import {describe, it} from 'mocha';
import {expect} from 'chai';
import {GraphQLInputFloat} from '../lib';


const getSchema = (options) => new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: {
      input: {
        type: GraphQLFloat,
        args: {
          value: {
            type: GraphQLInputFloat(options),
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


describe('GraphQLInputFloat', () => {
  it('default', (done) => {
    const schema = getSchema({
      name: 'default',
    });

    const value = 3.1;
    const expected = value;

    testEqual(schema, done, value, expected);
  });

  it('sanitize', (done) => {
    const schema = getSchema({
      name: 'sanitize',
      sanitize: (x) => 2 * x,
    });

    const value = 3.1;
    const expected = 6.2;

    testEqual(schema, done, value, expected);
  });

  it('non-float bad', (done) => {
    const schema = getSchema({
      name: 'NonFloat',
    });

    const value = '3.1';

    testError(schema, done, value, /type/i);
  });

  it('non-float ok', (done) => {
    const schema = getSchema({
      name: 'NonFloat',
    });

    const value = 3.1;

    testEqual(schema, done, value, value);
  });

  it('min bad', (done) => {
    const schema = getSchema({
      name: 'min',
      min: 3,
    });

    const value = 2.9;

    testError(schema, done, value, /minimum.*3/i);
  });

  it('min ok', (done) => {
    const schema = getSchema({
      name: 'min',
      min: 3,
    });

    const value = 3.1;

    testEqual(schema, done, value, value);
  });

  it('max bad', (done) => {
    const schema = getSchema({
      name: 'max',
      max: 5,
    });

    const value = 5.1;

    testError(schema, done, value, /maximum.*5/i);
  });

  it('max ok', (done) => {
    const schema = getSchema({
      name: 'max',
      max: 5,
    });

    const value = 4.9;

    testEqual(schema, done, value, value);
  });

  it('test bad', (done) => {
    const schema = getSchema({
      name: 'test',
      test: (x) => x < 3,
    });

    const value = 3.1;

    testError(schema, done, value, /invalid/i);
  });

  it('test ok', (done) => {
    const schema = getSchema({
      name: 'test',
      test: (x) => x < 3,
    });

    const value = 2.9;

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

    const value = 3.1;
    const expected = 6.2;

    testEqual(schema, done, value, expected);
  });

  it('name', () => {
    expect(() => GraphQLInputFloat({
      // name is required
    })).to.throw(/name/i);
  });

  it('serialize', (done) => {
    const schema = new GraphQLSchema({
      query: new GraphQLObjectType({
        name: 'Query',
        fields: {
          output: {
            type: GraphQLInputFloat({
              name: 'output',
              parse: (x) => 2 * x,
            }),
            resolve: () => 3.1,
          },
        },
      }),
    });

    graphql(schema, '{ output }')
      .then((res) => {
        // parse is only applied to input
        expect(res.data.output).to.equal(3.1);
      })
      .then(done, done);
  });
});
