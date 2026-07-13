import * as React from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import CirculationEventsDownloadForm from "../../../src/components/CirculationEventsDownloadForm";

describe("CirculationEventsDownloadForm", () => {
  let hide: jest.Mock;

  beforeEach(() => {
    hide = jest.fn();
    render(<CirculationEventsDownloadForm show={true} hide={hide} />);
  });

  it("renders start date and end date inputs", () => {
    // The modal renders into a portal, so query the whole document.
    const dates =
      document.querySelectorAll<HTMLInputElement>("input[type='date']");
    expect(dates).toHaveLength(2);
    expect(dates[0].name).toBe("dateStart");
    expect(dates[1].name).toBe("dateEnd");
  });

  it("renders download and close buttons", async () => {
    const user = userEvent.setup();

    expect(
      screen.getByRole("button", { name: "Download" })
    ).toBeInTheDocument();

    // The modal header's dismiss control is also labeled "Close" (its visible
    // "×" is aria-hidden), so scope to the footer for the reusable Close button.
    const footer = document.querySelector<HTMLElement>(".modal-footer");
    const closeButton = within(footer).getByRole("button", { name: "Close" });
    expect(closeButton).toBeInTheDocument();

    await user.click(closeButton);

    expect(hide).toHaveBeenCalledTimes(1);
  });
});
