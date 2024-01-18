/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-interface */
import * as React from "react";
import { Store } from "redux";
import { connect } from "react-redux";
import ActionCreator from "../actions";
import { CollectionsData, PatronAuthServicesData } from "../interfaces";
import { RootState } from "../store";
import LoadingIndicator from "@thepalaceproject/web-opds-client/lib/components/LoadingIndicator";
import ErrorMessage from "./ErrorMessage";
import { FetchErrorData } from "@thepalaceproject/web-opds-client/lib/interfaces";
import {
  TabContainer,
  TabContainerProps,
  TabContainerContext,
} from "./TabContainer";
import SelfTestsCategory from "./SelfTestsCategory";
import * as PropTypes from "prop-types";

export interface SelfTestsTabContainerDispatchProps {
  fetchItems: () => Promise<any>;
}

export interface SelfTestsTabContainerOwnProps extends TabContainerProps {
  store: Store<RootState>;
  goToTab: (tabName: string) => void;
}

export interface SelfTestsTabContainerStateProps {
  fetchError?: FetchErrorData;
  items?: CollectionsData | PatronAuthServicesData;
  isLoaded?: boolean;
}

export interface SelfTestsTabContainerProps
  extends SelfTestsTabContainerDispatchProps,
    SelfTestsTabContainerStateProps,
    SelfTestsTabContainerOwnProps {}
export interface SelfTestsTabContainerContext extends TabContainerContext {}

export class SelfTestsTabContainer extends TabContainer<
  SelfTestsTabContainerProps
> {
  context: SelfTestsTabContainerContext;
  static contextTypes: React.ValidationMap<SelfTestsTabContainerContext> = {
    router: PropTypes.object.isRequired,
    pathFor: PropTypes.func.isRequired,
  };

  DISPLAY_NAMES = {
    collections: "Collections",
    patronAuthServices: "Patron Authentication",
    metadataServices: "Metadata Services",
  };

  UNSAFE_componentWillMount() {
    this.props.fetchItems();
  }

  async handleSelect(event) {
    const tab = event.currentTarget.dataset.tabkey;
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
    // The name used to look up data in the store: "collections",
    // "patron_auth_services".
    const keyName = category
      .split(/(?=[A-Z])/)
      .map((w) => w.toLowerCase())
      .join("_");
    // The name the SelfTests component is expecting: "collection",
    // "patron_auth_service", "search_service".
    const typeName = keyName.slice(0, -1);
    // let typeName = keyName.replace("auth", "authentication").slice(0, -1);
    // The name used to create a link to the service's edit form: "collections",
    // "patronAuth", "search".
    const linkName = category.replace("Services", "");

    return [keyName, typeName, linkName];
  }

  tabs() {
    const tabs = {};
    const categories = Object.keys(this.DISPLAY_NAMES);
    categories.forEach((cat) => {
      const [keyName, typeName, linkName] = this.getNames(cat);
      let component = null;
      if (this.props.fetchError) {
        component = <ErrorMessage error={this.props.fetchError} />;
      } else if (this.props.items && this.props.items[keyName]) {
        component = (
          <SelfTestsCategory
            store={this.props.store}
            linkName={linkName}
            type={typeName}
            csrfToken={this.props.csrfToken}
            items={this.props.items[keyName]}
          />
        );
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

function mapDispatchToProps(dispatch, ownProps: SelfTestsTabContainerOwnProps) {
  const actions = new ActionCreator();
  const itemTypes = ["Collections", "PatronAuthServices", "MetadataServices"];
  return {
    fetchItems: () =>
      itemTypes.forEach((type) => dispatch(actions["fetch" + type]())),
  };
}

const ConnectedSelfTestsTabContainer = connect<
  SelfTestsTabContainerStateProps,
  SelfTestsTabContainerDispatchProps,
  SelfTestsTabContainerOwnProps
>(
  mapStateToProps,
  mapDispatchToProps as any
)(SelfTestsTabContainer as any);

export default ConnectedSelfTestsTabContainer;
