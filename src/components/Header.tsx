import * as React from "react";
import * as ReactDOM from "react-dom";
import { connect } from "react-redux";
import { Store } from "redux";
import { State } from "../reducers/index";
import ActionCreator from "../actions";
import { LibraryData, LibrariesData } from "../interfaces";
import EditableInput from "./EditableInput";
import CatalogLink from "opds-web-client/lib/components/CatalogLink";
import { Link } from "react-router";
import { Navbar, Nav, NavItem } from "react-bootstrap";
import { Router } from "opds-web-client/lib/interfaces";

export interface HeaderProps extends React.Props<Header> {
  libraries?: LibraryData[];
  fetchLibraries?: () => Promise<LibrariesData>;
}

export class Header extends React.Component<HeaderProps, any> {
  context: { library: string, router: Router };

  static contextTypes = {
    library: React.PropTypes.string,
    router: React.PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);
    this.changeLibrary = this.changeLibrary.bind(this);
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
              value={this.context.library}
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
          <Nav>
            { this.context.library &&
              <li>
                <CatalogLink
                  collectionUrl={"/" + this.context.library + "/groups"}
                  bookUrl={null}>
                  Catalog
                </CatalogLink>
              </li>
            }
            { this.context.library &&
              <li>
                <CatalogLink
                  collectionUrl={"/" + this.context.library + "/admin/complaints"}
                  bookUrl={null}>
                  Complaints
                </CatalogLink>
              </li>
            }
            { this.context.library &&
              <li>
                <CatalogLink
                  collectionUrl={"/" + this.context.library + "/admin/suppressed"}
                  bookUrl={null}>
                  Hidden Books
                </CatalogLink>
              </li>
            }
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

  componentWillMount() {
    if (this.props.fetchLibraries) {
      this.props.fetchLibraries();
    }
  }

  changeLibrary() {
    let library = (this.refs["library"] as any).getValue();
    if (library) {
      this.context.router.push("/admin/web/collection/" + library + "%2Fgroups");
    }
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

const ConnectedHeader = connect<any, any, any>(
  mapStateToProps,
  mapDispatchToProps,
)(Header);

/** HeaderWithStore is a wrapper component to pass the store as a prop to the
    ConnectedHeader, since it's not in the regular place in the context. */
export default class HeaderWithStore extends React.Component<any, any> {
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

