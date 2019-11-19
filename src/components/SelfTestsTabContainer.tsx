import * as React from "react";
import { Store } from "redux";
import { connect } from "react-redux";
import ActionCreator from "../actions";
import { CollectionsData, PatronAuthServicesData, SearchServicesData } from "../interfaces";
import { State } from "../reducers/index";
import LoadingIndicator from "opds-web-client/lib/components/LoadingIndicator";
import ErrorMessage from "./ErrorMessage";
import { FetchErrorData } from "opds-web-client/lib/interfaces";
import { TabContainer, TabContainerProps, TabContainerContext } from "./TabContainer";
import SelfTestsCategory from "./SelfTestsCategory";
import * as PropTypes from "prop-types";

export interface SelfTestsTabContainerDispatchProps {
  fetchItems: () => Promise<any>;
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
export interface SelfTestsTabContainerContext extends TabContainerContext {};

export class SelfTestsTabContainer extends TabContainer<SelfTestsTabContainerProps> {
  context: SelfTestsTabContainerContext;
  static contextTypes: React.ValidationMap<SelfTestsTabContainerContext> = {
    router: PropTypes.object.isRequired,
    pathFor: PropTypes.func.isRequired,
  };

  DISPLAY_NAMES = {
    collections: "Collections",
    patronAuthServices: "Patron Authentication",
    searchServices: "Search Service Configuration"
  };

  componentWillMount() {
    this.props.fetchItems();
  }

  async handleSelect(event) {
    let tab = event.currentTarget.dataset.tabkey;
    await this.props.goToTab(tab);
    if (this.context.router) {
      this.context.router.push("/admin/web/troubleshooting/self-tests/" + tab);
    }
  }

  tabDisplayName(name) {
    if (this.DISPLAY_NAMES[name]) {
      return this.DISPLAY_NAMES[name];
    } else {
      return super.tabDisplayName(name);
    }
  }

  getNames(category: string): string[] {
    // The name used to look up data in the store: "collections", "patron_auth_services", "search_services".
    let keyName = category.split(/(?=[A-Z])/).map(w => w.toLowerCase()).join("_");
    // The name the SelfTests component is expecting: "collection", "patron_auth_service", "search_service".
    let typeName = keyName.slice(0, -1);
    // let typeName = keyName.replace("auth", "authentication").slice(0, -1);
    // The name used to create a link to the service's edit form: "collections", "patronAuth", "search".
    let linkName = category.replace("Services", "");

    return [keyName, typeName, linkName];
  }

  tabs() {
    let tabs = {};
    let categories = Object.keys(this.DISPLAY_NAMES);
    categories.forEach((cat) => {
      let [keyName, typeName, linkName] = this.getNames(cat);
      let component = null;
      if (this.props.fetchError) {
        component = <ErrorMessage error={this.props.fetchError} />;
      } else if (this.props.items && this.props.items[keyName]) {
        component = <SelfTestsCategory store={this.props.store} linkName={linkName} type={typeName} csrfToken={this.props.csrfToken} items={this.props.items[keyName]} />;
      } else if (!this.props.isLoaded) {
        component = <LoadingIndicator />;
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
  const itemTypes = ["Collections", "PatronAuthServices", "SearchServices"];
  return {
    fetchItems: () => itemTypes.forEach(type => dispatch(actions["fetch" + type]()))
  };
}

const ConnectedSelfTestsTabContainer = connect<SelfTestsTabContainerStateProps, SelfTestsTabContainerDispatchProps, SelfTestsTabContainerOwnProps>(
  mapStateToProps,
  mapDispatchToProps
)(SelfTestsTabContainer);

export default ConnectedSelfTestsTabContainer;
