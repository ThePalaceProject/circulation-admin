/* eslint-disable */
import * as React from "react";
import { connect } from "react-redux";
import { Store } from "@reduxjs/toolkit";
import * as PropTypes from "prop-types";
import { RootState } from "../../store";
import { LibraryData, LibrariesData } from "../../interfaces";
import {
  configServicesApi,
  isResultFetching,
} from "../../features/configServices/configServicesSlice";
import Admin from "../../models/Admin";
import EditableInput from "../shared/EditableInput";
import { Link } from "react-router";
import { Router } from "@thepalaceproject/web-opds-client/lib/interfaces";
// Button from ui intentionally removed (dropdowns use native <button> for full style control)
import { GenericWedgeIcon } from "@nypl/dgx-svg-icons";
import { Landmark, Settings, User } from "lucide-react";
import title from "../../utils/title";

const palaceLogoUrl = require("../../images/PalaceCollectionManagerLogo.svg")
  .default;

export interface HeaderStateProps {
  isFetchingLibraries?: boolean;
  libraries?: LibraryData[];
}

export interface HeaderDispatchProps {
  fetchLibraries?: () => Promise<LibrariesData>;
}

export interface HeaderOwnProps {
  store?: Store<RootState>;
  logoOnly?: boolean;
}

export interface HeaderProps
  extends React.Props<Header>,
    HeaderStateProps,
    HeaderDispatchProps,
    HeaderOwnProps {}

export interface HeaderState {
  showAccountDropdown: boolean;
  showSettingsDropdown: boolean;
}

export interface HeaderRouter extends Router {
  getCurrentLocation?: Function;
}

export interface HeaderNavItem {
  label: string;
  href: string;
  auth?: boolean;
}

/** Header of all admin interface pages, with a dropdown for selecting a library,
    library-specific links for the current library, and site-wide links. */
export class Header extends React.Component<HeaderProps, HeaderState> {
  context: { library: () => string; router: HeaderRouter; admin: Admin };

  static contextTypes = {
    library: PropTypes.func,
    router: PropTypes.object.isRequired,
    admin: PropTypes.object.isRequired,
  };
  private libraryRef = React.createRef<HTMLSelectElement>();

  constructor(props) {
    super(props);
    this.state = { showAccountDropdown: false, showSettingsDropdown: false };
    this.changeLibrary = this.changeLibrary.bind(this);
    this.toggleAccountDropdown = this.toggleAccountDropdown.bind(this);
    this.toggleSettingsDropdown = this.toggleSettingsDropdown.bind(this);
    this.renderNavItem = this.renderNavItem.bind(this);

    document.body.addEventListener("click", (event: MouseEvent) => {
      const target = (event.target as any).className || "";
      if (
        this.state.showAccountDropdown &&
        target.indexOf("account-dropdown-toggle") === -1
      ) {
        this.setState({ showAccountDropdown: false });
      }
      if (
        this.state.showSettingsDropdown &&
        target.indexOf("settings-dropdown-toggle") === -1
      ) {
        this.setState({ showSettingsDropdown: false });
      }
    });
  }

  displayPermissions(isSystemAdmin: boolean, isLibraryManager: boolean) {
    let permissions = isSystemAdmin
      ? "a system admin"
      : isLibraryManager
      ? "an administrator"
      : "a user";
    return <li className="permissions">Logged in as {permissions}</li>;
  }

  render(): JSX.Element {
    const currentPathname =
      (this.context.router &&
        this.context.router.getCurrentLocation() &&
        this.context.router.getCurrentLocation().pathname) ||
      "";
    let currentLibrary = this.context.library && this.context.library();
    let isLibraryManager = this.context.admin.isLibraryManager(currentLibrary);
    let isSystemAdmin = this.context.admin.isSystemAdmin();
    let isSiteWide = !this.context.library || !currentLibrary;
    let isSomeLibraryManager = this.context.admin.isLibraryManagerOfSomeLibrary();

    // Dashboard link that will be rendered in a Link router component.
    const dashboardLinkItem = { label: "Dashboard", href: "dashboard/" };

    // Links that will be rendered in a NavItem Bootstrap component.
    const libraryNavItems = [
      { label: "Catalog", href: "%2Fgroups" },
      { label: "Hidden Books", href: "%2Fadmin%2Fsuppressed" },
    ];
    // Other links that will be rendered in a Link router component and are library specific.
    const libraryLinkItems = [
      { label: "Lists", href: "lists/" },
      { label: "Lanes", href: "lanes/", auth: isLibraryManager },
      { label: "Patrons", href: "patrons/", auth: isSystemAdmin },
    ];
    // Links that will be rendered in a Link router component and are sitewide.
    // Dashboard only shows when no library is selected (otherwise it's in the left nav).
    const sitewideLinkItems = [
      { label: "Dashboard", href: "dashboard/", auth: isSiteWide },
    ];
    const roleLabel = isSystemAdmin
      ? "System Admin"
      : isLibraryManager
      ? "Administrator"
      : "User";
    const accountLink = { label: "Change password", href: "account/" };
    const configUrl = "/admin/web/config/";
    const troubleshootingUrl = "/admin/web/troubleshooting/";
    const logoOnly = this.props.logoOnly ?? false;

    return (
      <header>
        <h1 className="visually-hidden">{title("")}</h1>

        {/* Row 1: Logo + User dropdown */}
        <div className="site-nav__brand">
          <img src={palaceLogoUrl} alt={title()} />
          {!logoOnly && this.context.admin.email && (
            <div className="site-nav__dropdown site-nav__brand-user">
              <button
                type="button"
                className="account-dropdown-toggle site-nav__user-btn"
                aria-haspopup="true"
                aria-expanded={this.state.showAccountDropdown}
                onClick={this.toggleAccountDropdown}
              >
                <User className="site-nav__user-icon" aria-hidden="true" />
                <span className="site-nav__user-email">
                  {this.context.admin.email}
                </span>
                <span className="site-nav__user-caret" aria-hidden="true">
                  &#9662;
                </span>
              </button>
              {this.state.showAccountDropdown && (
                <ul className="site-nav__dropdown-menu">
                  {this.displayPermissions(isSystemAdmin, isLibraryManager)}
                  {this.renderLinkItem(accountLink, currentPathname)}
                  <li>
                    <a href="/admin/sign_out">Sign out</a>
                  </li>
                </ul>
              )}
            </div>
          )}
        </div>

        {/* Row 2: Library selector + nav links */}
        {!logoOnly && (
          <nav className="site-nav">
            <div className="site-nav__header">
              {this.props.libraries && this.props.libraries.length > 0 && (
                <div className="site-nav__library-wrapper">
                  <Landmark
                    size={16}
                    className="site-nav__library-icon"
                    aria-hidden="true"
                  />
                  <span className="site-nav__library-label">
                    Select Library
                  </span>
                  <select
                    ref={this.libraryRef}
                    onChange={this.changeLibrary}
                    aria-label="Select a library"
                    defaultValue={currentLibrary || ""}
                    className="site-nav__library-select"
                  >
                    {!currentLibrary && (
                      <option value="">Select a library</option>
                    )}
                    {this.props.libraries.map((library) => (
                      <option
                        key={library.short_name}
                        value={library.short_name}
                        aria-selected={currentLibrary === library.short_name}
                      >
                        {library.name || library.short_name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <button
                type="button"
                className="site-nav__toggle"
                aria-label="Toggle navigation"
              >
                <span className="visually-hidden">Toggle navigation</span>
                <span className="site-nav__toggle-bar" />
                <span className="site-nav__toggle-bar" />
                <span className="site-nav__toggle-bar" />
              </button>
            </div>

            <div className="site-nav__menu">
              {currentLibrary && (
                <ul className="site-nav__links">
                  {this.renderLinkItem(
                    dashboardLinkItem,
                    currentPathname,
                    currentLibrary
                  )}
                  {libraryNavItems.map((item) =>
                    this.renderNavItem(item, currentPathname, currentLibrary)
                  )}
                  {libraryLinkItems.map((item) =>
                    this.renderLinkItem(item, currentPathname, currentLibrary)
                  )}
                </ul>
              )}
              <ul className="site-nav__links site-nav__links--right">
                {sitewideLinkItems.map((item) =>
                  this.renderLinkItem(item, currentPathname)
                )}

                {/* Configuration dropdown: System Configuration + Troubleshooting */}
                <li className="site-nav__dropdown">
                  <button
                    type="button"
                    className="settings-dropdown-toggle site-nav__config-btn"
                    aria-haspopup="true"
                    aria-expanded={this.state.showSettingsDropdown}
                    onClick={this.toggleSettingsDropdown}
                  >
                    <Settings size={14} strokeWidth={2} />
                    Configuration
                  </button>
                  {this.state.showSettingsDropdown && (
                    <ul className="site-nav__dropdown-menu">
                      <li>
                        <a href={configUrl}>System Configuration</a>
                      </li>
                      {isSystemAdmin && (
                        <li>
                          <a href={troubleshootingUrl}>Troubleshooting</a>
                        </li>
                      )}
                    </ul>
                  )}
                </li>
              </ul>
            </div>
          </nav>
        )}
      </header>
    );
  }

  UNSAFE_componentWillMount() {
    const { fetchLibraries, isFetchingLibraries } = this.props;

    if (fetchLibraries && !isFetchingLibraries) {
      fetchLibraries();
    }
  }

  changeLibrary() {
    const library = this.libraryRef.current?.value;
    if (library) {
      this.context.router.push(
        "/admin/web/collection/" + library + "%2Fgroups"
      );
      this.forceUpdate();
    }
  }

  toggleAccountDropdown() {
    this.setState({ showAccountDropdown: !this.state.showAccountDropdown });
  }

  toggleSettingsDropdown() {
    this.setState({ showSettingsDropdown: !this.state.showSettingsDropdown });
  }

  /**
   * renderNavItem
   * Renders a NavItem Bootstrap component and is active based on the page's current path.
   * @param {HeaderNavItem} item Object with the label and href for the navigation item.
   * @param {string} currentPathname Page's current URL.
   * @param {string} currentLibrary Active library.
   */
  renderNavItem(
    item: HeaderNavItem,
    currentPathname: string,
    currentLibrary: string = ""
  ) {
    const rootCatalogURL = "/admin/web/collection/";
    const { label, href } = item;
    const isActive = currentPathname.indexOf(href) !== -1;

    return (
      <li key={href} className={"header-link" + (isActive ? " active" : "")}>
        <a href={`${rootCatalogURL}${currentLibrary}${href}`}>{label}</a>
      </li>
    );
  }

  /**
   * renderLinkItem
   * Renders a Link Router component for library and sitewide navigation links
   * and if the current admin has the correct authentication.
   * @param {HeaderNavItem} item Object with the label and href for the navigation item.
   * @param {string} currentPathname Page's current URL.
   * @param {string} currentLibrary Active library.
   */
  renderLinkItem(
    item: HeaderNavItem,
    currentPathname: string,
    currentLibrary: string = ""
  ) {
    const rootUrl = "/admin/web/";
    const { label, href, auth } = item;
    let isActive = currentPathname.indexOf(href) !== -1;
    if (currentLibrary) {
      isActive = !!(isActive && currentLibrary);
    }
    const liElem = (
      <li className="header-link" key={href}>
        <Link
          to={`${rootUrl}${href}${currentLibrary}`}
          className={isActive ? "active-link" : ""}
        >
          {label}
        </Link>
      </li>
    );

    // Sometimes, some links should only be shown to admins who have
    // specific privileges. If there is no restriction, always render the link.
    if (auth !== undefined) {
      if (auth) {
        return liElem;
      } else {
        return;
      }
    }

    return liElem;
  }
}

function mapStateToProps(state, ownProps) {
  const librariesResult = configServicesApi.endpoints.getLibraries.select()(
    state
  );
  return {
    isFetchingLibraries: isResultFetching(librariesResult),
    libraries: librariesResult.data?.libraries,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    fetchLibraries: () =>
      dispatch(configServicesApi.endpoints.getLibraries.initiate(undefined)),
  };
}

const ConnectedHeader = connect<
  HeaderStateProps,
  HeaderDispatchProps,
  HeaderOwnProps
>(
  mapStateToProps,
  mapDispatchToProps
)(Header);

/** HeaderWithStore is a wrapper component to pass the store as a prop to the
    ConnectedHeader, since it's not in the regular place in the context. */
type HeaderWithStoreProps = {
  logoOnly?: boolean;
};

export default class HeaderWithStore extends React.Component<
  HeaderWithStoreProps
> {
  context: { editorStore: Store<RootState> };

  static contextTypes = {
    editorStore: PropTypes.object.isRequired,
  };

  render(): JSX.Element {
    return (
      <ConnectedHeader
        store={this.context.editorStore}
        logoOnly={this.props.logoOnly}
      />
    );
  }
}
