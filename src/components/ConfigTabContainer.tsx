import * as React from "react";
import * as PropTypes from "prop-types";
import Libraries from "./Libraries";
import Collections from "./Collections";
import IndividualAdmins from "./IndividualAdmins";
import PatronAuthServices from "./PatronAuthServices";
import SitewideAnnouncements from "./SitewideAnnouncements";
import MetadataServices from "./MetadataServices";
import CatalogServices from "./CatalogServices";
import DiscoveryServices from "./DiscoveryServices";
import {
  TabContainer,
  TabContainerProps,
  TabContainerContext,
} from "./TabContainer";
import Admin from "../models/Admin";

export interface ConfigTabContainerProps extends TabContainerProps {
  editOrCreate?: string;
  identifier?: string;
  class?: string;
}

export interface ConfigTabContainerContext extends TabContainerContext {
  admin: Admin;
}

/** Body of the system configuration page, with a tab for each type of
    service that can be configured. */
export default class ConfigTabContainer extends TabContainer<
  ConfigTabContainerProps
> {
  context: ConfigTabContainerContext;
  static contextTypes: React.ValidationMap<ConfigTabContainerContext> = {
    router: PropTypes.object.isRequired,
    pathFor: PropTypes.func.isRequired,
    admin: PropTypes.object.isRequired as React.Validator<Admin>,
  };

  COMPONENT_CLASSES = {
    libraries: Libraries,
    individualAdmins: IndividualAdmins,
    collections: Collections,
    patronAuth: PatronAuthServices,
    metadata: MetadataServices,
    catalogServices: CatalogServices,
    discovery: DiscoveryServices,
    sitewideAnnouncements: SitewideAnnouncements,
  };

  LIBRARIAN_TABS = ["libraries"];
  LIBRARY_MANAGER_TABS = [...this.LIBRARIAN_TABS, "individualAdmins"];
  SYSTEM_ADMIN_TABS = Object.keys(this.COMPONENT_CLASSES);

  DISPLAY_NAMES = {
    individualAdmins: "Admins",
    patronAuth: "Patron Authentication",
    sitewideAnnouncements: "Sitewide Announcements",
    catalogServices: "External Catalogs",
  };

  tabs() {
    const tabs = {};
    const makeTabs = (tabNames) => {
      for (const tab of tabNames) {
        const ComponentClass = this.COMPONENT_CLASSES[tab];
        tabs[tab] = (
          <ComponentClass
            store={this.props.store}
            csrfToken={this.props.csrfToken}
            editOrCreate={this.props.editOrCreate}
            identifier={this.props.identifier}
          />
        );
      }
    };
    let tabNames;
    if (this.context.admin.isSystemAdmin()) {
      tabNames = this.SYSTEM_ADMIN_TABS;
    } else if (this.context.admin.isLibraryManagerOfSomeLibrary()) {
      tabNames = this.LIBRARY_MANAGER_TABS;
    } else {
      tabNames = this.LIBRARIAN_TABS;
    }
    makeTabs(tabNames);
    return tabs;
  }

  handleSelect(event) {
    const tab = event.target.dataset.tabkey;
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
