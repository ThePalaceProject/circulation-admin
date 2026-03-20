/**
 * HOC PATTERN: withAppContext
 *
 * Injects AppContext values (admin, csrfToken, settingUp, featureFlags,
 * editorStore) as props into legacy class components, replacing the legacy
 * React `contextTypes` API which was removed in React 19.
 *
 * Usage:
 *   // HOC PATTERN: This component is wrapped with withAppContext() at export
 *   // to inject [admin, csrfToken, editorStore, ...] as props, replacing legacy contextTypes.
 *   export default withAppContext(MyClassComponent);
 */
import * as React from "react";
import { Store } from "@reduxjs/toolkit";
import Admin from "../models/Admin";
import { FeatureFlags } from "../interfaces";
import { RootState } from "../store";
import { useAppContext } from "../context/appContext";

export interface AppContextInjectedProps {
  admin: Admin;
  csrfToken: string;
  settingUp: boolean;
  featureFlags: FeatureFlags;
  editorStore: Store<RootState>;
}

export function withAppContext<P>(WrappedComponent: React.ComponentType<P>) {
  const displayName =
    (WrappedComponent as any).displayName ||
    (WrappedComponent as any).name ||
    "Component";

  function WithAppContext(props: P) {
    let context: AppContextInjectedProps | undefined;
    // Allow tests or isolated renders without AppContext provider.
    try {
      context = useAppContext() as AppContextInjectedProps;
    } catch {
      context = undefined;
    }
    return (
      <WrappedComponent
        {...(props as any)}
        {...(context as any)}
      />
    );
  }
  WithAppContext.displayName = `withAppContext(${displayName})`;
  return WithAppContext as React.ComponentType<P>;
}
