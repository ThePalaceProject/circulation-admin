import * as React from "react";
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import NeighborhoodAnalyticsForm from "../../../src/components/NeighborhoodAnalyticsForm";
import { SettingData } from "../../../src/interfaces";

const patronAuthSetting: SettingData = {
  key: "neighborhood_mode",
  label: "Patron Auth",
  options: [
    { key: "disabled", label: "Off" },
    { key: "choice1", label: "Choice 1" },
    { key: "choice2", label: "Choice 2" },
  ],
};

const analyticsSetting: SettingData = {
  key: "location_source",
  label: "Analytics",
  options: [
    { key: "disabled", label: "Off" },
    { key: "choice1", label: "Choice 1" },
    { key: "choice2", label: "Choice 2" },
  ],
};

// The Panel renders its body collapsed and `aria-hidden` by default, so the
// form is present in the DOM but hidden from the accessibility tree; query it
// through the container.
const getSelect = (container: HTMLElement) =>
  container.querySelector("select") as HTMLSelectElement;
const panelTitle = (container: HTMLElement) =>
  container.querySelector(".panel-title") as HTMLElement;
const warning = (container: HTMLElement) =>
  container.querySelector(".bg-warning") as HTMLElement | null;

describe("NeighborhoodAnalyticsForm", () => {
  it("renders a panel with the feature name", () => {
    const { container } = render(
      <NeighborhoodAnalyticsForm setting={patronAuthSetting} />
    );
    expect(container.querySelector(".panel")).toBeInTheDocument();
    expect(panelTitle(container)).toHaveTextContent(
      "Patron Neighborhood Analytics: Disabled"
    );
  });

  it("renders a select whose options reflect the setting", () => {
    const { container } = render(
      <NeighborhoodAnalyticsForm setting={patronAuthSetting} />
    );
    const options = Array.from(getSelect(container).querySelectorAll("option"));
    expect(options).toHaveLength(patronAuthSetting.options.length);
    options.forEach((option, idx) => {
      expect(option).toHaveValue(patronAuthSetting.options[idx].key);
      expect(option).toHaveTextContent(patronAuthSetting.options[idx].label);
    });
  });

  it("renders a warning message pointing at the paired service once enabled", async () => {
    const user = userEvent.setup();
    const { container, rerender } = render(
      <NeighborhoodAnalyticsForm setting={patronAuthSetting} />
    );

    // No warning while the feature is off.
    expect(warning(container)).not.toBeInTheDocument();
    await user.selectOptions(getSelect(container), "disabled");
    expect(warning(container)).not.toBeInTheDocument();

    // Enabling it surfaces a warning that links to the analytics config.
    await user.selectOptions(getSelect(container), "choice1");
    expect(warning(container)).toBeInTheDocument();
    expect(warning(container)).toHaveTextContent(
      "This feature will work only if it is also enabled in your local analytics service configuration settings."
    );
    expect(warning(container).querySelector("a")).toHaveAttribute(
      "href",
      "/admin/web/config/analytics"
    );

    // Switching the setting flips the paired service to patron auth.
    rerender(<NeighborhoodAnalyticsForm setting={analyticsSetting} />);
    expect(warning(container)).toHaveTextContent(
      "This feature will work only if it is also enabled in your patron authentication service configuration settings."
    );
    expect(warning(container).querySelector("a")).toHaveAttribute(
      "href",
      "/admin/web/config/patronAuth"
    );
  });

  it("updates the header when an option is chosen", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <NeighborhoodAnalyticsForm setting={patronAuthSetting} />
    );
    expect(panelTitle(container)).toHaveTextContent(
      "Patron Neighborhood Analytics: Disabled"
    );

    await user.selectOptions(getSelect(container), "choice1");
    expect(panelTitle(container)).toHaveTextContent(
      "Patron Neighborhood Analytics: Enabled"
    );
  });

  it("reflects the currentValue prop as the initial selection", () => {
    const { container } = render(
      <NeighborhoodAnalyticsForm
        setting={patronAuthSetting}
        currentValue="choice1"
      />
    );
    // A non-"disabled" currentValue means the feature starts enabled.
    expect(panelTitle(container)).toHaveTextContent(
      "Patron Neighborhood Analytics: Enabled"
    );
    expect(getSelect(container)).toHaveValue("choice1");
  });

  it("tells the user whether the feature is currently enabled", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <NeighborhoodAnalyticsForm setting={patronAuthSetting} />
    );

    expect(panelTitle(container)).toHaveTextContent("Disabled");
    await user.selectOptions(getSelect(container), "choice1");
    expect(panelTitle(container)).toHaveTextContent("Enabled");
    await user.selectOptions(getSelect(container), "choice2");
    expect(panelTitle(container)).toHaveTextContent("Enabled");
    await user.selectOptions(getSelect(container), "disabled");
    expect(panelTitle(container)).toHaveTextContent("Disabled");
  });

  it("shows the warning only for enabled selections", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <NeighborhoodAnalyticsForm setting={patronAuthSetting} />
    );

    expect(warning(container)).not.toBeInTheDocument();
    await user.selectOptions(getSelect(container), "choice1");
    expect(warning(container)).toBeInTheDocument();
    await user.selectOptions(getSelect(container), "choice2");
    expect(warning(container)).toBeInTheDocument();
    await user.selectOptions(getSelect(container), "disabled");
    expect(warning(container)).not.toBeInTheDocument();
  });

  it("exposes the selected value through its getValue ref API", async () => {
    // ServiceEditForm reads the chosen value via this imperative ref API.
    const user = userEvent.setup();
    const ref = React.createRef<NeighborhoodAnalyticsForm>();
    const { container } = render(
      <NeighborhoodAnalyticsForm ref={ref} setting={patronAuthSetting} />
    );

    expect(ref.current?.getValue()).toBe("");
    await user.selectOptions(getSelect(container), "choice1");
    expect(ref.current?.getValue()).toBe("choice1");
    await user.selectOptions(getSelect(container), "choice2");
    expect(ref.current?.getValue()).toBe("choice2");
  });
});
