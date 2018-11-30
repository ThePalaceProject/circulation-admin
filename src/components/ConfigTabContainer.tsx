import * as React from "react";
import Libraries from "./Libraries";
import Collections from "./Collections";
import AdminAuthServices from "./AdminAuthServices";
import IndividualAdmins from "./IndividualAdmins";
import PatronAuthServices from "./PatronAuthServices";
import SitewideSettings from "./SitewideSettings";
import MetadataServices from "./MetadataServices";
import AnalyticsServices from "./AnalyticsServices";
import CDNServices from "./CDNServices";
import SearchServices from "./SearchServices";
import StorageServices from "./StorageServices";
import CatalogServices from "./CatalogServices";
import DiscoveryServices from "./DiscoveryServices";
import LoggingServices from "./LoggingServices";
import { TabContainer, TabContainerProps, TabContainerContext } from "./TabContainer";
import Admin from "../models/Admin";

export interface ConfigTabContainerProps extends TabContainerProps {
  editOrCreate?: string;
  identifier?: string;
}

export interface ConfigTabContainerContext extends TabContainerContext {
  admin: Admin;
}

/** Body of the system configuration page, with a tab for each type of
    service that can be configured. */
export default class ConfigTabContainer extends TabContainer<ConfigTabContainerProps> {
  context: ConfigTabContainerContext;
  static contextTypes: React.ValidationMap<ConfigTabContainerContext> = {
    router: React.PropTypes.object.isRequired,
    pathFor: React.PropTypes.func.isRequired,
    admin: React.PropTypes.object.isRequired
  };

  tabs() {
    const tabs = {};
    if (this.context.admin.isLibraryManagerOfSomeLibrary()) {
      tabs["libraries"] = (
        <Libraries
          store={this.props.store}
          csrfToken={this.props.csrfToken}
          editOrCreate={this.props.editOrCreate}
          identifier={this.props.identifier}
          />
      );
      tabs["individualAdmins"] = (
        <IndividualAdmins
          store={this.props.store}
          csrfToken={this.props.csrfToken}
          editOrCreate={this.props.editOrCreate}
          identifier={this.props.identifier}
          />
      );
    }
    if (this.context.admin.isSystemAdmin()) {
      tabs["collections"] = (
        <Collections
          store={this.props.store}
          csrfToken={this.props.csrfToken}
          editOrCreate={this.props.editOrCreate}
          identifier={this.props.identifier}
          />
      );
      tabs["adminAuth"] = (
        <AdminAuthServices
          store={this.props.store}
          csrfToken={this.props.csrfToken}
          editOrCreate={this.props.editOrCreate}
          identifier={this.props.identifier}
          />
      );
      tabs["patronAuth"] = (
        <PatronAuthServices
          store={this.props.store}
          csrfToken={this.props.csrfToken}
          editOrCreate={this.props.editOrCreate}
          identifier={this.props.identifier}
          />
      );
      tabs["sitewideSettings"] = (
        <SitewideSettings
          store={this.props.store}
          csrfToken={this.props.csrfToken}
          editOrCreate={this.props.editOrCreate}
          identifier={this.props.identifier}
          />
      );
      tabs["logging"] = (
        <LoggingServices
          store={this.props.store}
          csrfToken={this.props.csrfToken}
          editOrCreate={this.props.editOrCreate}
          identifier={this.props.identifier}
          />
      );
      tabs["metadata"] = (
        <MetadataServices
          store={this.props.store}
          csrfToken={this.props.csrfToken}
          editOrCreate={this.props.editOrCreate}
          identifier={this.props.identifier}
          />
      );
      tabs["analytics"] = (
        <AnalyticsServices
          store={this.props.store}
          csrfToken={this.props.csrfToken}
          editOrCreate={this.props.editOrCreate}
          identifier={this.props.identifier}
          />
      );
      tabs["cdn"] = (
        <CDNServices
          store={this.props.store}
          csrfToken={this.props.csrfToken}
          editOrCreate={this.props.editOrCreate}
          identifier={this.props.identifier}
          />
      );
      tabs["search"] = (
        <SearchServices
          store={this.props.store}
          csrfToken={this.props.csrfToken}
          editOrCreate={this.props.editOrCreate}
          identifier={this.props.identifier}
          />
      );
      tabs["storage"] = (
        <StorageServices
          store={this.props.store}
          csrfToken={this.props.csrfToken}
          editOrCreate={this.props.editOrCreate}
          identifier={this.props.identifier}
          />
      );
      tabs["catalogServices"] = (
        <CatalogServices
          store={this.props.store}
          csrfToken={this.props.csrfToken}
          editOrCreate={this.props.editOrCreate}
          identifier={this.props.identifier}
          />
      );
      tabs["discovery"] = (
        <DiscoveryServices
          store={this.props.store}
          csrfToken={this.props.csrfToken}
          editOrCreate={this.props.editOrCreate}
          identifier={this.props.identifier}
          />
      );
    }
    return tabs;
  }

  handleSelect(event) {
    let tab = event.target.dataset.tabkey;
    if (this.context.router) {
      this.context.router.push("/admin/web/config/" + tab);
    }
  }

  tabDisplayName(name) {
    if (name === "adminAuth") {
      return "Admin Authentication";
    } else if (name === "individualAdmins") {
      return "Admins";
    } else if (name === "patronAuth") {
      return "Patron Authentication";
    } else if (name === "sitewideSettings") {
      return "Sitewide Settings";
    } else if (name === "cdn") {
      return "CDN";
    } else if (name === "catalogServices") {
      return "External Catalogs";
    } else {
      return super.tabDisplayName(name);
    }
  }

  defaultTab() {
    return "libraries";
  }
}
