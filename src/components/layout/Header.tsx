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
import { Link } from "react-router-dom";
import { Router } from "@thepalaceproject/web-opds-client/lib/interfaces";
// Button from ui intentionally removed (dropdowns use native <button> for full style control)
import { BarChart, Book, User, SlidersHorizontal } from "lucide-react";
import { Landmark } from "lucide-react";
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
  showLibraryDropdown: boolean;
  showCatalogDropdown: boolean;
  isMobileNavOpen: boolean;
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
  accountDropdownRef: React.RefObject<HTMLDivElement>;
  settingsDropdownRef: React.RefObject<HTMLLIElement>;
  libraryDropdownRef: React.RefObject<HTMLDivElement>;
  catalogDropdownRef: React.RefObject<HTMLLIElement>;

  static contextTypes = {
    library: PropTypes.func,
    router: PropTypes.object.isRequired,
    admin: PropTypes.object.isRequired,
  };
  constructor(props) {
    super(props);
    this.state = {
      showAccountDropdown: false,
      showSettingsDropdown: false,
      showLibraryDropdown: false,
      showCatalogDropdown: false,
      isMobileNavOpen: false,
    };
    this.accountDropdownRef = React.createRef();
    this.settingsDropdownRef = React.createRef<HTMLLIElement>();
    this.libraryDropdownRef = React.createRef();
    this.catalogDropdownRef = React.createRef<HTMLLIElement>();
    this.changeLibrary = this.changeLibrary.bind(this);
    this.toggleAccountDropdown = this.toggleAccountDropdown.bind(this);
    this.toggleSettingsDropdown = this.toggleSettingsDropdown.bind(this);
    this.toggleLibraryDropdown = this.toggleLibraryDropdown.bind(this);
    this.toggleCatalogDropdown = this.toggleCatalogDropdown.bind(this);
    this.toggleMobileNav = this.toggleMobileNav.bind(this);
    this.handleDocumentClick = this.handleDocumentClick.bind(this);
    this.handleDocumentKeyDown = this.handleDocumentKeyDown.bind(this);
    this.renderNavItem = this.renderNavItem.bind(this);
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

    // Dashboard link with bar chart icon (larger)
    const dashboardLinkItem = {
      label: "Dashboard",
      href: "dashboard/",
      icon: <BarChart size={22} style={{ marginRight: 10 }} />,
    };

    // Library-specific links rendered as router Link components.
    const libraryLinkItems = [
      {
        label: "Patrons",
        href: "patrons/",
        auth: isSystemAdmin,
        icon: <User size={22} style={{ marginRight: 10 }} />,
      },
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
          <div className="site-nav__inner site-nav__inner--brand">
            <img src={palaceLogoUrl} alt={title()} className="site-nav__logo" />
            {!logoOnly && this.context.admin.email && (
              <div
                className="site-nav__dropdown site-nav__brand-user"
                ref={this.accountDropdownRef}
              >
                <button
                  type="button"
                  className="account-dropdown-toggle site-nav__dropdown-btn"
                  aria-haspopup="true"
                  aria-expanded={this.state.showAccountDropdown}
                  onClick={this.toggleAccountDropdown}
                >
                  <span className="site-nav__user-icon-wrap">
                    <User className="site-nav__user-icon" aria-hidden="true" />
                  </span>
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
        </div>

        {/* Row 2: Library selector (left) + Configuration (right) */}
        {!logoOnly && (
          <div className="site-nav site-nav--controls">
            <div className="site-nav__inner site-nav__inner--controls">
              <div className="site-nav__header">
                {this.props.libraries && this.props.libraries.length > 0 && (
                  <div
                    className="site-nav__dropdown"
                    ref={this.libraryDropdownRef}
                  >
                    <button
                      type="button"
                      className="library-dropdown-toggle site-nav__dropdown-btn site-nav__dropdown-btn--library"
                      aria-haspopup="listbox"
                      aria-expanded={this.state.showLibraryDropdown}
                      onClick={this.toggleLibraryDropdown}
                    >
                      <span className="site-nav__library-icon-wrap">
                        <Landmark
                          size={18}
                          className="site-nav__library-icon"
                          aria-hidden="true"
                        />
                      </span>
                      <span className="site-nav__library-label">
                        {currentLibrary
                          ? this.props.libraries.find(
                              (l) => l.short_name === currentLibrary
                            )?.name || currentLibrary
                          : "Select a library"}
                      </span>
                      <span className="site-nav__user-caret" aria-hidden="true">
                        &#9662;
                      </span>
                    </button>
                    {this.state.showLibraryDropdown && (
                      <ul className="site-nav__dropdown-menu" role="listbox">
                        {this.props.libraries.map((library) => (
                          <li
                            key={library.short_name}
                            role="option"
                            aria-selected={
                              currentLibrary === library.short_name
                            }
                            className={
                              currentLibrary === library.short_name
                                ? "active"
                                : ""
                            }
                          >
                            <button
                              type="button"
                              className="library-dropdown-toggle"
                              onClick={() =>
                                this.changeLibrary(library.short_name)
                              }
                            >
                              {library.name || library.short_name}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
                <button
                  type="button"
                  className="site-nav__toggle"
                  aria-label="Toggle navigation"
                  aria-controls="site-nav-menu"
                  aria-expanded={this.state.isMobileNavOpen}
                  onClick={this.toggleMobileNav}
                >
                  <span className="visually-hidden">Toggle navigation</span>
                  <span className="site-nav__toggle-bar" />
                  <span className="site-nav__toggle-bar" />
                  <span className="site-nav__toggle-bar" />
                </button>
              </div>

              {/* Right side: sitewide links + configuration dropdown */}
              <div className="site-nav__controls-end">
                <ul className="site-nav__links">
                  {sitewideLinkItems.map((item) =>
                    this.renderLinkItem(item, currentPathname)
                  )}

                  {/* Configuration dropdown: System Configuration + Troubleshooting */}
                  <li
                    className="site-nav__dropdown"
                    ref={this.settingsDropdownRef}
                  >
                    <button
                      type="button"
                      className="settings-dropdown-toggle site-nav__dropdown-btn"
                      aria-haspopup="true"
                      aria-expanded={this.state.showSettingsDropdown}
                      onClick={this.toggleSettingsDropdown}
                    >
                      <span className="site-nav__config-icon-wrap">
                        <SlidersHorizontal size={16} strokeWidth={2} />
                      </span>
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
            </div>
          </div>
        )}

        {/* Row 3: Page nav tabs — only when a library is selected */}
        {!logoOnly && currentLibrary && (
          <nav className="site-nav site-nav--tabs">
            <div className="site-nav__inner site-nav__inner--tabs">
              <ul
                id="site-nav-menu"
                className={
                  "site-nav__links site-nav__menu" +
                  (this.state.isMobileNavOpen ? " open" : "")
                }
              >
                {this.renderLinkItem(
                  dashboardLinkItem,
                  currentPathname,
                  currentLibrary
                )}
                {this.renderCatalogDropdown(
                  currentPathname,
                  currentLibrary,
                  isLibraryManager
                )}
                {libraryLinkItems.map((item) =>
                  this.renderLinkItem(item, currentPathname, currentLibrary)
                )}
              </ul>
            </div>
          </nav>
        )}
      </header>
    );
  }

  componentDidMount() {
    const { fetchLibraries, isFetchingLibraries } = this.props;

    if (fetchLibraries && !isFetchingLibraries) {
      fetchLibraries();
    }

    document.body.addEventListener("click", this.handleDocumentClick);
    document.body.addEventListener("keydown", this.handleDocumentKeyDown);
  }

  componentWillUnmount() {
    document.body.removeEventListener("click", this.handleDocumentClick);
    document.body.removeEventListener("keydown", this.handleDocumentKeyDown);
  }

  changeLibrary(shortName: string) {
    if (shortName) {
      this.setState({ showLibraryDropdown: false, isMobileNavOpen: false });
      this.context.router.push(
        "/admin/web/collection/" + shortName + "%2Fgroups"
      );
      this.forceUpdate();
    }
  }

  toggleLibraryDropdown() {
    this.setState((prev) => ({
      showLibraryDropdown: !prev.showLibraryDropdown,
      showAccountDropdown: false,
      showSettingsDropdown: false,
      showCatalogDropdown: false,
    }));
  }

  toggleAccountDropdown() {
    this.setState((prev) => ({
      showAccountDropdown: !prev.showAccountDropdown,
      showLibraryDropdown: false,
      showSettingsDropdown: false,
      showCatalogDropdown: false,
    }));
  }

  toggleSettingsDropdown() {
    this.setState((prev) => ({
      showSettingsDropdown: !prev.showSettingsDropdown,
      showAccountDropdown: false,
      showLibraryDropdown: false,
      showCatalogDropdown: false,
    }));
  }

  toggleCatalogDropdown() {
    this.setState((prev) => ({
      showCatalogDropdown: !prev.showCatalogDropdown,
      showAccountDropdown: false,
      showSettingsDropdown: false,
      showLibraryDropdown: false,
    }));
  }

  toggleMobileNav() {
    this.setState((prev) => ({ isMobileNavOpen: !prev.isMobileNavOpen }));
  }

  handleDocumentClick(event: MouseEvent) {
    const target = event.target as Node | null;
    if (!target) return;

    if (
      this.state.showAccountDropdown &&
      this.accountDropdownRef.current &&
      !this.accountDropdownRef.current.contains(target)
    ) {
      this.setState({ showAccountDropdown: false });
    }

    if (
      this.state.showSettingsDropdown &&
      this.settingsDropdownRef.current &&
      !this.settingsDropdownRef.current.contains(target)
    ) {
      this.setState({ showSettingsDropdown: false });
    }

    if (
      this.state.showLibraryDropdown &&
      this.libraryDropdownRef.current &&
      !this.libraryDropdownRef.current.contains(target)
    ) {
      this.setState({ showLibraryDropdown: false });
    }

    if (
      this.state.showCatalogDropdown &&
      this.catalogDropdownRef.current &&
      !this.catalogDropdownRef.current.contains(target)
    ) {
      this.setState({ showCatalogDropdown: false });
    }
  }

  handleDocumentKeyDown(event: KeyboardEvent) {
    if (event.key !== "Escape") return;
    if (
      this.state.showAccountDropdown ||
      this.state.showSettingsDropdown ||
      this.state.showLibraryDropdown ||
      this.state.showCatalogDropdown
    ) {
      this.setState({
        showAccountDropdown: false,
        showSettingsDropdown: false,
        showLibraryDropdown: false,
        showCatalogDropdown: false,
      });
    }
  }

  /**
   * renderCatalogDropdown
   * Renders the Catalog nav button with a dropdown containing View Catalog,
   * Hidden Books, Lists, and Lanes.
   */
  renderCatalogDropdown(
    currentPathname: string,
    currentLibrary: string,
    isLibraryManager: boolean
  ): JSX.Element {
    const rootCatalogURL = "/admin/web/collection/";
    const rootUrl = "/admin/web/";
    const catalogHref = "%2Fgroups";
    const hiddenBooksHref = "%2Fadmin%2Fsuppressed";
    const listsHref = "lists/";
    const lanesHref = "lanes/";

    const isActive =
      currentPathname.indexOf(catalogHref) !== -1 ||
      currentPathname.indexOf(hiddenBooksHref) !== -1 ||
      currentPathname.indexOf(listsHref) !== -1 ||
      currentPathname.indexOf(lanesHref) !== -1;

    return (
      <li
        key="catalog-dropdown"
        className={
          "header-link site-nav__dropdown" + (isActive ? " active" : "")
        }
        ref={this.catalogDropdownRef}
      >
        <button
          type="button"
          className={
            "site-nav__dropdown-btn catalog-dropdown-toggle" +
            (isActive ? " active-link" : "")
          }
          aria-haspopup="true"
          aria-expanded={this.state.showCatalogDropdown}
          onClick={(e) => {
            e.preventDefault();
            this.toggleCatalogDropdown();
          }}
        >
          <span
            style={{ marginRight: 10, display: "flex", alignItems: "center" }}
          >
            <Book size={22} />
          </span>
          Catalog
          <span className="site-nav__user-caret" aria-hidden="true">
            &#9662;
          </span>
        </button>
        {this.state.showCatalogDropdown && (
          <ul className="site-nav__dropdown-menu">
            <li>
              <a
                href={`${rootCatalogURL}${currentLibrary}${catalogHref}`}
                className={
                  currentPathname.indexOf(catalogHref) !== -1
                    ? "active-link"
                    : ""
                }
              >
                View Catalog
              </a>
            </li>
            <li>
              <a
                href={`${rootCatalogURL}${currentLibrary}${hiddenBooksHref}`}
                className={
                  currentPathname.indexOf(hiddenBooksHref) !== -1
                    ? "active-link"
                    : ""
                }
              >
                Hidden Books
              </a>
            </li>
            <li>
              <Link
                to={`${rootUrl}${listsHref}${currentLibrary}`}
                className={
                  currentPathname.indexOf(listsHref) !== -1 ? "active-link" : ""
                }
              >
                Lists
              </Link>
            </li>
            {isLibraryManager && (
              <li>
                <Link
                  to={`${rootUrl}${lanesHref}${currentLibrary}`}
                  className={
                    currentPathname.indexOf(lanesHref) !== -1
                      ? "active-link"
                      : ""
                  }
                >
                  Lanes
                </Link>
              </li>
            )}
          </ul>
        )}
      </li>
    );
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
    item: HeaderNavItem & { icon?: React.ReactNode },
    currentPathname: string,
    currentLibrary: string = ""
  ) {
    const rootUrl = "/admin/web/";
    const { label, href, auth, icon } = item;
    let isActive = currentPathname.indexOf(href) !== -1;
    if (currentLibrary) {
      isActive = !!(isActive && currentLibrary);
    }
    // Remove tab styling, match dropdown style
    const liElem = (
      <li className="header-link" key={href}>
        <Link
          to={`${rootUrl}${href}${currentLibrary}`}
          className={
            "site-nav__dropdown-btn" + (isActive ? " active-link" : "")
          }
          style={{
            display: "flex",
            alignItems: "center",
            fontWeight: 600,
            fontSize: "0.95rem",
            borderRadius: 0,
            background: "none",
            border: "none",
            boxShadow: "none",
            height: 36,
            padding: "0 18px",
            minWidth: 88,
            borderBottom: "3px solid transparent",
            color: isActive
              ? "var(--nav-link-active-fg)"
              : "var(--text-secondary)",
          }}
        >
          {icon}
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
        return null;
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
      dispatch(configServicesApi.endpoints.getLibraries.initiate()),
  };
}

const ConnectedHeader = connect(mapStateToProps, mapDispatchToProps)(Header);

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
