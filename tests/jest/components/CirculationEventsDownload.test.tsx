import * as React from "react";
import { screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";

import CirculationEventsDownload from "../../../src/components/CirculationEventsDownload";
import { ContextProviderProps } from "../../../src/components/ContextProvider";
import { FeatureFlags } from "../../../src/interfaces";
import { defaultFeatureFlags } from "../../../src/utils/featureFlags";
import { renderWithProviders } from "../testUtils/withProviders";

describe("CirculationEventsDownload", () => {
  it("renders nothing if showCircEventsDownload feature flag is false", () => {
    const featureFlags: FeatureFlags = {
      ...defaultFeatureFlags,
      showCircEventsDownload: false,
    };
    const contextProviderProps: Partial<ContextProviderProps> = {
      featureFlags,
    };
    const { container } = renderWithProviders(
      <CirculationEventsDownload library="testlib" />,
      {
        contextProviderProps,
      }
    );
    expect(container).toBeEmptyDOMElement();
  });

  describe("when showCircEventsDownload feature flag is true", () => {
    const featureFlags: FeatureFlags = {
      ...defaultFeatureFlags,
      showCircEventsDownload: true,
    };
    const libraryProp = "testlib";
    const contextProviderProps: Partial<ContextProviderProps> = {
      featureFlags,
    };

    beforeEach(() => {
      renderWithProviders(<CirculationEventsDownload library={libraryProp} />, {
        contextProviderProps,
      });
    });

    it("renders a download button", () => {
      expect(
        screen.getByRole("button", { name: "Download CSV" })
      ).toBeInTheDocument();
    });

    it("shows the form when the download button is clicked", () => {
      const downloadButton = screen.getByRole("button", {
        name: "Download CSV",
      });
      fireEvent.click(downloadButton);
      expect(
        screen.getByRole("heading", { name: "Download CSV" })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Download" })
      ).toBeInTheDocument();
      expect(screen.getByText("Start Date")).toBeInTheDocument();
      expect(screen.getByText("End Date")).toBeInTheDocument();
    });
  });
});
