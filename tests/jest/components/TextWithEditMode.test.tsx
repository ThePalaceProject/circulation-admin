import * as React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";

import TextWithEditMode from "../../../src/components/shared/TextWithEditMode";

// ─── Tests ─────────────────────────────────────────────────────────────────────

describe("TextWithEditMode", () => {
  describe("rendering", () => {
    it("renders the text and an Edit button when text is provided", () => {
      const { container } = render(
        <TextWithEditMode
          text="test"
          placeholder="editable thing"
          aria-label="label"
        />
      );
      expect(container.textContent).toContain("test");
      expect(container.textContent).toContain("Edit editable thing");
    });

    it("does not render an EditableInput when text is provided (not in edit mode)", () => {
      const { container } = render(
        <TextWithEditMode
          text="test"
          placeholder="editable thing"
          aria-label="label"
        />
      );
      expect(container.querySelector("input")).toBeNull();
    });

    it("starts in edit mode with an input and Save button when no text is provided", () => {
      const { container } = render(
        <TextWithEditMode placeholder="editable thing" aria-label="label" />
      );
      expect(container.querySelector("input")).not.toBeNull();
      expect(container.textContent).toContain("Save editable thing");
    });

    it("does not render the Edit button when starting in edit mode (no text)", () => {
      const { container } = render(
        <TextWithEditMode placeholder="editable thing" aria-label="label" />
      );
      expect(container.textContent).not.toContain("Edit editable thing");
    });

    it("updates displayed text when the text prop changes", () => {
      const { container, rerender } = render(
        <TextWithEditMode
          text="old text"
          placeholder="editable thing"
          aria-label="label"
        />
      );
      expect(container.textContent).toContain("old text");

      rerender(
        <TextWithEditMode
          text="new text"
          placeholder="editable thing"
          aria-label="label"
        />
      );
      expect(container.textContent).not.toContain("old text");
      expect(container.textContent).toContain("new text");
    });

    it("switches to edit mode when the Edit button is clicked", () => {
      const { container } = render(
        <TextWithEditMode
          text="test"
          placeholder="editable thing"
          aria-label="label"
        />
      );
      expect(container.querySelector("input")).toBeNull();

      const editBtn = screen.getByRole("button");
      act(() => {
        fireEvent.click(editBtn);
      });

      const input = container.querySelector("input") as HTMLInputElement;
      expect(input).not.toBeNull();
      // The input should be pre-filled with the existing text.
      expect(input.value).toBe("test");
      expect(container.textContent).toContain("Save editable thing");
      expect(container.textContent).not.toContain("Edit editable thing");
    });
  });

  describe("behavior", () => {
    it("saves the typed value, calls onUpdate, and exits edit mode when Save is clicked", () => {
      const onUpdate = jest.fn();
      const { container } = render(
        <TextWithEditMode
          placeholder="editable thing"
          onUpdate={onUpdate}
          aria-label="label"
        />
      );
      const input = container.querySelector("input") as HTMLInputElement;
      act(() => {
        fireEvent.change(input, { target: { value: "new value" } });
      });

      const saveBtn = screen.getByRole("button");
      act(() => {
        fireEvent.click(saveBtn);
      });

      // Should exit edit mode.
      expect(container.querySelector("input")).toBeNull();
      // Should show the saved value.
      expect(container.textContent).toContain("new value");
      // Should call onUpdate with the new value.
      expect(onUpdate).toHaveBeenCalledTimes(1);
      expect(onUpdate).toHaveBeenCalledWith("new value");
      // Button should now say "Edit".
      expect(container.textContent).toContain("Edit editable thing");
    });

    it("updates the internal text state as the user types", () => {
      const { container } = render(
        <TextWithEditMode placeholder="editable thing" aria-label="label" />
      );
      const input = container.querySelector("input") as HTMLInputElement;
      act(() => {
        fireEvent.change(input, { target: { value: "typing..." } });
      });
      expect(input.value).toBe("typing...");
    });

    it("switches back to display mode after saving, showing the saved text", () => {
      const { container } = render(
        <TextWithEditMode
          text="initial"
          placeholder="editable thing"
          aria-label="label"
        />
      );
      // Enter edit mode.
      const editBtn = screen.getByRole("button");
      act(() => {
        fireEvent.click(editBtn);
      });

      const input = container.querySelector("input") as HTMLInputElement;
      act(() => {
        fireEvent.change(input, { target: { value: "updated" } });
      });

      const saveBtn = screen.getByRole("button");
      act(() => {
        fireEvent.click(saveBtn);
      });

      expect(container.querySelector("input")).toBeNull();
      expect(container.textContent).toContain("updated");
      expect(container.textContent).not.toContain("initial");
    });

    it("disables the Save button when disableIfBlank is set and input is empty", () => {
      const { container } = render(
        <TextWithEditMode
          placeholder="editable thing"
          aria-label="label"
          disableIfBlank
        />
      );
      const btn = screen.getByRole("button") as HTMLButtonElement;
      // Starts blank → button should be disabled.
      expect(btn.disabled).toBe(true);
    });

    it("enables the Save button when disableIfBlank is set and user types text", () => {
      const { container } = render(
        <TextWithEditMode
          placeholder="editable thing"
          aria-label="label"
          disableIfBlank
        />
      );
      const input = container.querySelector("input") as HTMLInputElement;
      act(() => {
        fireEvent.change(input, { target: { value: "some text" } });
      });

      const btn = screen.getByRole("button") as HTMLButtonElement;
      expect(btn.disabled).toBe(false);
    });

    it("enters edit mode when the text prop is removed (set to undefined)", () => {
      const { container, rerender } = render(
        <TextWithEditMode
          text="some text"
          placeholder="editable thing"
          aria-label="label"
        />
      );
      expect(container.querySelector("input")).toBeNull();

      rerender(
        <TextWithEditMode placeholder="editable thing" aria-label="label" />
      );
      expect(container.querySelector("input")).not.toBeNull();
    });

    it("does not call onUpdate and does not throw when saving with no onUpdate prop", () => {
      const { container } = render(
        <TextWithEditMode placeholder="editable thing" aria-label="label" />
      );
      const input = container.querySelector("input") as HTMLInputElement;
      act(() => {
        fireEvent.change(input, { target: { value: "text" } });
      });
      const saveBtn = screen.getByRole("button");
      expect(() => {
        act(() => {
          fireEvent.click(saveBtn);
        });
      }).not.toThrow();
      expect(container.textContent).toContain("text");
    });
  });
});
