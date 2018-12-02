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

  LIBRARY_MANAGER_TABS = ["libraries", "individualAdmins"];
  SYSTEM_ADMIN_TABS = ["collections", "adminAuth", "patronAuth", "sitewideSettings",
                       "logging", "metadata", "analytics", "cdn", "search", "storage",
                       "catalogServices", "discovery"];

  COMPONENT_CLASSES = {
    libraries: Libraries,
    individualAdmins: IndividualAdmins,
    collections: Collections,
    adminAuth: AdminAuthServices,
    patronAuth: PatronAuthServices,
    sitewideSettings: SitewideSettings,
    logging: LoggingServices,
    metadata: MetadataServices,
    analytics: AnalyticsServices,
    cdn: CDNServices,
    search: SearchServices,
    storage: StorageServices,
    catalogServices: CatalogServices,
    discovery: DiscoveryServices
  };

  DISPLAY_NAMES = {
    adminAuth: "Admin Authentication",
    individualAdmins: "Admins",
    patronAuth: "Patron Authentication",
    sitewideSettings: "Sitewide Settings",
    cdn: "CDN",
    catalogServices: "External Catalogs"
  };

  tabs() {
    const tabs = {};
    if (this.context.admin.isLibraryManagerOfSomeLibrary()) {
      for (let tab of this.LIBRARY_MANAGER_TABS) {
        let ComponentClass = this.COMPONENT_CLASSES[tab];
        tabs[tab] = (
          <ComponentClass
            store={this.props.store}
            csrfToken={this.props.csrfToken}
            editOrCreate={this.props.editOrCreate}
            identifier={this.props.identifier}
            />
        );
      }
    }
    if (this.context.admin.isSystemAdmin()) {
      for (let tab of this.SYSTEM_ADMIN_TABS) {
        let ComponentClass = this.COMPONENT_CLASSES[tab];
        tabs[tab] = (
          <ComponentClass
            store={this.props.store}
            csrfToken={this.props.csrfToken}
            editOrCreate={this.props.editOrCreate}
            identifier={this.props.identifier}
            />
        );
      }
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
    if (this.DISPLAY_NAMES[name]) {
      return this.DISPLAY_NAMES[name];
    } else {
      return super.tabDisplayName(name);
    }
  }

  defaultTab() {
    return "libraries";
  }
}
