import * as React from "react";
import { render, fireEvent } from "@testing-library/react";
import LoadButton from "../../../src/components/shared/LoadButton";

describe("LoadButton", () => {
  describe("rendering", () => {
    it("shows 'Load more' text when not fetching", () => {
      const { getByRole } = render(
        <LoadButton isFetching={false} loadMore={jest.fn()} />
      );
      expect(getByRole("button")).toHaveTextContent("Load more");
    });

    it("shows the MoreDotsIcon (animated) when fetching", () => {
      const { container, queryByText } = render(
        <LoadButton isFetching={true} loadMore={jest.fn()} />
      );
      // "Load more" text should be gone; the dots icon renders an svg or similar
      expect(queryByText("Load more")).toBeNull();
      // MoreDotsIcon renders inside the button — button still exists
      expect(container.querySelector("button")).toBeInTheDocument();
    });
  });

  describe("behavior", () => {
    it("calls loadMore when clicked", () => {
      const loadMore = jest.fn();
      const { getByRole } = render(
        <LoadButton isFetching={false} loadMore={loadMore} />
      );
      fireEvent.click(getByRole("button"));
      expect(loadMore).toHaveBeenCalledTimes(1);
    });

    it("does not call loadMore when disabled (isFetching=true)", () => {
      const loadMore = jest.fn();
      const { getByRole } = render(
        <LoadButton isFetching={true} loadMore={loadMore} />
      );
      fireEvent.click(getByRole("button"));
      expect(loadMore).not.toHaveBeenCalled();
    });
  });
});
