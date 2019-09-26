import * as React from "react";
import Header from "./Header";
import Footer from "./Footer";
import { Jumbotron } from "react-bootstrap";

export default class WelcomePage extends React.Component<{}, {}> {

  render(): JSX.Element {
    return(
      <div className="welcome-page">
        <Header />
        <Jumbotron>
          <h2>Welcome to the Circulation Admin Interface!</h2>
          <hr></hr>
          <p>
              You don't have any libraries yet.  To get started, go to the System Configuration section and
              <a href="/admin/web/config/libraries/create"> create a new library</a>.
          </p>
        </Jumbotron>
        <Footer />
      </div>
    );
  }
}
