import * as React from "react";
import * as PropTypes from "prop-types";
import IndividualAdmins from "./IndividualAdmins";

export interface SetupPageContext {
  csrfToken: string;
}

/** Page that's displayed the first time the admin interface is opened when
    setting up a new circulation manager. The app knows to show this page based
    on a setting that passed in to the CirculationAdmin constructor from the server.
    The page only allows setting up admin authentication. Once that's done, the
    page will automatically refresh so the admin can log in, and after that the
    full interface will show. */
export default class SetupPage extends React.Component<object> {
  context: SetupPageContext;

  static contextTypes: React.ValidationMap<SetupPageContext> = {
    csrfToken: PropTypes.string.isRequired,
  };

  render(): JSX.Element {
    return (
      <IndividualAdmins
        csrfToken={this.context.csrfToken}
        settingUp={true}
        editOrCreate="create"
      />
    );
  }
}
