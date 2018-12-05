import * as React from "react";
import { Store } from "redux";
import ChangePasswordForm from "./ChangePasswordForm";
import { State } from "../reducers/index";
import Header from "./Header";

export interface AccountPageContext {
  editorStore: Store<State>;
  csrfToken: string;
}

/** Page for configuring account settings. */
export default class AccountPage extends React.Component<void, void> {
  context: AccountPageContext;

  static contextTypes: React.ValidationMap<AccountPageContext> = {
    editorStore: React.PropTypes.object.isRequired,
    csrfToken: React.PropTypes.string.isRequired,
  };


  render(): JSX.Element {
    return (
      <div className="account">
        <Header />
        <ChangePasswordForm
          store={this.context.editorStore}
          csrfToken={this.context.csrfToken}
          />
      </div>
    );
  }

  componentWillMount() {
    document.title = "Circulation Manager - Account";
  }
}
