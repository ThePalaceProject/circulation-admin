## Changelog

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
