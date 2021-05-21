# Circulation Manager Administrative Interface

[![Test](https://github.com/ThePalaceProject/circulation-admin/actions/workflows/test.yml/badge.svg)](https://github.com/ThePalaceProject/circulation-admin/actions/workflows/test.yml)
[![npm version](https://badge.fury.io/js/%40thepalaceproject%2Fcirculation-admin.svg)](https://badge.fury.io/js/%40thepalaceproject%2Fcirculation-admin)
[![Deploy Documentation](https://github.com/ThePalaceProject/circulation-admin/actions/workflows/gh-pages.yml/badge.svg)](https://github.com/ThePalaceProject/circulation-admin/actions/workflows/gh-pages.yml)
[![jsDelivr](https://data.jsdelivr.com/v1/package/npm/@thepalaceproject/circulation-admin/badge)](https://www.jsdelivr.com/package/npm/@thepalaceproject/circulation-admin)

This is a fork of the NYPL [Library Simplified](http://www.librarysimplified.org/) Circulation Manager administrative interface maintained and updated for the Palace Project.

## Setup

This package is meant to be used with the Library Simplified [Circulation Manager](https://github.com/NYPL-Simplified/circulation).

#### NPM version

The published version is pulled into your circulation manager automatically using the jsDelivr CDN.

#### Local development version

Suggested local folder setup:

- `/[path to project folder]/circulation`
- `/[path to project folder]/circulation-admin`

If you're working on the administrative interface and want to test local changes, you can link your local clone of this repository to your local circulation manager. These steps will allow you to work on the front-end administrative interface and see updates while developing.

1. Run `npm link` in this `circulation-admin` repository
2. run `npm link @thepalaceproject/circulation-admin` from `api/admin` in the `circulation` repository
3. run the circulation manager using `python app.py` at the root in the `circulation` repository
4. run the web interface using `npm run dev` at the root of this `circulation-admin` repository
5. visit `localhost:6500/admin/`

Webpack will take care of compiling and updating any new changes made locally for development. Just refresh the page to see updates without having to restart either the `circulation` or `circulation-admin` servers.

## Web Catalog

The Circulation Manager administrative interface relies on the [OPDS Web Catalog](https://github.com/NYPL-Simplified/opds-web-client) as its base React component and application. For more information, please check out the repository.

## Publishing

This package is [published to npm](https://www.npmjs.com/package/@thepalaceproject/circulation-admin).

A new version is published by github CI each time a release is created in this github repository. This CI process should be used for all releases. Releases should not be manually published to NPM.

We recommend using the release by including the files from the [jsDelivr CDN](https://www.jsdelivr.com/package/npm/@thepalaceproject/circulation-admin).

## Accessibility

In order to develop user interfaces that are accessible to everyone, there are tools added to the workflow. Besides the Typescript `tslint-react-a11y` plugin, `react-axe` is also installed for local development. Using that module while running the app uses a lot of resources so it should be only when specifically testing for accessibility and not while actively developing new features or fixing bugs.

In order to run the app with `react-axe`, run `npm run dev-test-axe`. This will add a local global variable `process.env.TEST_AXE` (through webpack) that will trigger `react-axe` in `/src/index.tsx`. The output will be seen in the _browser's_ console terminal.

## Tests

### Unit Tests

Like the codebase, all the unit tests are written in Typescript. Tests are written for all React components as well as redux and utility functions, and all can be found in their respective `__tests__` folders.

To run the tests, perform `npm test`.

We use Github Actions for continuous integration. Any pull requests submitted must have tests and those tests must pass when CI is run automatically on the pull request.

### Nightwatch

There are end-to-end tests that run on Nightwatch. This selenium-based test runner allows us to include integration tests for logging into the admin and clicking through different pages.

To set up credentials and run the tests, check out the [README](/tests/README.md) in `/tests/`.
