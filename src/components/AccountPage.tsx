import * as React from "react";
import { AppContext, AppContextType } from "../context/appContext";
import ChangePasswordForm from "./ChangePasswordForm";
import Header from "./Header";
import Footer from "./Footer";
import title from "../utils/title";

/** Page for configuring account settings. */
export default class AccountPage extends React.Component<object, object> {
  static contextType = AppContext;
  declare context: AppContextType;

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
