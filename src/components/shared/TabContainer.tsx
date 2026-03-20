import * as React from "react";
import { Store } from "@reduxjs/toolkit";
import { PathFor } from "../../interfaces";
import { RootState } from "../../store";
import { RouterCompat } from "../../utils/withRoutingContext";

export interface TabContainerProps extends React.Props<TabContainerProps> {
  store?: Store<RootState>;
  csrfToken?: string;
  tab: string;
  className?: string;
  // HOC PATTERN: injected by withRoutingContext(), replacing legacy contextTypes.
  pathFor?: PathFor;
  router?: RouterCompat;
}

/** Renders a list of navigation tabs and the content of the current tab.
    Subclasses must define the tabs and the method to call when a new tab
    is clicked. */
export abstract class TabContainer<
  T extends TabContainerProps
> extends React.Component<T, any> {
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

  render(): JSX.Element {
    // If noContainer is set, render only the active tab content (no wrapper/sidebar)
    if ((this.props as any).noContainer) {
      const activeTab = this.currentTab();
      const tabs = this.tabs();
      return tabs[activeTab];
    }
    // Always include 'tab-container' and any additional classes
    const className = ["tab-container", this.props.className]
      .filter(Boolean)
      .join(" ");
    const isVertical =
      this.props.className && this.props.className.includes("vertical-tabs");
    if (isVertical) {
      // Vertical sidebar layout: sidebar and content as flex children
      return (
        <div className={className}>
          <ul className="nav-tabs">
            {Object.keys(this.tabs()).map((name) => (
              <li
                key={name}
                className={this.currentTab() === name ? "active" : undefined}
              >
                <a
                  href={`#${name}`}
                  onClick={(event) => {
                    event.preventDefault();
                    this.handleSelect(event);
                  }}
                  data-tabkey={name}
                >
                  {this.tabDisplayName(name)}
                </a>
              </li>
            ))}
          </ul>
          <div className="tab-content" style={{ flex: 1 }}>
            {Object.keys(this.tabs()).map((name) =>
              this.renderTab(name, this.tabs()[name])
            )}
          </div>
        </div>
      );
    } else {
      // Horizontal tabs (default)
      return (
        <div className={className}>
          <ul className="nav-tabs flex border-b">
            {Object.keys(this.tabs()).map((name) => (
              <li
                key={name}
                className={this.currentTab() === name ? "active" : undefined}
              >
                <a
                  href={`#${name}`}
                  onClick={(event) => {
                    event.preventDefault();
                    this.handleSelect(event);
                  }}
                  data-tabkey={name}
                  className={`inline-block px-4 py-2 text-sm font-medium border-b-2 transition-colors duration-150 outline-none ${
                    this.currentTab() === name
                      ? "border-blue-600 text-blue-700 bg-white shadow-none"
                      : "border-transparent text-gray-500 hover:text-blue-700 hover:border-blue-300 focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-1"
                  }`}
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
    const isActive = this.currentTab() === name;
    return (
      <div
        key={name}
        id={name}
        className={isActive ? "tab-panel active" : "tab-panel"}
        style={{ display: isActive ? "block" : "none" }}
      >
        {children}
      </div>
    );
  }
}

export default TabContainer;
