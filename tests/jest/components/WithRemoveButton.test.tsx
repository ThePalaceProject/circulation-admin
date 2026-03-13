import * as React from "react";
import { render, fireEvent } from "@testing-library/react";
import WithRemoveButton from "../../../src/components/shared/WithRemoveButton";

describe("WithRemoveButton", () => {
  describe("rendering", () => {
    it("shows children", () => {
      const { getByText } = render(
        <WithRemoveButton disabled={false} onRemove={jest.fn()}>
          child
        </WithRemoveButton>
      );
      expect(getByText("child")).toBeInTheDocument();
    });

    it("shows a remove button", () => {
      const { container } = render(
        <WithRemoveButton disabled={false} onRemove={jest.fn()}>
          child
        </WithRemoveButton>
      );
      expect(container.querySelector(".remove-btn")).toBeInTheDocument();
    });
  });

  describe("behavior", () => {
    it("calls onRemove when the button is clicked", () => {
      const onRemove = jest.fn();
      const { container } = render(
        <WithRemoveButton disabled={false} onRemove={onRemove}>
          child
        </WithRemoveButton>
      );
      fireEvent.click(container.querySelector(".remove-btn")!);
      expect(onRemove).toHaveBeenCalledTimes(1);
    });

    it("does nothing when disabled", () => {
      const onRemove = jest.fn();
      const { container } = render(
        <WithRemoveButton disabled={true} onRemove={onRemove}>
          child
        </WithRemoveButton>
      );
      fireEvent.click(container.querySelector(".remove-btn")!);
      expect(onRemove).not.toHaveBeenCalled();
    });

    it("calls onRemove when confirmRemoval returns true", () => {
      const onRemove = jest.fn();
      const confirmRemoval = jest.fn().mockReturnValue(true);
      const { container } = render(
        <WithRemoveButton
          disabled={false}
          onRemove={onRemove}
          confirmRemoval={confirmRemoval}
        >
          child
        </WithRemoveButton>
      );
      fireEvent.click(container.querySelector(".remove-btn")!);
      expect(confirmRemoval).toHaveBeenCalledTimes(1);
      expect(onRemove).toHaveBeenCalledTimes(1);
    });

    it("does not call onRemove when confirmRemoval returns false", () => {
      const onRemove = jest.fn();
      const confirmRemoval = jest.fn().mockReturnValue(false);
      const { container } = render(
        <WithRemoveButton
          disabled={false}
          onRemove={onRemove}
          confirmRemoval={confirmRemoval}
        >
          child
        </WithRemoveButton>
      );
      fireEvent.click(container.querySelector(".remove-btn")!);
      expect(confirmRemoval).toHaveBeenCalledTimes(1);
      expect(onRemove).not.toHaveBeenCalled();
    });
  });
});
