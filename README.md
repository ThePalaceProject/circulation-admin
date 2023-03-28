# Circulation Manager Administrative Interface

[![Test Client & Deploy Documentation](https://github.com/lyrasis/simplye-circulation-web/actions/workflows/test-and-deploy.yml/badge.svg?branch=main)](https://github.com/lyrasis/simplye-circulation-web/actions/workflows/test-and-deploy.yml)

This is a [LYRASIS](http://lyrasis.org)-maintained fork of the NYPL [Library Simplified](http://www.librarysimplified.org/) Circulation Manager administrative interface.

## Library Simplified Documentation

To see screenshots, read in-depth documentation, and find out more about the project, check out the [Confluence](https://confluence.nypl.org/display/SIM/) site hosted by The New York Public Library.

## Set Up

This package may be used in a local build of the Palace Project [Circulation Manager](https://github.com/ThePalaceProject/circulation), or it may be run against a remote Circulation Manager.

This project uses node 18. We recommend the latest version of node 18.

You have a number of options for installing node. One convenient way on macOS is to use Homebrew and nvm to manage node versions.

Install Homebrew if you have not already:

```
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

Install nvm using Homebrew:

```
brew install nvm
```

Install and use the latest version of node 18, e.g. 18.14.2 with nvm:

```
nvm install 18.14.2
nvm use 18.14.2
```

Alternatively, you can use `nodenv` on macOS:

```
brew install nodenv
nodenv install 18.14.2
nodenv global 18.14.2
```

If you have different projects requiring different node versions, you can use nodenv to set a local version for the project by navigating to the root directory of circulation-admin and executing `nodenv local 18.14.2`.

You can also use the `n` npm package to manage Node versions, or simply install the Node binary directly.

This project uses the latest version of npm. You can update npm with `npm update -g npm`. You can confirm the versions of node and npm you are using with `node --version` and `npm --version`.

Once you have installed the correct versions of Node and npm, run `npm i` to install all dependencies.

#### Use npm-Published Version in a Local Circulation Manager

Suggested local folder setup:

- `/[path to project folder]/circulation`

To use the published version with your circulation manager, run `npm install` from `api/admin` in the `circulation` local installed repository.

#### Use Local Development Version in a Local Circulation Manager

Follow the Circulation Manager README instructions before setting up this repository.

Suggested local folder setup:

- `/[path to project folder]/circulation`
- `/[path to project folder]/circulation-admin`

If you're working on the administrative interface and want to test local changes, you can link your local clone of this repository to your local circulation manager. These steps will allow you to work on the front-end administrative interface and see updates while developing.

1. Run `npm link` in this `circulation-admin` repository,
2. run `npm link @thepalaceproject/circulation-admin` from `api/admin` in the `circulation` repository (which is where package.json is located),
3. run the circulation manager using `python app.py` at the root in the `circulation` repository,
4. run the web interface using `npm run dev` at the root of this `circulation-admin` repository,
5. run the Elasticsearch server using `./bin/elasticsearch` in the elasticsearch-[version] directory,
6. visit `localhost:6500/admin/`.

Webpack will take care of compiling and updating any new changes made locally for development. Just hard refresh the page (command + shift + R) to see updates without having to restart either the `circulation` or `circulation-admin` servers.

#### Use Local Development Version with a Remote Circulation Manager

This front-end may be run locally in development against a remote Circulation Manager back-end. This removes the need to build a local Circulation Manager from source in order to work on the front-end.

1. Run `npm run dev-server -- --env=backend=[url]` in this `circulation-admin` repository.

   Example: `npm run dev-server -- --env=backend=https://gorgon.tpp-qa.lyrasistechnology.org`

   Note: The tortured syntax here results from going through npm and webpack. The first `--` separates arguments intended for npm from arguments intended for the script that npm runs. In this case the script executes webpack, which allows an environment object to be supplied on the command line using `--env`. Properties of the environment object are specified using the `--env=[property]=[value]` syntax.

1. Visit `http://localhost:8080/admin/`.
1. Log in using credentials for the CM back-end. Content from that Circulation Manager should appear.

This works by running a local proxy server. HTML pages received from the Circulaton Manager that load assets from the `circulation-admin` package on jsdelivr are rewritten to load them from the local webpack build instead.

Webpack will take care of compiling and updating any new changes made locally for development. Hot module replacement and live reloading are enabled, so the browser will automatically update as changes are made.

## Web Catalog

The Circulation Manager administrative interface relies on the [OPDS Web Catalog](https://github.com/ThePalaceProject/web-opds-client) as its base React component and application. For more information, please check out that repository.

## Publishing a New Release

Before publishing a new release, update the version number in package.json and add the new version number + comments about what the new version includes to CHANGELOG.md. For new version numbers, you can refer to [Semantic Versioning](https://semver.org/) (major.minor.patch). Then, run `npm install` to update the package-lock.json file to include the new version.

Commit your changes, push them to Github, make a PR, and request your reviewer. Once approved, you may go back to your local repository, checkout the main branch, and `git pull`.

This package is [published to npm](https://www.npmjs.com/package/simplified-circulation-web). To publish a new version, you need to create an npm account and be a collaborator on the package.

If you're not already logged in to npm from your terminal, you'll have to do so at this point. Run `npm login` and enter your credentials when prompted.

Then, you can run `npm publish` from your local copy of the repository (ensure you are on the main branch before doing so).

Afterwards, you should tag the release and add comments to Github. On the main branch, run `git tag -a v[version number] -m '[commit message]'`. Then run `git push origin v[version number]`.

Go to the Github repository, click on "tags," find the tag you pushed, click on it and hit "edit." Add a release title, and a description. Then save by clicking, "Update Release."

## Accessibility

In order to develop user interfaces that are accessible to everyone, there are tools added to the workflow. Besides the Typescript `tslint-react-a11y` plugin, `react-axe` is also installed for local development. Using that module while running the app uses a lot of resources so it should be only when specifically testing for accessibility and not while actively developing new features or fixing bugs.

In order to run the app with `react-axe`, run `npm run dev-test-axe`. This will add a local global variable `process.env.TEST_AXE` (through webpack) that will trigger `react-axe` in `/src/index.tsx`. The output will be seen in the _browser's_ console terminal.

## Tests

### Unit Tests

Like the codebase, all the unit tests are written in Typescript. Tests are written for all React components as well as redux and utility functions. Older tests are run using mocha and these tests can be found in the `__tests__` folders littered throughout the `src` tree. All new tests should be written using jest and placed in the `tests/jest` directory. The directory structure in `tests/jest` should mirror the structure in `src`.

To run the tests, perform `npm test`.

We use GitHub Actions for continuous integration. Any pull requests submitted must have tests and those tests must pass on GitHub Actions.

### Nightwatch

There are end-to-end tests that run on Nightwatch. This selenium-based test runner allows us to include integration tests for logging into the admin and clicking through different pages.

To set up credentials and run the tests, check out the [README](/tests/README.md) in `/tests/.

## Debugging

The [Redux DevTools browser extension](https://github.com/reduxjs/redux-devtools/tree/main/extension) may be used to easily inspect app states and state transitions.

## License

```
Copyright © 2021 The New York Public Library, Astor, Lenox, and Tilden Foundations

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
