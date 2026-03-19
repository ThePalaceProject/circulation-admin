import * as React from "react";
import * as PropTypes from "prop-types";
import { TabContainerContext } from "../shared/TabContainer";

export interface TroubleshootingTabContainerProps {
  tab: string;
  goToTab: (tabName: string) => void;
  subtab?: string;
}

export default class TroubleshootingTabContainer extends React.Component<
  TroubleshootingTabContainerProps
> {
  static contextTypes: React.ValidationMap<TabContainerContext> = {
    router: PropTypes.object.isRequired,
    pathFor: PropTypes.func.isRequired,
  };
  context: TabContainerContext;

  constructor(props: TroubleshootingTabContainerProps) {
    super(props);
    this.handleSelect = this.handleSelect.bind(this);
  }

  handleSelect(event: React.MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    const tab = event.currentTarget.dataset.tabkey;
    this.props.goToTab(tab!);
    if (this.context.router) {
      this.context.router.push(`/admin/web/troubleshooting/${tab}`);
    }
  }

  render() {
    const { tab } = this.props;
    const tabs = ["diagnostics", "self-tests"];
    return (
      <ul className="nav-tabs">
        {tabs.map((name) => (
          <li key={name} className={tab === name ? "active" : undefined}>
            <a href={`#${name}`} onClick={this.handleSelect} data-tabkey={name}>
              {name.charAt(0).toUpperCase() + name.slice(1)}
            </a>
          </li>
        ))}
      </ul>
    );
  }
}
