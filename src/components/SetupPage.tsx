import * as React from "react";
import { Store } from "redux";
import IndividualAdmins from "./IndividualAdmins";
import { State } from "../reducers/index";

export interface SetupPageContext {
  editorStore: Store<State>;
  csrfToken: string;
  settingUp: boolean;
}

/** Page that's displayed the first time the admin interface is opened when
    setting up a new circulation manager. The app knows to show this page based
    on a setting that passed in to the CirculationWeb constructor from the server.
    The page only allows setting up admin authentication. Once that's done, the
    page will automatically refresh so the admin can log in, and after that the
    full interface will show. */
export default class SetupPage extends React.Component<void, void> {
  context: SetupPageContext;

  static contextTypes: React.ValidationMap<SetupPageContext> = {
    editorStore: React.PropTypes.object.isRequired,
    csrfToken: React.PropTypes.string.isRequired,
    settingUp: React.PropTypes.bool.isRequired,
  };

  render(): JSX.Element {
    return (
      <IndividualAdmins
        store={this.context.editorStore}
        csrfToken={this.context.csrfToken}
        settingUp={this.context.settingUp}
        editOrCreate="create"
        />
    );
  }
}
