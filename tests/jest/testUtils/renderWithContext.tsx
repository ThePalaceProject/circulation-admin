import * as React from "react";
import { render, RenderOptions, RenderResult } from "@testing-library/react";
import ContextProvider, {
  ContextProviderProps,
} from "../../../src/components/ContextProvider";

/**
 * Renders a given React element, wrapped in a ContextProvider. The resulting rerender function is
 * also wrapped, so that rerenders will have the identical context.
 *
 * @param ui                   The element to render
 * @param contextProviderProps Props to pass to the ContextProvider wrapper
 * @param renderOptions        Options to pass through to the RTL render function
 * @returns
 */
export default function renderWithContext(
  ui: React.ReactElement,
  contextProviderProps: ContextProviderProps,
  renderOptions?: Omit<RenderOptions, "queries">
): RenderResult {
  const renderResult = render(
    <ContextProvider {...contextProviderProps}>{ui}</ContextProvider>,
    renderOptions
  );

  const rerenderWithContext = (ui) => {
    return renderResult.rerender(
      <ContextProvider {...contextProviderProps}>{ui}</ContextProvider>
    );
  };

  return {
    ...renderResult,
    rerender: rerenderWithContext,
  };
}
