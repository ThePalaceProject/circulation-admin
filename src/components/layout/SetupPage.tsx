// HOC PATTERN: This component is wrapped with withAppContext() at export
// to inject [editorStore, csrfToken] as props, replacing legacy contextTypes.
import * as React from "react";
import { Store } from "@reduxjs/toolkit";
import IndividualAdmins from "../config/IndividualAdmins";
import { RootState } from "../../store";
import { withAppContext } from "../../utils/withAppContext";

export interface SetupPageProps {
  editorStore?: Store<RootState>;
  csrfToken?: string;
}

/** Page that's displayed the first time the admin interface is opened when
    setting up a new circulation manager. The app knows to show this page based
    on a setting that passed in to the CirculationAdmin constructor from the server.
    The page only allows setting up admin authentication. Once that's done, the
    page will automatically refresh so the admin can log in, and after that the
    full interface will show. */
export class SetupPage extends React.Component<SetupPageProps> {
  render(): JSX.Element {
    return (
      <IndividualAdmins
        store={this.props.editorStore}
        csrfToken={this.props.csrfToken}
        settingUp={true}
        editOrCreate="create"
      />
    );
  }
}

export default withAppContext(SetupPage);
