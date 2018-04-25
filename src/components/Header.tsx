import * as React from "react";
import * as ReactDOM from "react-dom";
import { connect } from "react-redux";
import { Store } from "redux";
import { State } from "../reducers/index";
import ActionCreator from "../actions";
import { LibraryData, LibrariesData } from "../interfaces";
import Admin from "../models/Admin";
import EditableInput from "./EditableInput";
import CatalogLink from "opds-web-client/lib/components/CatalogLink";
import { Link } from "react-router";
import { Navbar, Nav, NavItem } from "react-bootstrap";
import { Router } from "opds-web-client/lib/interfaces";

export interface HeaderStateProps {
  libraries?: LibraryData[];
}

export interface HeaderDispatchProps {
  fetchLibraries?: () => Promise<LibrariesData>;
}

export interface HeaderOwnProps {
  store?: Store<State>;
}

export interface HeaderProps extends React.Props<Header>, HeaderStateProps, HeaderDispatchProps, HeaderOwnProps {}

export interface HeaderState {
  showAccountDropdown: boolean;
}

/** Header of all admin interface pages, with a dropdown for selecting a library,
    library-specific links for the current library, and site-wide links. */
export class Header extends React.Component<HeaderProps, HeaderState> {
  context: { library: () => string, router: Router, admin: Admin };

  static contextTypes = {
    library: React.PropTypes.func,
    router: React.PropTypes.object.isRequired,
    admin: React.PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);
    this.state = { showAccountDropdown: false };
    this.changeLibrary = this.changeLibrary.bind(this);
    this.toggleAccountDropdown = this.toggleAccountDropdown.bind(this);
  }

  render(): JSX.Element {
    return (
      <Navbar fluid={true}>
        <Navbar.Header>
          <Navbar.Brand>
            Admin
          </Navbar.Brand>
          { this.props.libraries && this.props.libraries.length > 0 &&
            <EditableInput
              elementType="select"
              ref="library"
              value={this.context.library && this.context.library()}
              onChange={this.changeLibrary}
              >
              { !this.context.library &&
                <option>Select a library</option>
              }
              { this.props.libraries.map(library =>
                  <option key={library.short_name} value={library.short_name}>{library.name || library.short_name}</option>
                )
              }
            </EditableInput>
          }
          <Navbar.Toggle />
        </Navbar.Header>

        <Navbar.Collapse>
          { this.context.library && this.context.library() &&
            <Nav>
              <li>
                <CatalogLink
                  collectionUrl={"/" + this.context.library() + "/groups"}
                  bookUrl={null}>
                  Catalog
                </CatalogLink>
              </li>
              <li>
                <CatalogLink
                  collectionUrl={"/" + this.context.library() + "/admin/complaints"}
                  bookUrl={null}>
                  Complaints
                </CatalogLink>
              </li>
              <li>
                <CatalogLink
                  collectionUrl={"/" + this.context.library() + "/admin/suppressed"}
                  bookUrl={null}>
                  Hidden Books
                </CatalogLink>
              </li>
              <li>
                <Link to={"/admin/web/lists/" + this.context.library()}>Lists</Link>
              </li>
              { this.context.admin.isLibraryManager(this.context.library()) &&
                <li>
                  <Link to={"/admin/web/lanes/" + this.context.library()}>Lanes</Link>
                </li>
              }
            </Nav>
          }
          <Nav className="pull-right">
            <li>
              <Link to="/admin/web/dashboard">Dashboard</Link>
            </li>
            { this.context.admin.isLibraryManagerOfSomeLibrary() &&
              <li>
                <Link to="/admin/web/config">System Configuration</Link>
              </li>
            }
            { this.context.admin.email &&
              <li className="dropdown">
                <a
                  href="#"
                  role="button"
                  aria-haspopup="true"
                  aria-expanded={this.state.showAccountDropdown}
                  onClick={this.toggleAccountDropdown}
                  >{ this.context.admin.email } &#9660;</a>
                { this.state.showAccountDropdown &&
                  <ul className="dropdown-menu">
                    <li><Link to="/admin/web/account">Change password</Link></li>
                    <li><a href="/admin/sign_out">Sign out</a></li>
                  </ul>
                }
              </li>
            }
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    );
  }

  componentWillMount() {
    if (this.props.fetchLibraries) {
      this.props.fetchLibraries();
    }
  }

  changeLibrary() {
    let library = (this.refs["library"] as any).getValue();
    if (library) {
      this.context.router.push("/admin/web/collection/" + library + "%2Fgroups");
      this.forceUpdate();
    }
  }

  toggleAccountDropdown() {
    let showAccountDropdown = !this.state.showAccountDropdown;
    this.setState({ showAccountDropdown });
  }
}

function mapStateToProps(state, ownProps) {
  return {
    libraries: state.editor.libraries && state.editor.libraries.data && state.editor.libraries.data.libraries
  };
}

function mapDispatchToProps(dispatch) {
  let actions = new ActionCreator();
  return {
    fetchLibraries: () => dispatch(actions.fetchLibraries())
  };
}

const ConnectedHeader = connect<HeaderStateProps, HeaderDispatchProps, HeaderOwnProps>(
  mapStateToProps,
  mapDispatchToProps,
)(Header);

/** HeaderWithStore is a wrapper component to pass the store as a prop to the
    ConnectedHeader, since it's not in the regular place in the context. */
export default class HeaderWithStore extends React.Component<void, void> {
  context: { editorStore: Store<State> };

  static contextTypes = {
    editorStore: React.PropTypes.object.isRequired
  };

  render(): JSX.Element {
    return (
      <ConnectedHeader
        store={this.context.editorStore}
        />
    );
  }
}

