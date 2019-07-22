import * as React from "react";
import { Store } from "redux";
import { connect } from "react-redux";
import ActionCreator from "../actions";
import { SelfTestsData } from "../interfaces";
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
  items?: any;
  collections?: any;
  patronAuthServices?: any;
  searchServices?: any;
  isLoaded?: boolean;
}

export interface SelfTestsTabContainerProps extends SelfTestsTabContainerDispatchProps, SelfTestsTabContainerStateProps, SelfTestsTabContainerOwnProps {};

export class SelfTestsTabContainer extends TabContainer<SelfTestsTabContainerProps> {

  DISPLAY_NAMES = {
    collections: "Collections",
    patronAuthServices: "Patron Authentication",
    searchServices: "Search Service Configuration"
  };

  KEY_NAMES = {
    collections: "collections",
    patronAuthServices: "patron_auth_services",
    searchServices: "search_services"
  }

  componentWillMount() {
    this.props.fetchItems(this.props.tab);
  }

  async handleSelect(event) {
    let tab = event.currentTarget.dataset.tabkey;
    await this.props.goToTab(tab);
    await this.props.fetchItems(tab);
  }

  tabDisplayName(name) {
    if (this.DISPLAY_NAMES[name]) {
      return this.DISPLAY_NAMES[name];
    } else {
      return super.tabDisplayName(name);
    }
  }

  tabs() {
    let tabs = {};
    let categories = Object.keys(this.DISPLAY_NAMES);
    categories.forEach((cat) => {
      let component = null;
      if (this.props.fetchError) {
        component = <ErrorMessage error={this.props.fetchError} />;
      }
      else if (!this.props.isLoaded) {
        component = <LoadingIndicator />;
      }
      else if (this.props[cat]) {
        component = <SelfTestsCategory type={this.KEY_NAMES[cat]} csrfToken={this.props.csrfToken} items={this.props[cat]} />;
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
    collections: state.editor.collections && state.editor.collections.data,
    patronAuthServices: state.editor.patronAuthServices && state.editor.patronAuthServices.data,
    searchServices: state.editor.searchServices && state.editor.searchServices.data
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
