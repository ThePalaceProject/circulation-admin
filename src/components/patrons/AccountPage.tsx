// HOC PATTERN: This component is wrapped with withAppContext() at export
// to inject [editorStore, csrfToken] as props, replacing legacy contextTypes.
import * as React from "react";
import { Store } from "@reduxjs/toolkit";
import ChangePasswordForm from "./ChangePasswordForm";
import { RootState } from "../../store";
import Header from "../layout/Header";
import title from "../../utils/title";
import { withAppContext } from "../../utils/withAppContext";

export interface AccountPageProps {
  editorStore?: Store<RootState>;
  csrfToken?: string;
}

/** Page for configuring account settings. */
export class AccountPage extends React.Component<AccountPageProps, object> {
  render(): JSX.Element {
    return (
      <div className="account">
        <Header />
        <ChangePasswordForm
          store={this.props.editorStore}
          csrfToken={this.props.csrfToken}
        />
      </div>
    );
  }

  UNSAFE_componentWillMount() {
    document.title = title("Account");
  }
}

export default withAppContext(AccountPage);
