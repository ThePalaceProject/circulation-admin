## Changelog

### v0.3.6
#### Fixed
- Fixed a minor button styling bug in the Complaints tab.
- Improved formatting of complaint type names.
- Update the the opds-feed-parser and opds-web-client.

### v0.3.5
#### Updated
- Integrated the Form component from the [https://github.com/NYPL-Simplified/reusable-components](library-simplified-reusable-components) package.

### v0.3.4
#### Updated
- Updated opds-web-client to the latest version, which improves the headings on the book details page.

### v0.3.3
#### Fixed
- Fixed a bug where new lists were unable to save even when new entries were added to them.
- Fixed a bug where saving a newly created list did not redirect to its edit page.

### v0.3.2
#### Fixed
- Deleting a list now also deletes any lanes which contained only that list. Previously, there was no functionality in place to edit or remove any custom lanes when all their custom lists had been deleted.
- Minor styling and bug fixes on the custom list page.

### v0.3.1
#### Fixed
- Fixed a bug involving loading a book cover preview from a URL.

### v0.3.0
#### Updated
- Using React 16 and Enzyme 3.9.

### v0.2.5
#### Updated
- Implemented new styling options for the reusable Button component.

### v0.2.4
#### Updated
- Refactored the Lanes code, and added a button to cancel resetting the lanes.

### v0.2.3
#### Updated
- Specified the node and npm version in package.json.

### v0.2.2
#### Updated
- Improved Nightwatch tests with Page Objects.
#### Fixed
- Alignment of the global search button and the layout for the complaints tab for a book, including updating an input to a Button component.

### v0.2.1
#### Updated
- Improved the performance of the custom lists tab by only fetching the full list of custom lists if they have not already been fetched.
#### Fixed
- Reintroduced Nightwatch and updated tests.

### v0.2.0
#### Updated
- Updated `typings` to `@types`, updated Typescript, updated Webpack, and updated unit tests with fetch-mock. These updates are needed to import the updated `opds-web-client` package.

### v0.1.12
#### Updated
- Updated `reusable-components` to v1.3.1, bringing in the reusable Button component.
- Implemented the new Panel customization option from v1.3.2 of `reusable-components`.

### v0.1.11
#### Fixed
- `package-lock.json` was not insynced with the latest build and caused installing and running test issues.
#### Updated
- Removed `nightwatch` temporarily and updated `reusable-components` to v1.3.0. `nightwatch` brought in `@types` which caused the tests to fail because of compilation issues. Should be brought in soon when other repos have webpack and Typescript updated.

### v0.1.10
#### Updated
- Displaying a different UI for deleted collections. When marked for deletion, a collection will be deleted in the background and this information needs to be conveyed in the UI.
#### Fixed
- Fixed a styling bug affecting the display of exceptions on the Diagnostics page.

### v0.1.9
#### Updated
- Replaced the Collapsible component with a reusable Panel component.

### v0.1.8
#### Updated
- Implemented a language autocomplete field in order to make it easier to set the languages for a library.

### v0.1.7
#### Updated
- Improved the UI for adding multiple inputs in a form.

### v0.1.6
#### Updated
- Improved the process for specifying a library's service and focus areas.

### v0.1.5
#### Fixed
- Fixed minor bug affecting the display for libraries for which registration has failed.

### v0.1.4
#### Added
- Required admins to agree to the terms and conditions before registering or updating a library with a discovery service.

### v0.1.3
#### Added
- Added self-tests for patron authentication integrations.

### v0.1.2
#### Added
- Added self-tests for the ElasticSearch integration.

### v0.1.1
#### Updated
- Improved appearance and readability of Diagnostics page.
- Listed Metadata Services by individual name rather than by protocol.

### v0.1.0
#### Added
- Created a Diagnostics page so that admins can view the output of log scripts which the server has been running behind the scenes.

### v0.0.99
#### Added
- Made it possible to change the order of lanes (within the same parent lane) by dragging and dropping on the lanes page.

### v0.0.98
#### Updated
- Further clarified wording about resetting Adobe IDs.

### v0.0.97
#### Added
- Made it possible for server-side configurations to specify that certain fields should be rendered as textarea elements.

### v0.0.96
#### Fixed
- Displayed initial empty audience and fiction classification values of a book if it didn't have any values. That way, an admin would know that they need to enter values instead of saving and thinking that the book had the correct values.
#### Updated
- Styling on the ClassificationsForm tab for an individual book.

### v0.0.95
#### Updated
- Documentation for the repo.

### v0.0.94
#### Note: this version contains an npm bug. Please upgrade to v0.0.95.
- There's been an issue found in this version of the npm package and we recommend not to use this version.

#### Updated
- Implemented a custom number validator for better error handling.

### v0.0.93
#### Updated
- Further subdivided library form for increased readability.
- Made copy about resetting Adobe IDs more accurate.

### v0.0.92
#### Updated
- Styling for active header nav link.
- Updating the opds-web-client package to 0.1.27 for global element focus color and updating the header focus ring color to white.

### v0.0.91
#### Added
Added a system configuration tab for external catalogs.

### v0.0.90
#### Fixed
- Only showing the "Inherit restrictions from parent lane" setting on the Lane config page when creating child lanes and not a new parent lane.
- Fixing the redirect to the edit Lane form when successfully creating a new Lane.
- Fixing the display message for errors when unsuccessfully creating a new Lane.

### v0.0.89
#### Updated
- Updated the opds-web-client package and passing down a prop to use all languages when doing submitting a search term.

### v0.0.88
#### Added
- Added a welcome message for admins who have no libraries yet.
#### Updated
- Improved the appearance and behavior of the sign-up form.

### v0.0.87
#### Added
- Grouped related fields together in order to make forms more readable.

### v0.0.86
#### Fixed
- Fixed a bug which prevented forms containing collapsible elements from being submitted on enter.

### v0.0.85
#### Fixed
- Fixed a bug involving registering libraries with a discovery service: once a
library is in the production state, the drop-down menu should not be displayed,
i.e. the admin should not be able to change it back to the testing state.
- Fixed the display of success messages on the CDN service form.
#### Added
- The library registration form now provides links to edit the libraries.

### v0.0.84
#### Added
- Updated the form input field labels to explicitly state if an input is required rather than optional. The optional text is now in a field's description. If there are any required fields left blank, they will have an error styling until they are updated. A submitted form with errors will also scroll to the top and focus to the error message so admins know what to fix.

### v0.0.83
#### Fixed
- Checking a flag to see if a setting configuration that supports library registration also supports a staging selection. If the configuration supports staging, the admin can choose between selecting a testing or production stage.

### v0.0.82
#### Fixed
- Fixed a bug involving submitting forms.

### v0.0.81
#### Note: this version contains a bug.  Please upgrade directly to v0.0.82.
#### Added
- Added success messages to configuration forms.
#### Updated
- Moved long configuration instructions into a collapsible panel component, making
the configuration forms easier to read.

### v0.0.80
#### Added
- Added a color picker setting type for configuring background and foreground colors for the web catalog.

### v0.0.79
#### Updated
- Updated how the custom lists in the List admin page are being read. They are now OPDS feeds which help the page load faster. There's now a "Load more" button to fetch more entries in an existing custom list.

### v0.0.78
#### Fixed
- Fixed a bug for new collections that could not correctly fetch self test results.

### v0.0.77
#### Added
- Added the ability for an admin to register a library in either the "testing" or "production" stage with the Library Registry.

### v0.0.76
#### Added
- Implemented the Patron Manager page, on which admins can look up patrons by their barcode and can reset their Adobe IDs.
