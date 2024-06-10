import * as React from "react";
import ContextProvider, {
  ContextProviderProps,
} from "../../../src/components/ContextProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, RenderOptions, RenderResult } from "@testing-library/react";
import { featureFlagsWithDefaults } from "../../../src/utils/featureFlags";

export type TestProviderWrapperOptions = {
  contextProviderProps?: Partial<ContextProviderProps>;
  queryClient?: QueryClient;
};
export type TestRenderWrapperOptions = TestProviderWrapperOptions & {
  renderOptions?: Omit<RenderOptions, "queries">;
};

// The `csrfToken` context provider prop is required, so we provide
// a default value here, so it can be easily merged with other props.
const defaultContextProviderProps: ContextProviderProps = {
  csrfToken: "",
  featureFlags: featureFlagsWithDefaults(),
};

/**
 * Returns a component, composed with our providers, that can be used to wrap
 * a React element for testing.
 *
 * @param {TestProviderWrapperOptions} options
 * @param {ContextProviderProps} options.contextProviderProps Props to pass to the ContextProvider wrapper
 * @param {QueryClient} options.queryClient A `tanstack/react-query` QueryClient
 * @returns {React.FunctionComponent} A React component that wraps children with our providers
 */
export const componentWithProviders = ({
  contextProviderProps = {
    csrfToken: "",
    featureFlags: featureFlagsWithDefaults(),
  },
  queryClient = new QueryClient(),
}: TestProviderWrapperOptions): React.FunctionComponent => {
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
