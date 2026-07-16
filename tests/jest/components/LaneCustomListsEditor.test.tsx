import * as React from "react";
import { render, screen, within, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Capture the component's onDragStart/onDragEnd while still rendering the real
// render-prop DOM (so the button/column tests below are unaffected). A real drag
// can't run in jsdom, so the drag-handler tests call the captured callbacks
// directly.
let dndCallbacks: { onDragStart?: any; onDragEnd?: any } = {};
jest.mock("react-beautiful-dnd", () => ({
  __esModule: true,
  DragDropContext: ({ onDragStart, onDragEnd, children }: any) => {
    dndCallbacks = { onDragStart, onDragEnd };
    return children;
  },
  Droppable: ({ droppableId, isDropDisabled, children }: any) => (
    <div
      data-testid={`droppable-${droppableId}`}
      data-drop-disabled={String(!!isDropDisabled)}
    >
      {children(
        { droppableProps: {}, innerRef: () => undefined, placeholder: null },
        { isDraggingOver: false }
      )}
    </div>
  ),
  Draggable: ({ children }: any) =>
    children(
      {
        draggableProps: {},
        dragHandleProps: {},
        innerRef: () => undefined,
        draggableStyle: {},
        placeholder: null,
      },
      { isDragging: false }
    ),
}));

import LaneCustomListsEditor from "../../../src/components/LaneCustomListsEditor";
import { CustomListData } from "../../../src/interfaces";

// NOTE ON DRAG-AND-DROP COVERAGE
// ------------------------------
// This component uses `react-beautiful-dnd`. A real drag/drop cannot be
// simulated in jsdom, so the drag paths are exercised by invoking the captured
// onDragStart/onDragEnd callbacks and asserting the observable result:
//   - Adding a list (drop from available to current) and removing one (drop from
//     current to available) update the selection; both are also reachable via the
//     "Add to lane" / "Remove from lane" buttons and are tested below.
//   - onDragStart toggles each Droppable's `isDropDisabled` (surfaced by the test
//     mock as `data-drop-disabled`) and, when dragging from the current lists,
//     shows the "remove them from the lane" message over the available lists.
//   - `reset()` / `getCustomListIds()` form the imperative API that LaneEditor
//     drives through a ref in production; they are tested through a ref below.

const allCustomListsData: CustomListData[] = [
  { id: 1, name: "list 1", entry_count: 0, is_owner: true, is_shared: false },
  { id: 2, name: "list 2", entry_count: 2, is_owner: true, is_shared: false },
  { id: 3, name: "list 3", entry_count: 0, is_owner: true, is_shared: false },
];

const sharedList: CustomListData = {
  id: 4,
  name: "list 4",
  entry_count: 0,
  is_owner: false,
  is_shared: true,
};

const shareTitle = /shared by another library/i;

const availableLists = (container: HTMLElement) =>
  Array.from(
    container.querySelectorAll<HTMLElement>(".available-lists .available-list")
  );
const currentLists = (container: HTMLElement) =>
  Array.from(
    container.querySelectorAll<HTMLElement>(".current-lists .current-list")
  );

describe("LaneCustomListsEditor", () => {
  it("renders available lists", () => {
    const filteredCustomListsData = [
      allCustomListsData[0],
      allCustomListsData[2],
    ];

    const { container, rerender } = render(
      <LaneCustomListsEditor
        allCustomLists={allCustomListsData}
        customListIds={[]}
        filter="owned"
        filteredCustomLists={filteredCustomListsData}
      />
    );

    expect(container.querySelector(".available-lists")).toBeInTheDocument();

    let lists = availableLists(container);
    expect(lists).toHaveLength(2);
    expect(lists[0]).toHaveTextContent("list 1");
    expect(lists[0]).toHaveTextContent("Items in list: 0");
    expect(lists[1]).toHaveTextContent("list 3");
    expect(lists[1]).toHaveTextContent("Items in list: 0");

    // With list 1 already in the lane, it drops out of the available column.
    rerender(
      <LaneCustomListsEditor
        allCustomLists={allCustomListsData}
        customListIds={[1]}
        filter="owned"
        filteredCustomLists={filteredCustomListsData}
      />
    );

    lists = availableLists(container);
    expect(lists).toHaveLength(1);
    expect(lists[0]).toHaveTextContent("list 3");
    expect(lists[0]).toHaveTextContent("Items in list: 0");
  });

  it("renders a share icon on available lists that are not owned by the current library", () => {
    const sharedCustomListsData = [...allCustomListsData, sharedList];

    const { container } = render(
      <LaneCustomListsEditor
        allCustomLists={sharedCustomListsData}
        customListIds={[]}
        filter=""
        filteredCustomLists={sharedCustomListsData}
      />
    );

    const lists = availableLists(container);
    expect(lists).toHaveLength(4);

    expect(within(lists[0]).queryByTitle(shareTitle)).toBeNull();
    expect(within(lists[1]).queryByTitle(shareTitle)).toBeNull();
    expect(within(lists[2]).queryByTitle(shareTitle)).toBeNull();
    expect(within(lists[3]).queryByTitle(shareTitle)).not.toBeNull();
  });

  it("renders filter select", async () => {
    const user = userEvent.setup();
    const changeFilter = jest.fn();

    const { container } = render(
      <LaneCustomListsEditor
        allCustomLists={allCustomListsData}
        customListIds={[]}
        filter="owned"
        filteredCustomLists={allCustomListsData}
        changeFilter={changeFilter}
      />
    );

    const select = container.querySelector<HTMLSelectElement>(
      'select[name="filter"]'
    );
    expect(select).toHaveValue("owned");

    const options = within(select).getAllByRole("option");
    expect(options).toHaveLength(3);
    expect(options[0]).toHaveValue("");
    expect(options[1]).toHaveValue("owned");
    expect(options[2]).toHaveValue("shared-in");

    await user.selectOptions(select, "shared-in");

    expect(changeFilter).toHaveBeenCalledTimes(1);
    expect(changeFilter).toHaveBeenCalledWith("shared-in");
  });

  it("renders current lists", () => {
    const { container, rerender } = render(
      <LaneCustomListsEditor
        allCustomLists={allCustomListsData}
        customListIds={[]}
        filter=""
        filteredCustomLists={allCustomListsData}
      />
    );

    expect(container.querySelector(".current-lists")).toBeInTheDocument();
    expect(currentLists(container)).toHaveLength(0);

    rerender(
      <LaneCustomListsEditor
        allCustomLists={allCustomListsData}
        customListIds={[2, 3]}
        filter=""
        filteredCustomLists={allCustomListsData}
      />
    );

    const lists = currentLists(container);
    expect(lists).toHaveLength(2);
    expect(lists[0]).toHaveTextContent("list 2");
    expect(lists[0]).toHaveTextContent("Items in list: 2");
    expect(lists[1]).toHaveTextContent("list 3");
    expect(lists[1]).toHaveTextContent("Items in list: 0");
  });

  it("renders a share icon on current lists that are not owned by the current library", () => {
    const sharedCustomListsData = [...allCustomListsData, sharedList];

    const { container } = render(
      <LaneCustomListsEditor
        allCustomLists={sharedCustomListsData}
        customListIds={[3, 4]}
        filter=""
        filteredCustomLists={sharedCustomListsData}
      />
    );

    const lists = currentLists(container);
    expect(lists).toHaveLength(2);

    expect(within(lists[0]).queryByTitle(shareTitle)).toBeNull();
    expect(within(lists[1]).queryByTitle(shareTitle)).not.toBeNull();
  });

  it("adds a list to the lane when the add button is clicked", async () => {
    const user = userEvent.setup();
    const onUpdate = jest.fn();

    const { container } = render(
      <LaneCustomListsEditor
        allCustomLists={allCustomListsData}
        customListIds={[2]}
        filter=""
        filteredCustomLists={allCustomListsData}
        onUpdate={onUpdate}
      />
    );

    // Available column starts with list 1 and list 3 (list 2 is in the lane).
    const available = container.querySelector<HTMLElement>(".available-lists");
    const addButtons = within(available).getAllByRole("button", {
      name: /add to lane/i,
    });
    expect(addButtons).toHaveLength(2);

    // Add list 1 (the first available list).
    await user.click(addButtons[0]);

    expect(onUpdate).toHaveBeenCalledTimes(1);
    expect(onUpdate.mock.calls[0][0]).toEqual(expect.arrayContaining([1, 2]));

    // The item now appears in the current lists.
    const nowCurrent = currentLists(container);
    expect(nowCurrent).toHaveLength(2);
    expect(nowCurrent[0]).toHaveTextContent("list 1");
    expect(nowCurrent[1]).toHaveTextContent("list 2");
  });

  it("removes a list from the lane when the remove button is clicked", async () => {
    const user = userEvent.setup();
    const onUpdate = jest.fn();

    const { container, rerender } = render(
      <LaneCustomListsEditor
        allCustomLists={allCustomListsData}
        customListIds={[1, 2]}
        filter=""
        filteredCustomLists={allCustomListsData}
        onUpdate={onUpdate}
      />
    );

    const current = container.querySelector<HTMLElement>(".current-lists");
    const removeButtons = within(current).getAllByRole("button", {
      name: /remove from lane/i,
    });
    expect(removeButtons).toHaveLength(2);

    // Remove list 1 (the first current list).
    await user.click(removeButtons[0]);

    expect(onUpdate).toHaveBeenCalledTimes(1);
    expect(onUpdate.mock.calls[0][0]).toEqual([2]);

    // Reflect the parent's updated ids; the removed list is gone.
    rerender(
      <LaneCustomListsEditor
        allCustomLists={allCustomListsData}
        customListIds={onUpdate.mock.calls[0][0]}
        filter=""
        filteredCustomLists={allCustomListsData}
        onUpdate={onUpdate}
      />
    );

    const nowCurrent = currentLists(container);
    expect(nowCurrent).toHaveLength(1);
    expect(nowCurrent[0]).toHaveTextContent("list 2");
  });

  it("exposes reset()/getCustomListIds() as the imperative API LaneEditor drives via a ref", () => {
    const onUpdate = jest.fn();
    const ref = React.createRef<LaneCustomListsEditor>();

    const { rerender } = render(
      <LaneCustomListsEditor
        ref={ref}
        allCustomLists={allCustomListsData}
        customListIds={[2]}
        filter=""
        filteredCustomLists={allCustomListsData}
        onUpdate={onUpdate}
      />
    );

    expect(ref.current.getCustomListIds()).toEqual([2]);

    // reset(ids) notifies the parent with the supplied original ids.
    ref.current.reset([1]);
    expect(onUpdate).toHaveBeenCalledTimes(1);
    expect(onUpdate).toHaveBeenCalledWith([1]);

    rerender(
      <LaneCustomListsEditor
        ref={ref}
        allCustomLists={allCustomListsData}
        customListIds={[1]}
        filter=""
        filteredCustomLists={allCustomListsData}
        onUpdate={onUpdate}
      />
    );

    expect(ref.current.getCustomListIds()).toEqual([1]);
  });
});

// The drag handlers (onDragStart/onDragEnd), exercised by calling the captured
// react-beautiful-dnd callbacks directly.
describe("LaneCustomListsEditor - drag handlers", () => {
  // Factory rather than a shared const: the component's add()/remove() mutate
  // customListIds in place, so each test needs its own fresh array.
  const makeProps = () => ({
    allCustomLists: allCustomListsData,
    filteredCustomLists: allCustomListsData,
    customListIds: [2],
    onUpdate: undefined as any,
  });

  it("adds a list when dragged from available to current", () => {
    const onUpdate = jest.fn();
    render(<LaneCustomListsEditor {...makeProps()} onUpdate={onUpdate} />);

    act(() => {
      dndCallbacks.onDragStart({ source: { droppableId: "available-lists" } });
      dndCallbacks.onDragEnd({
        draggableId: "1",
        source: { droppableId: "available-lists" },
        destination: { droppableId: "current-lists" },
      });
    });

    // list 2 was already selected; dragging list 1 in adds it.
    expect(onUpdate).toHaveBeenCalledWith([2, 1]);
    expect(document.body.classList.contains("dragging")).toBe(false);
  });

  it("removes a list when dragged from current to available", () => {
    const onUpdate = jest.fn();
    render(<LaneCustomListsEditor {...makeProps()} onUpdate={onUpdate} />);

    act(() => {
      dndCallbacks.onDragEnd({
        draggableId: 2,
        source: { droppableId: "current-lists" },
        destination: { droppableId: "available-lists" },
      });
    });

    // list 2 was the only selection; dragging it out clears the list.
    expect(onUpdate).toHaveBeenCalledWith([]);
  });

  it("does nothing when dropped outside a list (no destination)", () => {
    const onUpdate = jest.fn();
    render(<LaneCustomListsEditor {...makeProps()} onUpdate={onUpdate} />);

    act(() => {
      dndCallbacks.onDragEnd({
        draggableId: "1",
        source: { droppableId: "available-lists" },
        destination: null,
      });
    });

    expect(onUpdate).not.toHaveBeenCalled();
  });

  it("disables dropping within the available lists while dragging from available", () => {
    render(<LaneCustomListsEditor {...makeProps()} onUpdate={jest.fn()} />);

    act(() => {
      dndCallbacks.onDragStart({ source: { droppableId: "available-lists" } });
    });

    expect(screen.getByTestId("droppable-available-lists")).toHaveAttribute(
      "data-drop-disabled",
      "true"
    );
  });

  it("disables dropping within the current lists while dragging from current", () => {
    render(<LaneCustomListsEditor {...makeProps()} onUpdate={jest.fn()} />);

    act(() => {
      dndCallbacks.onDragStart({ source: { droppableId: "current-lists" } });
    });

    expect(screen.getByTestId("droppable-current-lists")).toHaveAttribute(
      "data-drop-disabled",
      "true"
    );
  });

  it("shows a removal message over the available lists while dragging from current, and clears it on drop", () => {
    render(<LaneCustomListsEditor {...makeProps()} onUpdate={jest.fn()} />);
    const available = () => screen.getByTestId("droppable-available-lists");
    const removalMessage = () =>
      screen.queryByText("Drag lists here to remove them from the lane.");

    // Before any drag: the available lists reject drops and show no remove zone.
    expect(available()).toHaveAttribute("data-drop-disabled", "true");
    expect(removalMessage()).not.toBeInTheDocument();

    act(() => {
      dndCallbacks.onDragStart({ source: { droppableId: "current-lists" } });
    });

    // Dragging from the current lists turns the available column into a remove zone.
    expect(available()).toHaveAttribute("data-drop-disabled", "false");
    expect(removalMessage()).toBeInTheDocument();

    act(() => {
      dndCallbacks.onDragEnd({ source: { droppableId: "current-lists" } });
    });

    // Dropping (even outside a list) resets the remove zone.
    expect(available()).toHaveAttribute("data-drop-disabled", "true");
    expect(removalMessage()).not.toBeInTheDocument();
  });
});
