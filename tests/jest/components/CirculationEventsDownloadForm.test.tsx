import * as React from "react";
import { render, screen } from "@testing-library/react";
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
    // The modal's header renders its own "×" close button (class "close"); the
    // form's Download button and the footer's Close button are the reusable
    // `Button`s (class "btn"), matching the two the legacy test counted.
    const buttons = document.querySelectorAll<HTMLButtonElement>("button.btn");
    expect(buttons).toHaveLength(2);
    expect(buttons[0]).toHaveTextContent("Download");
    expect(buttons[1]).toHaveTextContent("Close");

    expect(
      screen.getByRole("button", { name: "Download" })
    ).toBeInTheDocument();

    await user.click(buttons[1]);

    expect(hide).toHaveBeenCalledTimes(1);
  });
});
