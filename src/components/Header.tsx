import * as React from "react";
import * as ReactDOM from "react-dom";
import BrowserLink from "opds-browser/lib/components/BrowserLink";
import * as fs from "fs";
import logo from "../images/nypl-logo-transparent";
import { Navbar, Nav, NavItem } from "react-bootstrap";

export interface BrowserLinkProps extends React.Props<any> {
  text?: string;
  url: string;
}

export interface HeaderProps extends React.Props<Header> {
  BrowserLink: typeof BrowserLink;
}

export default class Header extends React.Component<HeaderProps, any> {
  render(): JSX.Element {
    let search = this.props.children ? (React.Children.only(this.props.children) as any) : null;
    let BrowserLink = this.props.BrowserLink;

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
              <BrowserLink
                collectionUrl={"/admin/complaints"}
                bookUrl={null}>
                Complaints
              </BrowserLink>
            </li>
            <li>
              <BrowserLink
                collectionUrl={"/admin/suppressed"}
                bookUrl={null}>
                Hidden Books
              </BrowserLink>
            </li>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    );
  }
}