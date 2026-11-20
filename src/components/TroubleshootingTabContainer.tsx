import * as React from "react";
import { TabContainer, TabContainerProps } from "./TabContainer";
import { useLegacyRouter } from "./LegacyRouterBridge";
import TroubleshootingCategoryPage from "./TroubleshootingCategoryPage";

export interface TroubleshootingTabContainerProps extends TabContainerProps {
  goToTab: (tabName: string) => void;
  subtab?: string;
}

export class TroubleshootingTabContainer extends TabContainer<TroubleshootingTabContainerProps> {
  tabs() {
    return {
      diagnostics: (
        <TroubleshootingCategoryPage
          subtab={
            this.props.tab === "diagnostics"
              ? this.props.subtab
              : "coverage_provider"
          }
          type="diagnostics"
        />
      ),
      "self-tests": (
        <TroubleshootingCategoryPage
          subtab={
            this.props.tab === "self-tests" ? this.props.subtab : "collections"
          }
          type="self-tests"
        />
      ),
    };
  }

  UNSAFE_componentWillReceiveProps(newProps: TroubleshootingTabContainerProps) {
    newProps.tab !== this.props.tab &&
      this.route(newProps.tab, newProps.subtab);
  }

  handleSelect(event) {
    const tab = event.currentTarget.dataset.tabkey;
    const subtab = this.props.subtab;
    this.props.goToTab(tab);
    this.route(tab, subtab);
  }

  route(tab: string, subtab: string) {
    if (this.props.router) {
      this.props.router.push(`/admin/web/troubleshooting/${tab}/${subtab}`);
    }
  }
}

/** Provides `TroubleshootingTabContainer` the `router`, read with a hook. */
const TroubleshootingTabContainerWithRouter = (
  props: Omit<TroubleshootingTabContainerProps, "router">
) => {
  const router = useLegacyRouter();
  return <TroubleshootingTabContainer {...props} router={router} />;
};

export default TroubleshootingTabContainerWithRouter;
