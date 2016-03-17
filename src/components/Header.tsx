import * as React from "react";
import * as ReactDOM from "react-dom";
const logo = require("../images/nypl-logo-transparent.png");

export default class Header extends React.Component<any, any> {
  render(): JSX.Element {
    let search = this.props.children ? (React.Children.only(this.props.children) as any) : null;

    let logoStyle = {
      height: "25px",
      display: "inline",
      marginRight: "10px",
      marginTop: "-5px"
    };

    return (
      <nav className="header navbar navbar-default navbar-fixed-top">
        <div className="container-fluid">
          <span className="navbar-brand" style={{ fontSize: "2em", color: "black" }}>
            <img
              style={logoStyle}
              src={logo} />
            NYPL
          </span>

          { search &&
            React.cloneElement(search, { className: "navbar-form navbar-right" })
          }

          <ul className="nav navbar-nav navbar-right" style={{ marginRight: "0px" }}>
            <li>
              { this.props.renderCollectionLink("Complaints", "/admin/complaints") }
            </li>
          </ul>
        </div>
      </nav>
    );
  }
}