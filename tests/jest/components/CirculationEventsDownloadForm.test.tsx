import * as React from "react";
import { render, fireEvent } from "@testing-library/react";
import CirculationEventsDownloadForm from "../../../src/components/dashboard/CirculationEventsDownloadForm";

describe("CirculationEventsDownloadForm", () => {
  it("renders start date and end date inputs", () => {
    const hide = jest.fn();
    const { container } = render(
      <CirculationEventsDownloadForm show={true} hide={hide} />
    );
    const dates = container.querySelectorAll("input[type='date']");
    expect(dates).toHaveLength(2);
    expect(dates[0]).toHaveAttribute("name", "dateStart");
    expect(dates[1]).toHaveAttribute("name", "dateEnd");
  });

  it("renders download and close buttons", () => {
    const hide = jest.fn();
    const { getByRole, getByText } = render(
      <CirculationEventsDownloadForm show={true} hide={hide} />
    );
    expect(getByRole("button", { name: /download/i })).toBeInTheDocument();
    // The footer "Close" button has visible text "Close"; the dialog header X
    // button has aria-label="Close" with no text — use getByText to target the
    // correct one.
    const closeBtn = getByText("Close", { selector: "button" });
    expect(closeBtn).toBeInTheDocument();

    fireEvent.click(closeBtn);
    expect(hide).toHaveBeenCalledTimes(1);
  });

  it("does not render content when show is false", () => {
    const hide = jest.fn();
    const { container } = render(
      <CirculationEventsDownloadForm show={false} hide={hide} />
    );
    expect(container.querySelector("input[type='date']")).toBeNull();
  });
});
