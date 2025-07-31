import { createContext, useContext } from "react";
import {
  ConfigurationSettings,
  DashboardCollectionsBarChart,
  FeatureFlags,
} from "../interfaces";
import Admin from "../models/Admin";

export type AppContextType = {
  csrfToken: string;
  settingUp: boolean;
  admin: Admin;
  tos_link_text?: string;
  tos_link_href?: string;
  supportContact?: SupportContactLink;
  support_contact_url?: string; // Deprecated: Use `supportContactUrl`, instead.
  supportContactUrl?: string;
  supportContactText?: string;
  featureFlags: FeatureFlags;
  quicksightPagePath: string;
  dashboardCollectionsBarChart?: DashboardCollectionsBarChart;
};

type TermsOfServiceContext = {
  text?: string;
  href?: string;
};
export type SupportContactLink = {
  href: string;
  text: string;
};

export const DEFAULT_SUPPORT_CONTACT_TEXT = "Contact support.";

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
export const useSupportContact = () => useAppContext().supportContact;

/**
 * Create a SupportContactLink object from a URL and label text.
 * If the URL is absent, then we return undefined.
 * @param supportContactUrl
 * @param supportContactText
 * @returns SupportContactLink | undefined
 */
export const supportContactLinkFromConfig = ({
  support_contact_url: deprecatedSupportContactUrl,
  supportContactUrl: newSupportContactUrl,
  supportContactText,
}: Partial<ConfigurationSettings>): SupportContactLink | undefined => {
  // TODO: Remove `supportContactUrl` here and remove alias above when
  //  deprecated `support_contact_url` is removed.
  const supportContactUrl = newSupportContactUrl || deprecatedSupportContactUrl;
  if (!supportContactUrl) {
    return undefined;
  }
  // If link text is specified, then we can just return that.
  if (supportContactText) {
    return {
      href: supportContactUrl,
      text: supportContactText,
    };
  }
  // Otherwise, let's try and find a reasonable value for the link text.
  const { protocol, pathname } = new URL(supportContactUrl);
  const text =
    protocol === "mailto:"
      ? `Email ${pathname}.`
      : DEFAULT_SUPPORT_CONTACT_TEXT;
  return {
    href: supportContactUrl,
    text: text,
  };
};

export default AppContext.Provider;
