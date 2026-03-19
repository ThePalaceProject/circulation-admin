import * as React from "react";
import { render, RenderOptions, RenderResult } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ContextProvider, {
  ContextProviderProps,
} from "../../../src/components/layout/ContextProvider";
import { ConfigurationSettings } from "../../../src/interfaces";

/**
 * Renders a given React element, wrapped in a ContextProvider. The resulting rerender function is
 * also wrapped, so that rerenders will have the identical context.
 *
 * @param ui                   The element to render
 * @param config Props to pass to the ContextProvider wrapper
 * @param renderOptions        Options to pass through to the RTL render function
 * @returns
 */
export default function renderWithContext(
  ui: React.ReactElement,
  config: Partial<ConfigurationSettings>,
  renderOptions?: Omit<RenderOptions, "queries">
): RenderResult {
  const contextProviderProps = { config } as ContextProviderProps;
  const renderResult = render(
    <MemoryRouter>
      <ContextProvider {...contextProviderProps}>{ui}</ContextProvider>
    </MemoryRouter>,
    renderOptions
  );

  const rerenderWithContext = (ui) => {
    return renderResult.rerender(
      <MemoryRouter>
        <ContextProvider {...contextProviderProps}>{ui}</ContextProvider>
      </MemoryRouter>
    );
  };

  return {
    ...renderResult,
    rerender: rerenderWithContext,
  };
}
