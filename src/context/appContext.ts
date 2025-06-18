import { createContext, useContext } from "react";
import { DashboardCollectionsBarChart, FeatureFlags } from "../interfaces";
import Admin from "../models/Admin";

export type AppContextType = {
  csrfToken: string;
  settingUp: boolean;
  admin: Admin;
  tos_link_text?: string;
  tos_link_href?: string;
  featureFlags: FeatureFlags;
  quicksightPagePath: string;
  dashboardCollectionsBarChart?: DashboardCollectionsBarChart;
};

type TermsOfServiceContext = {
  text?: string;
  href?: string;
};

// Don't export this, since we always want the error handling behavior of our hook.
const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error(
      "useAppContext must be used within an AppContext provider."
    );
  }
  return context;
};

export const useCsrfToken = () => useAppContext().csrfToken;
export const useAppAdmin = () => useAppContext().admin;
export const useAppEmail = () => useAppAdmin().email;
export const useAppFeatureFlags = () => useAppContext().featureFlags;
export const useDashboardCollectionsBarChartSettings = () =>
  useAppContext().dashboardCollectionsBarChart;
export const useTermsOfService = (): TermsOfServiceContext => ({
  text: useAppContext().tos_link_text,
  href: useAppContext().tos_link_href,
});

export default AppContext.Provider;
