import * as React from "react";
import { Provider, ProviderProps } from "react-redux";
import ContextProvider, {
  ContextProviderProps,
} from "../../../src/components/ContextProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, RenderOptions, RenderResult } from "@testing-library/react";
import { defaultFeatureFlags } from "../../../src/utils/featureFlags";
import { store } from "../../../src/store";

export type TestProviderWrapperOptions = {
  reduxProviderProps?: ProviderProps;
  contextProviderProps?: Partial<ContextProviderProps>;
  queryClient?: QueryClient;
};
export type TestRenderWrapperOptions = TestProviderWrapperOptions & {
  renderOptions?: Omit<RenderOptions, "queries">;
};

// The `store` argument is required for the Redux Provider and should
// be the same for both the Redux Provider and the ContextProvider.
const defaultReduxStore = store;

// // Setup default TOSContext provider props.
// const tosText = "Sample terms of service.";
// const tosHref = "http://example.com/terms-of-service";
// const requiredTOSContextProviderProps: TOSContextProviderProps = {
//   ...[tosText, tosHref],
// };

// The `csrfToken` context provider prop is required, so we provide
// a default value here, so it can be easily merged with other props.
const requiredContextProviderProps: ContextProviderProps = {
  csrfToken: "",
  featureFlags: defaultFeatureFlags,
};

/**
 * Returns a component, composed with our providers, that can be used to wrap
 * a React element for testing.
 *
 * @param {TestProviderWrapperOptions} options
 * @param options.reduxProviderProps Props to pass to the Redux `Provider` wrapper
 * @param {ContextProviderProps} options.contextProviderProps Props to pass to the ContextProvider wrapper
 * @param {QueryClient} options.queryClient A `tanstack/react-query` QueryClient
 * @returns {React.FunctionComponent} A React component that wraps children with our providers
 */
export const componentWithProviders = ({
  reduxProviderProps = {
    store: defaultReduxStore,
  },
  contextProviderProps = {
    csrfToken: "",
    featureFlags: defaultFeatureFlags,
  },
  queryClient = new QueryClient(),
}: TestProviderWrapperOptions = {}): React.FunctionComponent => {
  const effectiveContextProviderProps = {
    ...requiredContextProviderProps,
    ...contextProviderProps,
    ...reduxProviderProps.store, // Context and Redux Provider stores must match.
  };
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
