# circulation-web
Web front-end for the Circulation Manager administrative interface.

[![npm version](https://badge.fury.io/js/simplified-circulation-web.svg)](https://badge.fury.io/js/simplified-circulation-web)

[![Build Status](https://travis-ci.org/NYPL-Simplified/circulation-web.svg?branch=master)](https://travis-ci.org/NYPL-Simplified/circulation-web)

## Setup

This package is meant to be used with the Library Simplified [Circulation Manager](https://github.com/NYPL-Simplified/circulation).

Suggested local setup:
1. `/[path to project folder]/circulation`
2. `/[path to project folder]/circulation-web`

#### Use npm version

To use the published version with your circulation manager, run `npm install` from `api/admin` in the `circulation` local installed repository (1. above).

#### Use local development version

If you're working on the admin interface and want to test local changes, you can link your local clone of this repository to your local circulation manager. Run `npm link` in this repository (2. above), then run `npm link simplified-circulation-web` from `api/admin` in the circulation manager (1. above).

These steps will allow you to work on the front-end admin interface and see updates while developing.

In order to make changes:
1. link the local clone repository to local circulation manager,
2. run the `circulation` manager using `python app.py`,
3. run the `circulation-web` interface using `npm run dev`
4. visit `localhost:6500/admin/`

## Web Catalog

The Circulation Manager admin interface relies on the [OPDS Web Catalog](https://github.com/NYPL-Simplified/opds-web-client) as its base React component and application. For more information, please check out the repository.

## Publishing

This package is [published to npm](https://www.npmjs.com/package/simplified-circulation-web).

To publish a new version, you need to create an npm account and be a collaborator on the package. Then you can run `npm publish` from your local copy of the repository.

## Tests

Like the codebase, all the unit tests are written in Typescript. Tests are written for all React components as well as redux and utility functions, and all can be found in their respective `__tests__` folders.

To run the tests, perform `npm test`.

We use Travis CI for continuous integration and require pull requests tests for a new feature or bug fix to pass on Travis CI.

## License

```
Copyright © 2015 The New York Public Library, Astor, Lenox, and Tilden Foundations

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```
