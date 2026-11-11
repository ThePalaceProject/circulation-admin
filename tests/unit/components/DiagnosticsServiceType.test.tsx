import * as React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import DiagnosticsServiceType from "../../../src/components/DiagnosticsServiceType";

describe("DiagnosticsServiceType", () => {
  const ts1 = {
    service: "test_service_1",
    id: "1",
    start: "start_time_string_1",
    duration: "0",
    collection_name: "collection1",
  };
  const ts2 = {
    service: "test_service_2",
    id: "2",
    start: "start_time_string_2",
    duration: "0",
    collection_name: "collection2",
  };

  const services: any = {
    test_service_1: { collection1: [ts1] },
    test_service_2: { collection2: [ts2] },
  };

  it("renders service tabs", () => {
    const { container } = render(
      <DiagnosticsServiceType type="monitor" services={services} />
    );

    expect(container.firstChild).toHaveClass("config");
    expect(container.firstChild).toHaveClass("services");

    // The service tabs are rendered, one per service, defaulting to the first.
    const tabs = container.querySelectorAll("ul.nav-tabs li");
    expect(tabs).toHaveLength(2);
    expect(tabs[0]).toHaveTextContent("Test_service_1");
    expect(tabs[0]).toHaveClass("active");
    expect(tabs[1]).toHaveTextContent("Test_service_2");
    expect(tabs[1]).not.toHaveClass("active");
  });

  it("switches tabs", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <DiagnosticsServiceType type="monitor" services={services} />
    );

    // Starts on the first service tab.
    let tabs = container.querySelectorAll("ul.nav-tabs li");
    expect(tabs[0]).toHaveClass("active");
    expect(tabs[1]).not.toHaveClass("active");

    // Clicking the second service tab selects it (goToTab updates the state that
    // drives which tab is active).
    await user.click(container.querySelectorAll("ul.nav-tabs li a")[1]);

    tabs = container.querySelectorAll("ul.nav-tabs li");
    expect(tabs[0]).not.toHaveClass("active");
    expect(tabs[1]).toHaveClass("active");
  });

  it("displays a message if there are no services", () => {
    const { container } = render(
      <DiagnosticsServiceType type="monitor" services={null} />
    );

    expect(container.querySelector("ul.nav-tabs")).toBeNull();
    expect(
      screen.getByText("There are currently no monitor services.")
    ).toBeInTheDocument();
  });
});
