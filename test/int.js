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
            type: GraphQLInputInt({
              argName: 'value',
              ...options,
            }),
          },
        },
        resolve: (_, {value}) => value,
      },
    },
  }),
});


const testEqual = (schema, done, value, expected) =>
  graphql(schema, `{ input(value: ${JSON.stringify(value)}) }`)
    .then((res) => {
      expect(res.data.input).to.equal(expected);
    })
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
      typeName: 'default',
    });

    const value = 3;
    const expected = value;

    testEqual(schema, done, value, expected);
  });

  it('transform', (done) => {
    const schema = getSchema({
      typeName: 'transform',
      transform: (x) => 2 * x,
    });

    const value = 3;
    const expected = 6;

    testEqual(schema, done, value, expected);
  });

  it('non-int bad', (done) => {
    const schema = getSchema({
      typeName: 'NonInt',
    });

    const value = '3';

    testError(schema, done, value, /type/);
  });

  it('non-int ok', (done) => {
    const schema = getSchema({
      typeName: 'NonInt',
    });

    const value = 3;

    testEqual(schema, done, value, value);
  });

  it('min bad', (done) => {
    const schema = getSchema({
      typeName: 'min',
      min: 3,
    });

    const value = 2;

    testError(schema, done, value, /minimum.*3/);
  });

  it('min ok', (done) => {
    const schema = getSchema({
      typeName: 'min',
      min: 3,
    });

    const value = 3;

    testEqual(schema, done, value, value);
  });

  it('max bad', (done) => {
    const schema = getSchema({
      typeName: 'max',
      max: 5,
    });

    const value = 6;

    testError(schema, done, value, /maximum.*5/);
  });

  it('max ok', (done) => {
    const schema = getSchema({
      typeName: 'max',
      max: 5,
    });

    const value = 5;

    testEqual(schema, done, value, value);
  });

  it('test bad', (done) => {
    const schema = getSchema({
      typeName: 'test',
      test: (x) => x < 3,
    });

    const value = 3;

    testError(schema, done, value, /invalid/);
  });

  it('test ok', (done) => {
    const schema = getSchema({
      typeName: 'test',
      test: (x) => x < 3,
    });

    const value = 2;

    testEqual(schema, done, value, value);
  });

  it('typeName', () => {
    expect(() => GraphQLInputInt({
      argName: 'a',
    })).to.throw(/typeName/);
  });

  it('argName', () => {
    expect(() => GraphQLInputInt({
      typeName: 'a',
    })).to.throw(/argName/);
  });

  it('serialize', (done) => {
    const schema = new GraphQLSchema({
      query: new GraphQLObjectType({
        name: 'Query',
        fields: {
          output: {
            type: GraphQLInputInt({
              typeName: 'output',
              argName: 'output',
              transform: (x) => 2 * x,
            }),
            resolve: () => 3,
          },
        },
      }),
    });

    graphql(schema, '{ output }')
      .then((res) => {
        // transform is only applied to input
        expect(res.data.output).to.equal(3);
      })
      .then(done, done);
  });
});
