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
import DiscoveryServices from "./DiscoveryServices";
import LoggingServices from "./LoggingServices";
import { TabContainer, TabContainerProps } from "./TabContainer";

export interface ConfigTabContainerProps extends TabContainerProps {
  editOrCreate?: string;
  identifier?: string;
}

/** Body of the system configuration page, with a tab for each type of
    service that can be configured. */
export default class ConfigTabContainer extends TabContainer<ConfigTabContainerProps> {
  tabs() {
    return {
      libraries: (
        <Libraries
          store={this.props.store}
          csrfToken={this.props.csrfToken}
          editOrCreate={this.props.editOrCreate}
          identifier={this.props.identifier}
          />
      ),
      collections: (
        <Collections
          store={this.props.store}
          csrfToken={this.props.csrfToken}
          editOrCreate={this.props.editOrCreate}
          identifier={this.props.identifier}
          />
      ),
      adminAuth: (
        <AdminAuthServices
          store={this.props.store}
          csrfToken={this.props.csrfToken}
          editOrCreate={this.props.editOrCreate}
          identifier={this.props.identifier}
          />
      ),
      individualAdmins: (
        <IndividualAdmins
          store={this.props.store}
          csrfToken={this.props.csrfToken}
          editOrCreate={this.props.editOrCreate}
          identifier={this.props.identifier}
          />
      ),
      patronAuth: (
        <PatronAuthServices
          store={this.props.store}
          csrfToken={this.props.csrfToken}
          editOrCreate={this.props.editOrCreate}
          identifier={this.props.identifier}
          />
      ),
      sitewideSettings: (
        <SitewideSettings
          store={this.props.store}
          csrfToken={this.props.csrfToken}
          editOrCreate={this.props.editOrCreate}
          identifier={this.props.identifier}
          />
      ),
      loggingServices: (
        <LoggingServices
          store={this.props.store}
          csrfToken={this.props.csrfToken}
          editOrCreate={this.props.editOrCreate}
          identifier={this.props.identifier}
          />
      ),
      metadata: (
        <MetadataServices
          store={this.props.store}
          csrfToken={this.props.csrfToken}
          editOrCreate={this.props.editOrCreate}
          identifier={this.props.identifier}
          />
      ),
      analytics: (
        <AnalyticsServices
          store={this.props.store}
          csrfToken={this.props.csrfToken}
          editOrCreate={this.props.editOrCreate}
          identifier={this.props.identifier}
          />
      ),
      cdn: (
        <CDNServices
          store={this.props.store}
          csrfToken={this.props.csrfToken}
          editOrCreate={this.props.editOrCreate}
          identifier={this.props.identifier}
          />
      ),
      search: (
        <SearchServices
          store={this.props.store}
          csrfToken={this.props.csrfToken}
          editOrCreate={this.props.editOrCreate}
          identifier={this.props.identifier}
          />
      ),
      storage: (
        <StorageServices
          store={this.props.store}
          csrfToken={this.props.csrfToken}
          editOrCreate={this.props.editOrCreate}
          identifier={this.props.identifier}
          />
      ),
      discovery: (
        <DiscoveryServices
          store={this.props.store}
          csrfToken={this.props.csrfToken}
          editOrCreate={this.props.editOrCreate}
          identifier={this.props.identifier}
          />
      ),
    };
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
      return "Individual Admins";
    } else if (name === "patronAuth") {
      return "Patron Authentication";
    } else if (name === "sitewideSettings") {
      return "Sitewide Settings";
    } else if (name === "cdn") {
      return "CDN";
    } else if (name === "loggingServices") {
      return "Logging";
    } else {
      return super.tabDisplayName(name);
    }
  }

  defaultTab() {
    return "libraries";
  }
}
