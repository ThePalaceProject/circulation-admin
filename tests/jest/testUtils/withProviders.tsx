import * as React from "react";
import ContextProvider, {
  ContextProviderProps,
} from "../../../src/components/ContextProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export type TestProviderWrapperProps = {
  contextProviderProps?: ContextProviderProps;
  queryClient?: QueryClient;
};

// The `csrfToken` context provider prop is required, so we provide
// a default value here, so it can be easily merged with other props.
const defaultContextProviderProps = { csrfToken: "" };

/**
 * Returns a component, composed with our providers, that can be used to wrap
 * a piece of UI for testing.
 *
 * @param contextProviderProps Props to pass to the ContextProvider wrapper
 * @param queryClient          A `tanstack/react-query` QueryClient.
 */
export const componentWithProviders = ({
  contextProviderProps = { csrfToken: "" },
  queryClient = new QueryClient(),
}: TestProviderWrapperProps) => {
  const effectiveContextProviderProps = {
    ...defaultContextProviderProps,
    ...contextProviderProps,
  };
  const wrapper = ({ children }) => (
    <ContextProvider {...effectiveContextProviderProps}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </ContextProvider>
  );
  wrapper.displayName = "TestWrapperComponent";
  return wrapper;
};
