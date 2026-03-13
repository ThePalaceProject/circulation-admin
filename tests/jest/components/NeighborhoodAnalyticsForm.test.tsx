import * as React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import NeighborhoodAnalyticsForm from "../../../src/components/patrons/NeighborhoodAnalyticsForm";

const patronAuthSetting = {
  key: "neighborhood_mode",
  label: "Patron Auth",
  options: [
    { key: "disabled", label: "Off" },
    { key: "choice1", label: "Choice 1" },
    { key: "choice2", label: "Choice 2" },
  ],
};

const analyticsSetting = {
  key: "location_source",
  label: "Analytics",
  options: [
    { key: "disabled", label: "Off" },
    { key: "choice1", label: "Choice 1" },
    { key: "choice2", label: "Choice 2" },
  ],
};

/** Expand the panel and then change the select value. */
const expandPanel = () => {
  const toggle = screen.getByRole("button");
  fireEvent.click(toggle);
};

const chooseOption = (value: string) => {
  const select = document.querySelector("select");
  fireEvent.change(select, { target: { value } });
};

describe("NeighborhoodAnalyticsForm", () => {
  it("renders a panel with the correct header", () => {
    render(<NeighborhoodAnalyticsForm setting={patronAuthSetting} />);
    // panel-title span should contain the text
    const title = document.querySelector(".panel-title");
    expect(title.textContent).toContain("Patron Neighborhood Analytics");
  });

  it("renders an EditableInput (select) with options from setting", () => {
    render(<NeighborhoodAnalyticsForm setting={patronAuthSetting} />);
    expandPanel();
    const select = document.querySelector("select");
    expect(select).toBeInTheDocument();
    const options = Array.from(select.querySelectorAll("option"));
    expect(options).toHaveLength(3);
    expect(options[0]).toHaveValue("disabled");
    expect(options[0]).toHaveTextContent("Off");
    expect(options[1]).toHaveValue("choice1");
    expect(options[2]).toHaveValue("choice2");
  });

  it("shows warning message when option other than disabled is chosen", () => {
    render(<NeighborhoodAnalyticsForm setting={patronAuthSetting} />);
    expandPanel();

    // Initially no warning
    expect(document.querySelector(".bg-warning")).not.toBeInTheDocument();

    // Choose disabled
    chooseOption("disabled");
    expect(document.querySelector(".bg-warning")).not.toBeInTheDocument();

    // Choose a non-disabled option
    chooseOption("choice1");
    const warning = document.querySelector(".bg-warning");
    expect(warning).toBeInTheDocument();
    expect(warning.textContent).toContain(
      "This feature will work only if it is also enabled in your local analytics service configuration settings."
    );
    expect(warning.querySelector("a")).toHaveAttribute(
      "href",
      "/admin/web/config/analytics"
    );
  });

  it("shows warning with patronAuth link for analytics setting", () => {
    render(<NeighborhoodAnalyticsForm setting={analyticsSetting} />);
    expandPanel();
    chooseOption("choice1");
    const warning = document.querySelector(".bg-warning");
    expect(warning).toBeInTheDocument();
    expect(warning.textContent).toContain("patron authentication service");
    expect(warning.querySelector("a")).toHaveAttribute(
      "href",
      "/admin/web/config/patronAuth"
    );
  });

  it("shows enabled/disabled state in panel header", () => {
    render(<NeighborhoodAnalyticsForm setting={patronAuthSetting} />);
    expandPanel();

    // Initially disabled
    let title = document.querySelector(".panel-title");
    expect(title.textContent).toContain("Disabled");

    chooseOption("choice1");
    title = document.querySelector(".panel-title");
    expect(title.textContent).toContain("Enabled");

    chooseOption("choice2");
    title = document.querySelector(".panel-title");
    expect(title.textContent).toContain("Enabled");

    chooseOption("disabled");
    title = document.querySelector(".panel-title");
    expect(title.textContent).toContain("Disabled");
  });

  it("initializes selected state from currentValue prop", () => {
    const ref = React.createRef<NeighborhoodAnalyticsForm>();
    render(
      <NeighborhoodAnalyticsForm
        ref={ref}
        setting={patronAuthSetting}
        currentValue="choice1"
      />
    );
    expect(ref.current.getValue()).toEqual("choice1");
    expect(ref.current.isEnabled()).toBe(true);
  });

  it("provides the paired service URL and name", () => {
    const ref = React.createRef<NeighborhoodAnalyticsForm>();
    render(<NeighborhoodAnalyticsForm ref={ref} setting={patronAuthSetting} />);
    expect(ref.current.getPairedService(patronAuthSetting)).toEqual([
      "/admin/web/config/analytics",
      "local analytics service configuration settings",
    ]);
    expect(ref.current.getPairedService(analyticsSetting)).toEqual([
      "/admin/web/config/patronAuth",
      "patron authentication service configuration settings",
    ]);
  });
});
