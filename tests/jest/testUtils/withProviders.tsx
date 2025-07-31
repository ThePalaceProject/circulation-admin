import * as React from "react";
import { Provider, ProviderProps } from "react-redux";
import ContextProvider, {
  ContextProviderProps,
} from "../../../src/components/ContextProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, RenderOptions, RenderResult } from "@testing-library/react";
import { defaultFeatureFlags } from "../../../src/utils/featureFlags";
import { store } from "../../../src/store";
import { ConfigurationSettings } from "../../../src/interfaces";

export type TestProviderWrapperOptions = {
  reduxProviderProps?: ProviderProps;
  appConfigSettings?: Partial<ConfigurationSettings>;
  queryClient?: QueryClient;
};
export type TestRenderWrapperOptions = TestProviderWrapperOptions & {
  renderOptions?: Omit<RenderOptions, "queries">;
};

// The `store` argument is required for the Redux Provider and should
// be the same for both the Redux Provider and the ContextProvider.
const defaultReduxStore = store;

// Some config settings from the server are required, so we provide
// default values here, so they can be easily merged with other props.
const requiredAppConfigSettings: Partial<ConfigurationSettings> = {
  csrfToken: "",
  featureFlags: defaultFeatureFlags,
};

/**
 * Returns a component, composed with our providers, that can be used to wrap
 * a React element for testing.
 *
 * @param {TestProviderWrapperOptions} options
 * @param options.reduxProviderProps Props to pass to the Redux `Provider` wrapper
 * @param {ConfigurationSettings} options.appConfigSettings
 * @param {QueryClient} options.queryClient A `tanstack/react-query` QueryClient
 * @returns {React.FunctionComponent} A React component that wraps children with our providers
 */
export const componentWithProviders = ({
  reduxProviderProps = {
    store: defaultReduxStore,
  },
  appConfigSettings = {},
  queryClient = new QueryClient(),
}: TestProviderWrapperOptions = {}): React.FunctionComponent => {
  const config = { ...requiredAppConfigSettings, ...appConfigSettings };
  const effectiveContextProviderProps = {
    config: config as ConfigurationSettings,
    ...reduxProviderProps.store, // Context and Redux Provider stores must match.
  } as ContextProviderProps;
  const wrapper = ({ children }) => (
    <Provider {...reduxProviderProps}>
      <ContextProvider {...effectiveContextProviderProps}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </ContextProvider>
    </Provider>
  );
  wrapper.displayName = "TestWrapperComponent";
  return wrapper;
};

/**
 * Renders a React element with specified providers and provides a function for re-rendering with the same context.
 *
 * @param {React.ReactElement} renderChildren The element to render
 * @param {TestRenderWrapperOptions} testRenderOptions Options for rendering with providers
 * @returns {RenderResult} The result of rendering, including re-rendering functionality
 */
export const renderWithProviders = (
  renderChildren: React.ReactElement,
  testRenderOptions: TestRenderWrapperOptions = {}
): RenderResult => {
  const wrapper = componentWithProviders(testRenderOptions);
  const renderResult = render(
    wrapper({ children: renderChildren }),
    testRenderOptions.renderOptions
  );

  const rerenderWithProviders = (reRenderChildren: React.ReactElement) => {
    return renderResult.rerender(wrapper({ children: reRenderChildren }));
  };

  return {
    ...renderResult,
    rerender: rerenderWithProviders,
  };
};
