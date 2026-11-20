import * as React from "react";
import * as PropTypes from "prop-types";
import ChangePasswordForm from "./ChangePasswordForm";
import Header from "./Header";
import Footer from "./Footer";
import title from "../utils/title";

export interface AccountPageContext {
  csrfToken: string;
}

/** Page for configuring account settings. */
export default class AccountPage extends React.Component<object, object> {
  context: AccountPageContext;

  static contextTypes: React.ValidationMap<AccountPageContext> = {
    csrfToken: PropTypes.string.isRequired,
  };

  render(): JSX.Element {
    return (
      <div className="account">
        <Header />
        <ChangePasswordForm csrfToken={this.context.csrfToken} />
        <Footer />
      </div>
    );
  }

  UNSAFE_componentWillMount() {
    document.title = title("Account");
  }
}
