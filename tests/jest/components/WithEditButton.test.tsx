import * as React from "react";
import { render, fireEvent } from "@testing-library/react";
import WithEditButton from "../../../src/components/shared/WithEditButton";

describe("WithEditButton", () => {
  describe("rendering", () => {
    it("shows children", () => {
      const { getByText } = render(
        <WithEditButton disabled={false} onEdit={jest.fn()}>
          child
        </WithEditButton>
      );
      expect(getByText("child")).toBeInTheDocument();
    });

    it("shows an edit button", () => {
      const { container } = render(
        <WithEditButton disabled={false} onEdit={jest.fn()}>
          child
        </WithEditButton>
      );
      const editBtn = container.querySelector(".edit-btn");
      expect(editBtn).toBeInTheDocument();
    });
  });

  describe("behavior", () => {
    it("calls onEdit when the edit button is clicked", () => {
      const onEdit = jest.fn();
      const { container } = render(
        <WithEditButton disabled={false} onEdit={onEdit}>
          child
        </WithEditButton>
      );
      const editBtn = container.querySelector<HTMLElement>(".edit-btn");
      fireEvent.click(editBtn!);
      expect(onEdit).toHaveBeenCalledTimes(1);
    });

    it("does not call onEdit when disabled", () => {
      const onEdit = jest.fn();
      const { container } = render(
        <WithEditButton disabled={true} onEdit={onEdit}>
          child
        </WithEditButton>
      );
      const editBtn = container.querySelector<HTMLElement>(".edit-btn");
      fireEvent.click(editBtn!);
      expect(onEdit).not.toHaveBeenCalled();
    });
  });
});
