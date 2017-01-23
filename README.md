# graphql-input-number
[![Build Status](https://travis-ci.org/joonhocho/graphql-input-number.svg?branch=master)](https://travis-ci.org/joonhocho/graphql-input-number)
[![Coverage Status](https://coveralls.io/repos/github/joonhocho/graphql-input-number/badge.svg?branch=master)](https://coveralls.io/github/joonhocho/graphql-input-number?branch=master)
[![npm version](https://badge.fury.io/js/graphql-input-number.svg)](https://badge.fury.io/js/graphql-input-number)
[![Dependency Status](https://david-dm.org/joonhocho/graphql-input-number.svg)](https://david-dm.org/joonhocho/graphql-input-number)
[![License](http://img.shields.io/:license-mit-blue.svg)](http://doge.mit-license.org)

A configurable custom input number type for GraphQL with sanitization and validation.

Checkout [graphql-input-string](https://github.com/joonhocho/graphql-input-string) for validating string inputs.


### Install
```
npm install --save graphql-input-number
```


### Usage
```javascript
import {
  GraphQLInputInt,
  GraphQLInputFloat,
} from 'graphql-input-number';

const argType = GraphQLInputInt({
  name: 'OneToNineInt',
  min: 1,
  max: 9,
});

new GraphQLObjectType({
  name: 'Query',
  fields: {
    input: {
      type: GraphQLInt,
      args: {
        number: {
          type: argType,
        },
      },
      resolve: (_, {number}) => {

        // 'number' IS AN INT BETWEEN 1 to 9.

      };
    },
  },
});
```

### Options
```javascript
GraphQLInputInt({
  // Type name.
  // [REQUIRED]
  name: string = null,

  // Sanitize function that is called at the end of sanitzation phase and before
  // validation phase.
  sanitize: ((number) => number) = null,

  // Minimum value allowed (inclusive).
  min: number = null,

  // Maximum value allowed (inclusive).
  max: number = null,

  // Test function that is called at the end of validation phase.
  test: ((number) => boolean) = null,

  // Custom error handler.
  // May throw an error or return a value.
  // If a value is returned, it will become the final value.
  error: ErrorHandler = () => throw GraphQLError,

  // Parse function that is called after validation phase before returning a
  // value.
  // May throw an error or return a value.
  parse: ((number) => any) = null,

  // If you want to pass some config to type constructor, simply add them here.
  // For example,
  description: string,
});

GraphQLInputFloat({
  ...same as GraphQLInputInt
});


type ErrorInfo = {
  type: string,
  value: number,
  message: ?string,
  ast: ?Ast,
  ...args,
};


type ErrorHandler = (ErrorInfo) => any;
```


### License
```
The MIT License (MIT)

Copyright (c) 2016 Joon Ho Cho

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
