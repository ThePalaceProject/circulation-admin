import * as React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import LaneCustomListsEditor from "../../../src/components/lanes/LaneCustomListsEditor";

// ── DragDropContext mock ──────────────────────────────────────────────────────
let capturedDragHandlers: {
  onDragStart?: (event: any) => void;
  onDragEnd?: (event: any) => void;
} = {};

jest.mock("react-beautiful-dnd", () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const React = require("react");

  const DragDropContext = ({
    children,
    onDragStart,
    onDragEnd,
  }: {
    children: React.ReactNode;
    onDragStart?: (event: any) => void;
    onDragEnd?: (event: any) => void;
  }) => {
    capturedDragHandlers = { onDragStart, onDragEnd };
    return <>{children}</>;
  };

  const Droppable = ({
    children,
    droppableId,
    isDropDisabled,
  }: {
    children: (provided: any, snapshot: any) => React.ReactNode;
    droppableId: string;
    isDropDisabled?: boolean;
  }) => (
    <div
      data-testid={`droppable-${droppableId}`}
      data-drop-disabled={String(isDropDisabled)}
    >
      {children(
        {
          innerRef: function innerRefNoop(_el: any) {
            /* noop */
          },
          placeholder: null,
          droppableProps: {},
        },
        { isDraggingOver: false }
      )}
    </div>
  );

  const Draggable = ({
    children,
    draggableId,
  }: {
    children: (provided: any, snapshot: any) => React.ReactNode;
    draggableId: string | number;
    index?: number;
    isDragDisabled?: boolean;
  }) => (
    <div data-testid={`draggable-${draggableId}`}>
      {children(
        {
          innerRef: function innerRefNoop(_el: any) {
            /* noop */
          },
          placeholder: null,
          draggableProps: {},
          dragHandleProps: {},
          draggableStyle: {},
        },
        { isDragging: false }
      )}
    </div>
  );

  return { DragDropContext, Droppable, Draggable };
});

// ── Fixtures ──────────────────────────────────────────────────────────────────
const list1 = {
  id: 1,
  name: "List 1",
  entry_count: 5,
  is_owner: true,
  is_shared: true,
};
const list2 = {
  id: 2,
  name: "List 2",
  entry_count: 3,
  is_owner: false,
  is_shared: true,
};
const list3 = {
  id: 3,
  name: "List 3",
  entry_count: 8,
  is_owner: true,
  is_shared: false,
};

describe("LaneCustomListsEditor", () => {
  let onUpdate: jest.Mock;
  let changeFilter: jest.Mock;

  beforeEach(() => {
    onUpdate = jest.fn();
    changeFilter = jest.fn();
    capturedDragHandlers = {};
  });

  function renderEditor(
    props: Partial<React.ComponentProps<typeof LaneCustomListsEditor>> = {}
  ) {
    const defaultProps = {
      allCustomLists: [list1, list2, list3],
      customListIds: [2],
      filter: "owned",
      filteredCustomLists: [list1, list3],
      changeFilter,
      onUpdate,
    };
    return render(<LaneCustomListsEditor {...defaultProps} {...props} />);
  }

  it("renders available lists (filteredCustomLists minus those in the lane)", () => {
    // filteredCustomLists=[list1,list3], customListIds=[2] => list1 and list3 available, list2 is in lane
    renderEditor({ filteredCustomLists: [list1, list3], customListIds: [2] });
    const availableDroppable = screen.getByTestId("droppable-available-lists");
    const currentDroppable = screen.getByTestId("droppable-current-lists");
    // list1 and list3 should be in available-lists
    expect(
      availableDroppable.querySelector("[data-testid='draggable-1']")
    ).toBeTruthy();
    expect(
      availableDroppable.querySelector("[data-testid='draggable-3']")
    ).toBeTruthy();
    // list2 should be in current-lists, NOT available-lists
    expect(
      availableDroppable.querySelector("[data-testid='draggable-2']")
    ).toBeNull();
    expect(
      currentDroppable.querySelector("[data-testid='draggable-2']")
    ).toBeTruthy();
  });

  it("renders share icon on available lists not owned by this library", () => {
    // list2 is not owned => share icon. list2 not in customListIds so it's in available.
    renderEditor({ filteredCustomLists: [list2, list1], customListIds: [] });
    // list2 has is_owner=false => ShareIcon is rendered (its <title> text identifies it)
    const availableDroppable = screen.getByTestId("droppable-available-lists");
    const draggable2 = availableDroppable.querySelector(
      "[data-testid='draggable-2']"
    );
    expect(draggable2).toBeTruthy();
    // ShareIcon renders SVG with <title>This list is shared by another library.</title>
    const shareTitleTexts = Array.from(
      draggable2.querySelectorAll("title")
    ).map((t) => t.textContent);
    expect(
      shareTitleTexts.some((t) => t.includes("shared by another library"))
    ).toBe(true);
  });

  it("renders filter select with correct options and value", () => {
    renderEditor();
    const select = screen.getByRole("combobox") as HTMLSelectElement;
    // value is "owned" from props
    expect(select.value).toBe("owned");
    // Options: All, Owned, Subscribed
    const options = Array.from(select.options).map((o) => o.text);
    expect(options).toContain("All");
    expect(options).toContain("Owned");
    expect(options).toContain("Subscribed");
  });

  it("calls changeFilter when filter select changes", () => {
    renderEditor();
    const select = screen.getByRole("combobox");
    fireEvent.change(select, { target: { value: "" } });
    expect(changeFilter).toHaveBeenCalled();
  });

  it("renders current lists (allCustomLists filtered by customListIds)", () => {
    // allCustomLists=[list1,list2,list3], customListIds=[2] => current: list2
    renderEditor();
    expect(screen.getByTestId("draggable-2")).toBeTruthy();
    // list1 and list3 are in available, not current
    const availableDroppable = screen.getByTestId("droppable-available-lists");
    const currentDroppable = screen.getByTestId("droppable-current-lists");
    // list2 should be in current
    expect(
      currentDroppable.querySelector("[data-testid='draggable-2']")
    ).toBeTruthy();
    // list1 should be in available
    expect(
      availableDroppable.querySelector("[data-testid='draggable-1']")
    ).toBeTruthy();
  });

  it("renders share icon on current lists not owned by this library", () => {
    // list2 is not owned and is in lane
    renderEditor({ customListIds: [2], allCustomLists: [list2] });
    const currentDroppable = screen.getByTestId("droppable-current-lists");
    // list2 (not owned) should have share icon
    const draggable2 = currentDroppable.querySelector(
      "[data-testid='draggable-2']"
    );
    expect(draggable2).toBeTruthy();
    // ShareIcon renders SVG with <title>This list is shared by another library.</title>
    const shareTitleTexts = Array.from(
      draggable2.querySelectorAll("title")
    ).map((t) => t.textContent);
    expect(
      shareTitleTexts.some((t) => t.includes("shared by another library"))
    ).toBe(true);
  });

  it("prevents dragging within available lists: available droppable disabled when dragging from available", () => {
    renderEditor();
    act(() => {
      capturedDragHandlers.onDragStart?.({
        draggableId: "1",
        source: { droppableId: "available-lists", index: 0 },
      });
    });
    const availableDroppable = screen.getByTestId("droppable-available-lists");
    expect(availableDroppable.getAttribute("data-drop-disabled")).toBe("true");
    // current-lists should still be droppable (can drop available→current)
    const currentDroppable = screen.getByTestId("droppable-current-lists");
    expect(currentDroppable.getAttribute("data-drop-disabled")).toBe("false");
  });

  it("prevents dragging within current lists: current droppable disabled when dragging from current", () => {
    renderEditor();
    act(() => {
      capturedDragHandlers.onDragStart?.({
        draggableId: "2",
        source: { droppableId: "current-lists", index: 0 },
      });
    });
    const currentDroppable = screen.getByTestId("droppable-current-lists");
    expect(currentDroppable.getAttribute("data-drop-disabled")).toBe("true");
    // available-lists should still be droppable (can drop current→available)
    const availableDroppable = screen.getByTestId("droppable-available-lists");
    expect(availableDroppable.getAttribute("data-drop-disabled")).toBe("false");
  });

  it("drags from available to current: calls onUpdate with added list id", () => {
    // customListIds=[2], available=[list1,list3]; drag list1 to current
    renderEditor({ filteredCustomLists: [list1, list3] });
    act(() => {
      capturedDragHandlers.onDragStart?.({
        draggableId: "1",
        source: { droppableId: "available-lists", index: 0 },
      });
    });
    act(() => {
      capturedDragHandlers.onDragEnd?.({
        draggableId: "1",
        source: { droppableId: "available-lists", index: 0 },
        destination: { droppableId: "current-lists", index: 0 },
      });
    });
    expect(onUpdate).toHaveBeenCalled();
    const updatedIds: number[] = onUpdate.mock.calls[0][0];
    expect(updatedIds).toContain(1);
    expect(updatedIds).toContain(2);
  });

  it("shows message when dragging from current lists", () => {
    renderEditor();
    // Before dragging, the message should NOT be visible
    expect(
      screen.queryByText("Drag lists here to remove them from the lane.")
    ).toBeNull();
    act(() => {
      capturedDragHandlers.onDragStart?.({
        draggableId: "2",
        source: { droppableId: "current-lists", index: 0 },
      });
    });
    // After onDragStart from current-lists, message should be visible
    expect(
      screen.getByText("Drag lists here to remove them from the lane.")
    ).toBeTruthy();
    // After onDragEnd without destination, state resets
    act(() => {
      capturedDragHandlers.onDragEnd?.({
        draggableId: "2",
        source: { droppableId: "current-lists", index: 0 },
        destination: null,
      });
    });
    expect(
      screen.queryByText("Drag lists here to remove them from the lane.")
    ).toBeNull();
  });

  it("drags from current to available: calls onUpdate with removed list id", () => {
    // customListIds=[1,2], drag list1 from current to available
    // Pass integer draggableId (matching the original Mocha tests)
    renderEditor({
      allCustomLists: [list1, list2, list3],
      customListIds: [1, 2],
      filteredCustomLists: [list3],
    });
    act(() => {
      capturedDragHandlers.onDragStart?.({
        draggableId: 1,
        source: { droppableId: "current-lists", index: 0 },
      });
    });
    act(() => {
      capturedDragHandlers.onDragEnd?.({
        draggableId: 1,
        source: { droppableId: "current-lists", index: 0 },
        destination: { droppableId: "available-lists", index: 0 },
      });
    });
    expect(onUpdate).toHaveBeenCalled();
    const updatedIds: number[] = onUpdate.mock.calls[0][0];
    expect(updatedIds).not.toContain(1);
    expect(updatedIds).toContain(2);
  });

  it("adds a list via the Add button: calls onUpdate with new id included", () => {
    // customListIds=[2], filteredCustomLists=[list1, list3] → available: list1, list3
    renderEditor();
    // Click "Add to lane" for list1 (first available item)
    const availableDroppable = screen.getByTestId("droppable-available-lists");
    const addButtons = availableDroppable.querySelectorAll("button");
    fireEvent.click(addButtons[0]);
    expect(onUpdate).toHaveBeenCalled();
    const updatedIds: number[] = onUpdate.mock.calls[0][0];
    expect(updatedIds).toContain(2); // existing
    // One of list1 or list3 was added
    expect(updatedIds.length).toBe(2);
  });

  it("removes a list via the Remove button: calls onUpdate without that id", () => {
    // customListIds=[1,2], current: list1 and list2
    renderEditor({ customListIds: [1, 2] });
    // Click "Remove from lane" for first item in current-lists
    const currentDroppable = screen.getByTestId("droppable-current-lists");
    const removeButtons = currentDroppable.querySelectorAll("button");
    fireEvent.click(removeButtons[0]);
    expect(onUpdate).toHaveBeenCalled();
    const updatedIds: number[] = onUpdate.mock.calls[0][0];
    // Should have one less id
    expect(updatedIds.length).toBe(1);
  });
});
