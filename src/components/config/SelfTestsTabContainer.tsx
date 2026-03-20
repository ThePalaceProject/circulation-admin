import * as React from "react";
import { Store } from "@reduxjs/toolkit";
import { connect } from "react-redux";
import { CollectionsData, PatronAuthServicesData } from "../../interfaces";
import { RootState } from "../../store";
import LoadingIndicator from "@thepalaceproject/web-opds-client/lib/components/LoadingIndicator";
import ErrorMessage from "../shared/ErrorMessage";
import { FetchErrorData } from "@thepalaceproject/web-opds-client/lib/interfaces";
import {
  TabContainer,
  TabContainerProps,
} from "../shared/TabContainer";
import SelfTestsCategory from "./SelfTestsCategory";
import { configServicesApi } from "../../features/configServices/configServicesSlice";
import { rtkErrorToFetchError } from "../../features/diagnostics/diagnosticsSlice";
import { withRoutingContext } from "../../utils/withRoutingContext";

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

export class SelfTestsTabContainer extends TabContainer<
  SelfTestsTabContainerProps
> {
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
    if (this.props.router) {
      this.props.router.push("/admin/web/troubleshooting/self-tests/" + tab);
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function mapStateToProps(
  state: RootState,
  ownProps: SelfTestsTabContainerOwnProps
) {
  const { tab } = ownProps;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let result: any = {};

  if (tab === "collections") {
    result = configServicesApi.endpoints.getCollections.select()(state);
  } else if (tab === "patronAuthServices") {
    result = configServicesApi.endpoints.getPatronAuthServices.select()(state);
  } else if (tab === "metadataServices") {
    result = configServicesApi.endpoints.getMetadataServices.select()(state);
  }

  return {
    items: result.data,
    fetchError: rtkErrorToFetchError(result.error),
    isLoaded: result.isSuccess || result.isError,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    fetchItems: () => {
      dispatch(configServicesApi.endpoints.getCollections.initiate(undefined));
      dispatch(
        configServicesApi.endpoints.getPatronAuthServices.initiate(undefined)
      );
      dispatch(
        configServicesApi.endpoints.getMetadataServices.initiate(undefined)
      );
    },
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

export default withRoutingContext(ConnectedSelfTestsTabContainer as any);
