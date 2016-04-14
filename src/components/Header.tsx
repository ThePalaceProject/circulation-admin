import * as React from "react";
import * as ReactDOM from "react-dom";
import { Navigate } from "../interfaces";
import { PathFor } from "opds-browser/lib/interfaces";
import CollectionLink from "opds-browser/lib/components/CollectionLink";
import * as fs from "fs";
import logo from "../images/nypl-logo-transparent";
import { Navbar, Nav, NavItem } from "react-bootstrap";

export interface CollectionLinkProps extends React.Props<any> {
  text?: string;
  url: string;
  navigate?: Navigate;
  pathFor?: PathFor;
}

export interface HeaderContext {
  navigate: Navigate;
  pathFor: PathFor;
}

export interface HeaderProps extends React.Props<Header> {
  CollectionLink: typeof CollectionLink;
}

export default class Header extends React.Component<HeaderProps, any> {
  context: HeaderContext;

  static contextTypes = {
    navigate: React.PropTypes.func.isRequired,
    pathFor: React.PropTypes.func.isRequired
  };

  render(): JSX.Element {
    let search = this.props.children ? (React.Children.only(this.props.children) as any) : null;
    let CollectionLink = this.props.CollectionLink;

    let logoStyle = {
      height: "25px",
      display: "inline",
      marginRight: "10px",
      marginTop: "-5px"
    };

    return (
      <Navbar fluid={true} fixedTop={true}>
        <Navbar.Header>
          <Navbar.Brand>
            <img
              style={logoStyle}
              src={logo} />
            NYPL
          </Navbar.Brand>
          <Navbar.Toggle />
        </Navbar.Header>

        <Navbar.Collapse>
          { search &&
            <Nav pullRight>
              { React.cloneElement(search, { className: "navbar-form navbar-right" }) }
            </Nav>
          }

          <Nav pullRight>
            <li>
              <CollectionLink
                text={"Complaints"}
                url={"/admin/complaints"}
                navigate={this.context.navigate}
                pathFor={this.context.pathFor}
                />
            </li>
            <li>
              <CollectionLink
                text={"Hidden books"}
                url={"/admin/suppressed"}
                navigate={this.context.navigate}
                pathFor={this.context.pathFor}
                />
            </li>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    );
  }
}