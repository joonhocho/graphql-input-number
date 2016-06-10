import {GraphQLScalarType} from 'graphql';
import {GraphQLError} from 'graphql/error';
import {Kind} from 'graphql/language';


// https://github.com/graphql/graphql-js/blob/master/src/type/scalars.js
const MAX_INT = 2147483647;
const MIN_INT = -2147483648;

function isSafeInteger(num) {
  return typeof num === 'number' &&
    isFinite(num) &&
    Math.floor(num) === num &&
    num <= MAX_INT &&
    num >= MIN_INT;
}

function coerceInt(value) {
  if (value != null) {
    const num = Number(value);
    if (isSafeInteger(num)) {
      return (num < 0 ? Math.ceil : Math.floor)(num);
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
    value = coerceInt(value);
    if (value == null) {
      return null;
    }


    // Sanitization Phase

    if (sanitize) {
      value = sanitize(value);
      if (!isSafeInteger(value)) {
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
    serialize: coerceInt,
    parseValue,
    parseLiteral(ast) {
      const {kind, value} = ast;
      if (kind === Kind.INT) {
        return parseValue(value, ast);
      }
      return null;
    },
  });
};
