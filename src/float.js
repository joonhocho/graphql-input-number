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
  error,
  max,
  min,
  parse,
  sanitize,
  test,
  name,
}) => {
  if (!name) {
    throw new Error('"name" is required');
  }

  if (typeof error !== 'function') {
    error = ({value, ast, message}) => {
      const more = message ? ` ${message}.` : '';
      throw new GraphQLError(
        `Invalid value ${JSON.stringify(value)}.${more}`,
        ast ? [ast] : []
      );
    };
  }

  const parseValue = (value, ast) => {
    value = coerceFloat(value);
    if (value == null) {
      return null;
    }


    // Sanitization Phase

    if (sanitize) {
      value = sanitize(value);
      if (!isSafeFloat(value)) {
        return null;
      }
    }


    // Validation Phase

    if (min != null && value < min) {
      return error({
        type: 'min',
        value,
        min,
        message: `Expected minimum "${min}"`,
        ast,
      });
    }

    if (max != null && value > max) {
      return error({
        type: 'max',
        value,
        max,
        message: `Expected maximum "${max}"`,
        ast,
      });
    }

    if (test && !test(value)) {
      return error({
        type: 'test',
        value,
        test,
        ast,
      });
    }


    // Parse Phase

    if (parse) {
      return parse(value);
    }

    return value;
  };

  return new GraphQLScalarType({
    name,
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
