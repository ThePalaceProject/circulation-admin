# circulation-web

Web front-end for the Circulation Manager administrative interface.

[![npm version](https://badge.fury.io/js/simplified-circulation-web.svg)](https://badge.fury.io/js/simplified-circulation-web)

[![Build Status](https://travis-ci.org/NYPL-Simplified/circulation-web.svg?branch=main)](https://travis-ci.org/NYPL-Simplified/circulation-web)

## Library Simplified Documentation

To see screenshots, read in-depth documentation, and find out more about the project, check out the [Confluence](https://confluence.nypl.org/display/SIM/) site hosted by The New York Public Library.

## Set Up

This package is meant to be used with the Library Simplified [Circulation Manager](https://github.com/NYPL-Simplified/circulation), and cannot be run in isolation. Please follow the Circulation Manager README instructions before setting up this repository.

#### Use NPM Version

Suggested local folder setup:

- `/[path to project folder]/circulation`

To use the published version with your circulation manager, run `npm install` from `api/admin` in the `circulation` local installed repository.

#### Use Local Development Version

Suggested local folder setup:

- `/[path to project folder]/circulation`
- `/[path to project folder]/circulation-web`

If you're working on the administrative interface and want to test local changes, you can link your local clone of this repository to your local circulation manager. These steps will allow you to work on the front-end administrative interface and see updates while developing.

1. Run `npm link` in this `circulation-web` repository,
2. run `npm link simplified-circulation-web` from `api/admin` in the `circulation` repository (which is where package.json is located),
3. run the circulation manager using `python app.py` at the root in the `circulation` repository,
4. run the web interface using `npm run dev` at the root of this `circulation-web` repository,
5. run the Elasticsearch server using `./bin/elasticsearch` in the elasticsearch-[version] directory,
6. visit `localhost:6500/admin/`.

Webpack will take care of compiling and updating any new changes made locally for development. Just hard refresh the page (command + shift + R) to see updates without having to restart either the `circulation` or `circulation-web` servers.

## Web Catalog

The Circulation Manager administrative interface relies on the [OPDS Web Catalog](https://github.com/NYPL-Simplified/opds-web-client) as its base React component and application. For more information, please check out that repository.

## Publishing a New Release

Before publishing a new release, update the version number in package.json and add the new version number + comments about what the new version includes to CHANGELOG.md. For new version numbers, you can refer to [Semantic Versioning](https://semver.org/) (major.minor.patch). Then, run `npm install` to update the package-lock.json file to include the new version.

Commit your changes, push them to Github, make a PR, and request your reviewer. Once approved, you may go back to your local repository, checkout the main branch, and `git pull`.

This package is [published to npm](https://www.npmjs.com/package/simplified-circulation-web). To publish a new version, you need to create an npm account and be a collaborator on the package.

If you're not already logged in to npm from your terminal, you'll have to do so at this point. Run `npm login` and enter your credentials when prompted.

Then, you can run `npm publish` from your local copy of the repository.

Afterwards, you should tag the release and add comments to Github. On the main branch, run `git tag -a v[version number] -m '[commit message]'`. Then run `git push origin v[version number]`.

Go to the Github repository, click on "tags," find the tag you pushed, click on it and hit "edit." Add a release title, and a description. Then save by clicking, "Update Release."

## Accessibility

In order to develop user interfaces that are accessible to everyone, there are tools added to the workflow. Besides the Typescript `tslint-react-a11y` plugin, `react-axe` is also installed for local development. Using that module while running the app uses a lot of resources so it should be only when specifically testing for accessibility and not while actively developing new features or fixing bugs.

In order to run the app with `react-axe`, run `npm run dev-test-axe`. This will add a local global variable `process.env.TEST_AXE` (through webpack) that will trigger `react-axe` in `/src/index.tsx`. The output will be seen in the _browser's_ console terminal.

## Tests

### Unit Tests

Like the codebase, all the unit tests are written in Typescript. Tests are written for all React components as well as redux and utility functions, and all can be found in their respective `__tests__` folders.

To run the tests, perform `npm test`.

We use Travis CI for continuous integration. Any pull requests submitted must have tests and those tests must pass on Travis CI.

### Nightwatch

There are end-to-end tests that run on Nightwatch. This selenium-based test runner allows us to include integration tests for logging into the admin and clicking through different pages.

To set up credentials and run the tests, check out the [README](/tests/README.md) in `/tests/.

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
