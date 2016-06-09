import {GraphQLScalarType} from 'graphql';
import {GraphQLError} from 'graphql/error';
import {Kind} from 'graphql/language';


// https://github.com/graphql/graphql-js/blob/master/src/type/scalars.js

function isSafeFloat(num) {
  return typeof num === 'number' &&
    isFinite(num);
}

function coerceFloat(value) {
  if (value != null) {
    const num = Number(value);
    if (isSafeFloat(num)) {
      return num;
    }
  }
  return null;
}

export default ({
  typeName,
  argName,
  transform,
  min,
  max,
  test,
}) => {
  if (!typeName) {
    throw new Error('"typeName" is required');
  }

  if (!argName) {
    throw new Error('"argName" is required');
  }

  const error = (value, ast, message) => {
    throw new GraphQLError(`Argument "${argName}" has invalid value ${JSON.stringify(value)}.${message ? ` ${message}` : ''}.`, ast ? [ast] : []);
  };

  const parseValue = (value, ast) => {
    value = coerceFloat(value);
    if (value == null) {
      return null;
    }

    if (transform) {
      value = transform(value);
      if (!isSafeFloat(value)) {
        return null;
      }
    }

    if (min != null && value < min) {
      error(value, ast, `Expected minimum "${min}"`);
    }

    if (max != null && value > max) {
      error(value, ast, `Expected maximum "${max}"`);
    }

    if (test && !test(value)) {
      return null;
    }

    return value;
  };

  return new GraphQLScalarType({
    name: typeName,
    serialize: coerceFloat,
    parseValue,
    parseLiteral(ast) {
      const {kind, value} = ast;
      if (kind === Kind.FLOAT || kind === Kind.INT) {
        return parseValue(value, ast);
      }
      return null;
    },
  });
};
