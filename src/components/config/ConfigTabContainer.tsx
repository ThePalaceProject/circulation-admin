import * as React from "react";
import Libraries from "./Libraries";
import Collections from "./Collections";
import IndividualAdmins from "./IndividualAdmins";
import PatronAuthServices from "./PatronAuthServices";
import SitewideAnnouncements from "../announcements/SitewideAnnouncements";
import MetadataServices from "./MetadataServices";
import CatalogServices from "./CatalogServices";
import DiscoveryServices from "./DiscoveryServices";
import {
  TabContainer,
  TabContainerProps,
} from "../shared/TabContainer";
import Admin from "../../models/Admin";
import { withAppContext } from "../../utils/withAppContext";
import { withRoutingContext } from "../../utils/withRoutingContext";

export interface ConfigTabContainerProps extends TabContainerProps {
  editOrCreate?: string;
  identifier?: string;
  className?: string;
  admin?: Admin;
}

/** Body of the system configuration page, with a tab for each type of service that can be configured. */
export class ConfigTabContainer extends TabContainer<
  ConfigTabContainerProps
> {
  // HOC PATTERN: `admin` is injected via withAppContext at export,
  // replacing legacy contextTypes: { admin }.

  static defaultProps = {
    className: "vertical-tabs",
  };

  // Helper to get required props for tab components
  getTabProps() {
    return {
      csrfToken: this.props.csrfToken,
      editOrCreate: this.props.editOrCreate,
      identifier: this.props.identifier,
    };
  }

  SYSTEM_ADMIN_TABS() {
    return {
      libraries: <Libraries {...this.getTabProps()} />,
      collections: <Collections {...this.getTabProps()} />,
      individualAdmins: <IndividualAdmins {...this.getTabProps()} />,
      patronAuthServices: <PatronAuthServices {...this.getTabProps()} />,
      sitewideAnnouncements: <SitewideAnnouncements {...this.getTabProps()} />,
      metadataServices: <MetadataServices {...this.getTabProps()} />,
      catalogServices: <CatalogServices {...this.getTabProps()} />,
      discoveryServices: <DiscoveryServices {...this.getTabProps()} />,
    };
  }

  LIBRARY_MANAGER_TABS() {
    return {
      libraries: <Libraries {...this.getTabProps()} />,
      collections: <Collections {...this.getTabProps()} />,
      patronAuthServices: <PatronAuthServices {...this.getTabProps()} />,
      sitewideAnnouncements: <SitewideAnnouncements {...this.getTabProps()} />,
      metadataServices: <MetadataServices {...this.getTabProps()} />,
      catalogServices: <CatalogServices {...this.getTabProps()} />,
      discoveryServices: <DiscoveryServices {...this.getTabProps()} />,
    };
  }

  LIBRARIAN_TABS() {
    return {
      libraries: <Libraries {...this.getTabProps()} />,
      collections: <Collections {...this.getTabProps()} />,
      sitewideAnnouncements: <SitewideAnnouncements {...this.getTabProps()} />,
      metadataServices: <MetadataServices {...this.getTabProps()} />,
      catalogServices: <CatalogServices {...this.getTabProps()} />,
      discoveryServices: <DiscoveryServices {...this.getTabProps()} />,
    };
  }

  DISPLAY_NAMES = {
    libraries: "Libraries",
    collections: "Collections",
    individualAdmins: "Admins",
    patronAuthServices: "Patron Authentication",
    sitewideAnnouncements: "Announcements",
    metadataServices: "Metadata",
    catalogServices: "Catalog",
    discoveryServices: "Discovery",
  };

  tabs() {
    if (this.props.admin?.isSystemAdmin()) {
      return this.SYSTEM_ADMIN_TABS();
    } else if (this.props.admin?.isLibraryManagerOfSomeLibrary()) {
      return this.LIBRARY_MANAGER_TABS();
    } else {
      return this.LIBRARIAN_TABS();
    }
  }

  handleSelect(event) {
    const tab = event.target.dataset.tabkey;
    if (this.props.router) {
      this.props.router.push("/admin/web/config/" + tab);
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

export default withRoutingContext(withAppContext(ConfigTabContainer));
