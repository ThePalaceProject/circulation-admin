import * as React from "react";
import {
  RouterCompat,
  withRoutingContext,
} from "../../utils/withRoutingContext";

export interface TroubleshootingTabContainerProps {
  tab: string;
  goToTab: (tabName: string) => void;
  subtab?: string;
  // HOC PATTERN: injected by withRoutingContext() replacing legacy contextTypes.
  router?: RouterCompat;
}

export class TroubleshootingTabContainer extends React.Component<
  TroubleshootingTabContainerProps
> {
  constructor(props: TroubleshootingTabContainerProps) {
    super(props);
    this.handleSelect = this.handleSelect.bind(this);
  }

  handleSelect(event: React.MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    const tab = event.currentTarget.dataset.tabkey;
    if (!tab) {
      return;
    }
    this.props.goToTab(tab);
    if (this.props.router) {
      this.props.router.push(`/admin/web/troubleshooting/${tab}`);
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

export default withRoutingContext(TroubleshootingTabContainer);
