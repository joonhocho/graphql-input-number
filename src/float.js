import {GraphQLScalarType} from 'graphql';
import {GraphQLError} from 'graphql/error';
import {Kind} from 'graphql/language';

const coerceValue = (value) => value;

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
    throw new GraphQLError(`Argument "${argName}" has invalid value ${JSON.stringify(value)}.${message ? ` ${message}` : ''}.`, [ast]);
  };

  return new GraphQLScalarType({
    name: typeName,
    serialize: coerceValue,
    parseValue: coerceValue,
    parseLiteral(ast) {
      let {kind, value} = ast;
      if (kind !== Kind.FLOAT) {
        error(value, ast, 'Expected type "Float"');
      }

      if (transform) {
        value = transform(value);
      }

      if (min != null && value < min) {
        error(value, ast, `Expected minimum "${min}"`);
      }

      if (max != null && value > max) {
        error(value, ast, `Expected maximum "${max}"`);
      }

      if (test && !test(value)) {
        error(value, ast);
      }

      return value;
    },
  });
};
