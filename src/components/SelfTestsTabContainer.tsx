import * as React from "react";
import { Store } from "redux";
import { connect } from "react-redux";
import ActionCreator from "../actions";
import { CollectionsData, PatronAuthServicesData, SearchServicesData } from "../interfaces";
import { State } from "../reducers/index";
import LoadingIndicator from "opds-web-client/lib/components/LoadingIndicator";
import ErrorMessage from "./ErrorMessage";
import { FetchErrorData } from "opds-web-client/lib/interfaces";
import { TabContainer, TabContainerProps } from "./TabContainer";
import SelfTestsCategory from "./SelfTestsCategory";
import { formatString } from "./sharedFunctions";

export interface SelfTestsTabContainerDispatchProps {
  fetchItems: (category: string) => Promise<any>;
}

export interface SelfTestsTabContainerOwnProps extends TabContainerProps {
  store: Store<State>;
  goToTab: (tabName: string) => void;
}

export interface SelfTestsTabContainerStateProps {
  fetchError?: FetchErrorData;
  items?: CollectionsData | PatronAuthServicesData | SearchServicesData;
  isLoaded?: boolean;
}

export interface SelfTestsTabContainerProps extends SelfTestsTabContainerDispatchProps, SelfTestsTabContainerStateProps, SelfTestsTabContainerOwnProps {};

export class SelfTestsTabContainer extends TabContainer<SelfTestsTabContainerProps> {

  DISPLAY_NAMES = {
    collections: "Collections",
    patronAuthServices: "Patron Authentication",
    searchServices: "Search Service Configuration"
  };

  componentWillMount() {
    this.props.fetchItems(this.props.tab);
  }

  async handleSelect(event) {
    let tab = event.currentTarget.dataset.tabkey;
    await this.props.goToTab(tab);
    if (!this.props.items || !this.props.items[this.getKeyName(tab)]) {
      await this.props.fetchItems(tab);
    }
  }

  tabDisplayName(name) {
    if (this.DISPLAY_NAMES[name]) {
      return this.DISPLAY_NAMES[name];
    } else {
      return super.tabDisplayName(name);
    }
  }

  getKeyName(name: string): string {
    return name.split(/(?=[A-Z])/).map(w => w.toLowerCase()).join("_");
  }

  tabs() {
    let tabs = {};
    let categories = Object.keys(this.DISPLAY_NAMES);
    categories.forEach((cat) => {
      let keyName = this.getKeyName(cat);
      let component = null;
      if (this.props.fetchError) {
        component = <ErrorMessage error={this.props.fetchError} />;
      }
      else if (!this.props.isLoaded) {
        component = <LoadingIndicator />;
      }
      else if (this.props.items && this.props.items[keyName]) {
        component = <SelfTestsCategory store={this.props.store} type={keyName} csrfToken={this.props.csrfToken} items={this.props.items[keyName]} />;
      }
      tabs[cat] = component;
    });
    return tabs;
  }
}

function mapStateToProps(state, ownProps: SelfTestsTabContainerOwnProps) {

  const category = ownProps.tab;
  return {
    items: state.editor[category] && state.editor[category].data,
    fetchError: state.editor[category] && state.editor[category].fetchError,
    isLoaded: state.editor[category] && state.editor[category].isLoaded,
  };
}

function mapDispatchToProps(dispatch: Function, ownProps: SelfTestsTabContainerOwnProps) {
  let actions = new ActionCreator();
  const fetchString = "fetch" + formatString(ownProps.tab);

  return {
    fetchItems: () => dispatch(actions[fetchString]())
  };
}

const ConnectedSelfTestsTabContainer = connect<SelfTestsTabContainerStateProps, SelfTestsTabContainerDispatchProps, SelfTestsTabContainerOwnProps>(
  mapStateToProps,
  mapDispatchToProps
)(SelfTestsTabContainer);

export default ConnectedSelfTestsTabContainer;
