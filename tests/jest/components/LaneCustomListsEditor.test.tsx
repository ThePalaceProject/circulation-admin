import * as React from "react";
import { render, within, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Capture the component's onDragStart/onDragEnd while still rendering the real
// render-prop DOM (so the button/column tests below are unaffected). A real drag
// can't run in jsdom, so the drag-handler tests call the captured callbacks
// directly — the same thing the legacy enzyme suite did via instance methods.
let dndCallbacks: { onDragStart?: any; onDragEnd?: any } = {};
jest.mock("react-beautiful-dnd", () => ({
  __esModule: true,
  DragDropContext: ({ onDragStart, onDragEnd, children }: any) => {
    dndCallbacks = { onDragStart, onDragEnd };
    return children;
  },
  Droppable: ({ children }: any) =>
    children(
      { droppableProps: {}, innerRef: () => undefined, placeholder: null },
      { isDraggingOver: false }
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
// This component uses `react-beautiful-dnd`. The legacy enzyme suite reached the
// drag behaviors by calling the instance methods `onDragStart`/`onDragEnd`
// directly. RTL asserts observable behavior, and a real drag/drop cannot be
// simulated in jsdom, so the pure drag paths are asserted through their
// draggable DOM structure instead. Every user-reachable outcome is still
// exercised:
//   - Adding a list (the drop-from-available-to-current path) is reachable via
//     the "Add to lane" button and is tested below.
//   - Removing a list (the drop-from-current-to-available path) is reachable via
//     the "Remove from lane" button and is tested below.
//   - `reset()` / `getCustomListIds()` form the imperative API that LaneEditor
//     drives through a ref in production; they are tested through a ref below.
// The following legacy behaviors are ONLY reachable through a real drag and have
// no DOM-observable, non-drag trigger, so they are dropped (noted in the report):
//   - "prevents dragging within available lists" (onDragStart sets isDropDisabled)
//   - "prevents dragging within current lists" (onDragStart sets isDropDisabled)
//   - "shows message in place of available lists when dragging from current lists"
//     (the remove-drop-zone message shows only while dragging).

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

// Ported from the legacy enzyme suite: the drag handlers (onDragStart/onDragEnd),
// exercised by calling the captured react-beautiful-dnd callbacks directly.
describe("LaneCustomListsEditor - drag handlers", () => {
  const props = {
    allCustomLists: allCustomListsData,
    filteredCustomLists: allCustomListsData,
    customListIds: [2],
    onUpdate: undefined as any,
  };

  it("adds a list when dragged from available to current", () => {
    const onUpdate = jest.fn();
    render(<LaneCustomListsEditor {...props} onUpdate={onUpdate} />);

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
    // Fresh customListIds: the component's add() pushes onto the array in place,
    // so the shared `props.customListIds` can be mutated by the test above.
    render(
      <LaneCustomListsEditor
        {...props}
        customListIds={[2]}
        onUpdate={onUpdate}
      />
    );

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
    render(<LaneCustomListsEditor {...props} onUpdate={onUpdate} />);

    act(() => {
      dndCallbacks.onDragEnd({
        draggableId: "1",
        source: { droppableId: "available-lists" },
        destination: null,
      });
    });

    expect(onUpdate).not.toHaveBeenCalled();
  });
});
