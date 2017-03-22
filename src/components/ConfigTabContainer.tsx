import * as React from "react";
import Libraries from "./Libraries";
import Collections from "./Collections";
import { TabContainer, TabContainerProps } from "./TabContainer";

export interface ConfigTabContainerProps extends TabContainerProps {
  editOrCreate?: string;
  identifier?: string;
}

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
      )
    };
  }

  handleSelect(event) {
    let tab = event.target.dataset.tabkey;
    if (this.context.router) {
      this.context.router.push("/admin/web/config/" + tab);
    }
  }

  defaultTab() {
    return "libraries";
  }
}