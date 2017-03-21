import * as React from "react";
import * as ReactDOM from "react-dom";
import CatalogLink from "opds-web-client/lib/components/CatalogLink";
import { Link } from "react-router";
import { Navbar, Nav, NavItem } from "react-bootstrap";

export interface HeaderProps extends React.Props<Header> {
}

export default class Header extends React.Component<HeaderProps, any> {
  context: { homeUrl: string };

  static contextTypes = {
    homeUrl: React.PropTypes.string.isRequired
  };

  render(): JSX.Element {
    return (
      <Navbar fluid={true}>
        <Navbar.Header>
          <Navbar.Brand>
            Admin
          </Navbar.Brand>
          <Navbar.Toggle />
        </Navbar.Header>

        <Navbar.Collapse>
          <Nav>
            <li>
              <CatalogLink
                collectionUrl={this.context.homeUrl}
                bookUrl={null}>
                Catalog
              </CatalogLink>
            </li>
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
            <li>
              <Link to="/admin/web/dashboard">Dashboard</Link>
            </li>
            <li>
              <Link to="/admin/web/config">Configuration</Link>
            </li>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    );
  }
}