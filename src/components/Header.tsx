import * as React from "react";
import * as ReactDOM from "react-dom";
import CatalogLink from "opds-web-client/lib/components/CatalogLink";
import * as fs from "fs";
import logo from "../images/nypl-logo-transparent";
import { Navbar, Nav, NavItem } from "react-bootstrap";

export interface HeaderProps extends React.Props<Header> {
  CatalogLink: typeof CatalogLink;
}

export default class Header extends React.Component<HeaderProps, any> {
  render(): JSX.Element {
    let search = this.props.children ? (React.Children.only(this.props.children) as any) : null;
    let CatalogLink = this.props.CatalogLink;

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

          <Nav>
            <li>
              <CatalogLink
                collectionUrl={"/admin/complaints"}
                bookUrl={null}>
                Complaints
              </CatalogLink>
            </li>
            <li>
              <CatalogLink
                collectionUrl={"/admin/suppressed"}
                bookUrl={null}>
                Hidden Books
              </CatalogLink>
            </li>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    );
  }
}