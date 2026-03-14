import * as React from "react";
import Header from "./Header";
import Footer from "./Footer";

export default class WelcomePage extends React.Component<
  Record<string, never>,
  Record<string, never>
> {
  render(): JSX.Element {
    return (
      <div className="welcome-page">
        <Header />
        <div className="welcome-hero">
          <h2>Welcome to the Circulation Admin Interface!</h2>
          <hr></hr>
          <p>
            You don't have any libraries yet. To get started, go to the System
            Configuration section and
            <a href="/admin/web/config/libraries/create">
              {" "}
              create a new library
            </a>
            .
          </p>
        </div>
        <Footer />
      </div>
    );
  }
}
