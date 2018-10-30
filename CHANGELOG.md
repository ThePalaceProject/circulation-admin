## Changelog

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
