import { createContext, useContext } from "react";
import { FeatureFlags, TestingFlags } from "../interfaces";
import Admin from "../models/Admin";

export type AppContextType = {
  csrfToken: string;
  settingUp: boolean;
  admin: Admin;
  featureFlags: FeatureFlags;
  quicksightPagePath: string;
  // These flags are used only during testing and are discouraged wherever possible.
  testingFlags?: { [key: string]: boolean };
};

// Don't export this, since we always want the error handling behavior of our hook.
const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppContext povider.");
  }
  return context;
};

const flagEnabled = (flags: TestingFlags, flagName: string) => {
  // A flag must be affirmatively set and `true` to be considered "enabled".
  return !!flags?.[flagName];
};
export const useTestingFlagEnabled = (flagName: string) => {
  const testingFlags = useAppContext().testingFlags;
  return flagEnabled(testingFlags, flagName);
};

export const useCsrfToken = () => useAppContext().csrfToken;
export const useAppAdmin = () => useAppContext().admin;
export const useAppEmail = () => useAppAdmin().email;
export const useAppFeatureFlags = () => useAppContext().featureFlags;

export default AppContext.Provider;
