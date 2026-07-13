import * as React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import LoadButton from "../../../src/components/LoadButton";

describe("LoadButton", () => {
  it("displays 'Load more' text when not fetching", () => {
    render(<LoadButton isFetching={false} loadMore={jest.fn()} />);

    expect(
      screen.getByRole("button", { name: "Load more" })
    ).toBeInTheDocument();
  });

  it("renders the MoreDotsIcon only while fetching", () => {
    const { container, rerender } = render(
      <LoadButton isFetching={false} loadMore={jest.fn()} />
    );

    // The MoreDotsIcon is a Font Awesome-style <svg>, so query for it directly.
    expect(container.querySelector("svg")).not.toBeInTheDocument();

    rerender(<LoadButton isFetching={true} loadMore={jest.fn()} />);

    expect(container.querySelector("svg")).toBeInTheDocument();
    expect(screen.queryByText("Load more")).not.toBeInTheDocument();
  });

  it("calls loadMore when clicked", async () => {
    const user = userEvent.setup();
    const loadMore = jest.fn();
    render(<LoadButton isFetching={false} loadMore={loadMore} />);

    await user.click(screen.getByRole("button"));

    expect(loadMore).toHaveBeenCalledTimes(1);
  });

  it("does nothing when disabled", async () => {
    const user = userEvent.setup();
    const loadMore = jest.fn();
    render(<LoadButton isFetching={true} loadMore={loadMore} />);

    await user.click(screen.getByRole("button"));

    expect(loadMore).not.toHaveBeenCalled();
  });
});
