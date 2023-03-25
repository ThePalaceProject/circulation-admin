import * as React from "react";
import { Store } from "redux";
import * as PropTypes from "prop-types";
import { Navigate, PathFor } from "../interfaces";
import { RootState } from "../store";

export interface TabContainerProps extends React.Props<TabContainerProps> {
  store?: Store<RootState>;
  csrfToken?: string;
  tab: string;
  class?: string;
}

export interface TabContainerContext {
  pathFor: PathFor;
  router: any;
}

/** Renders a list of navigation tabs and the content of the current tab.
    Subclasses must define the tabs and the method to call when a new tab
    is clicked. */
export abstract class TabContainer<
  T extends TabContainerProps
> extends React.Component<T, any> {
  context: TabContainerContext;

  constructor(props) {
    super(props);
    this.handleSelect = this.handleSelect.bind(this);
    this.currentTab = this.currentTab.bind(this);
    this.defaultTab = this.defaultTab.bind(this);
    this.tabs = this.tabs.bind(this);
    this.tabClass = this.tabClass.bind(this);
    this.tabDisplayName = this.tabDisplayName.bind(this);
    this.renderTab = this.renderTab.bind(this);
  }

  static contextTypes: React.ValidationMap<TabContainerContext> = {
    router: PropTypes.object.isRequired,
    pathFor: PropTypes.func.isRequired,
  };

  render(): JSX.Element {
    const className = this.props.class
      ? `tab-container ${this.props.class}`
      : "tab-container";
    return (
      <div className={className}>
        <ul className="nav nav-tabs">
          {Object.keys(this.tabs()).map((name) => (
            <li key={name} role="presentation" className={this.tabClass(name)}>
              {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
              <a
                href="javascript:void(0)"
                onClick={this.handleSelect}
                data-tabkey={name}
              >
                {this.tabDisplayName(name)}
              </a>
            </li>
          ))}
        </ul>

        <div className="tab-content">
          {Object.keys(this.tabs()).map((name) =>
            this.renderTab(name, this.tabs()[name])
          )}
        </div>
      </div>
    );
  }

  abstract handleSelect(event);
  abstract tabs();

  defaultTab() {
    return Object.keys(this.tabs())[0];
  }

  currentTab() {
    return this.props.tab || this.defaultTab();
  }

  tabClass(name) {
    return this.currentTab() === name ? "active" : null;
  }

  tabDisplayName(name) {
    const capitalized = name.charAt(0).toUpperCase() + name.slice(1);
    return capitalized;
  }

  renderTab(name, children) {
    const display = this.currentTab() === name ? "block" : "none";
    return (
      <div style={{ display }} key={name}>
        {children}
      </div>
    );
  }
}

export default TabContainer;
