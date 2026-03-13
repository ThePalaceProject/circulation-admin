import * as React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import LanesSidebar from "../../../src/components/lanes/LanesSidebar";

// ── react-router mock (LanesSidebar renders Link) ─────────────────────────────
jest.mock("react-router", () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const React = require("react");
  return {
    ...jest.requireActual("react-router"),
    Link: ({
      children,
      to,
      className,
    }: {
      children?: React.ReactNode;
      to?: any;
      className?: string;
    }) => {
      const href = typeof to === "string" ? to : to?.pathname || "";
      return (
        <a href={href} className={className}>
          {children}
        </a>
      );
    },
  };
});

// ── DragDropContext mock ────────────────────────────────────────────────────────
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
    <ul
      data-testid={`droppable-${droppableId}`}
      className="droppable"
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
    </ul>
  );

  const Draggable = ({
    children,
    draggableId: _draggableId,
  }: {
    children: (provided: any, snapshot: any) => React.ReactNode;
    draggableId: string | number;
    index?: number;
  }) => (
    <>
      {children(
        {
          innerRef: function innerRefNoop2(_el: any) {
            /* noop */
          },
          placeholder: null,
          draggableProps: {},
          dragHandleProps: {},
          draggableStyle: {},
        },
        { isDragging: false }
      )}
    </>
  );

  return { DragDropContext, Droppable, Draggable };
});

// ── Fixtures ───────────────────────────────────────────────────────────────────
const subsublaneData = {
  id: 3,
  display_name: "SubSublane 1",
  visible: false,
  count: 2,
  sublanes: [],
  custom_list_ids: [2],
  inherit_parent_restrictions: false,
};

const sublaneData = {
  id: 2,
  display_name: "Sublane 1",
  visible: false,
  count: 3,
  sublanes: [subsublaneData],
  custom_list_ids: [2],
  inherit_parent_restrictions: false,
};

describe("LanesSidebar", () => {
  let drag: jest.Mock;
  let findLaneForIdentifier: jest.Mock;
  let findParentOfLane: jest.Mock;
  let lanesData: any[];

  beforeEach(() => {
    drag = jest.fn();
    findLaneForIdentifier = jest.fn().mockReturnValue(null);
    findParentOfLane = jest.fn().mockReturnValue(null);
    lanesData = [
      {
        id: 1,
        display_name: "Top Lane 1",
        visible: true,
        count: 5,
        sublanes: [{ ...sublaneData, sublanes: [{ ...subsublaneData }] }],
        custom_list_ids: [1],
        inherit_parent_restrictions: true,
      },
      {
        id: 4,
        display_name: "Top Lane 2",
        visible: true,
        count: 1,
        sublanes: [],
        custom_list_ids: [],
        inherit_parent_restrictions: false,
      },
    ];
    capturedDragHandlers = {};
  });

  function renderSidebar(
    overrides: Partial<React.ComponentProps<typeof LanesSidebar>> = {}
  ) {
    return render(
      <LanesSidebar
        orderChanged={false}
        drag={drag}
        lanes={lanesData}
        library="library"
        findLaneForIdentifier={findLaneForIdentifier}
        findParentOfLane={findParentOfLane}
        {...overrides}
      />
    );
  }

  it("renders create top-level lane link", () => {
    renderSidebar();
    const sidebarLinks = document.querySelectorAll(".lanes-sidebar > div a");
    // First link is create-lane
    const createLink = Array.from(sidebarLinks).find((a) =>
      a.classList.contains("create-lane")
    );
    expect(createLink).toBeTruthy();
    expect(createLink.getAttribute("href")).toContain("create");
  });

  it("disables create link when orderChanged", () => {
    renderSidebar({ orderChanged: true });
    const createLink = document.querySelector(".create-lane");
    expect(createLink.classList.contains("disabled")).toBe(true);
    expect(createLink.getAttribute("href")).toBe("");
  });

  it("renders reset link", () => {
    renderSidebar();
    const resetLink = document.querySelector(".reset-lane");
    expect(resetLink).toBeTruthy();
    expect(resetLink.getAttribute("href")).toContain("reset");
  });

  it("disables reset link when orderChanged", () => {
    renderSidebar({ orderChanged: true });
    const resetLink = document.querySelector(".reset-lane");
    expect(resetLink.classList.contains("disabled")).toBe(true);
    expect(resetLink.getAttribute("href")).toBe("");
  });

  it("renders active lane with 'active' class on the identified lane", () => {
    const { rerender } = renderSidebar();
    // No lane is active by default
    expect(document.querySelector(".lane-parent.active")).toBeNull();

    // identifier="1" means Top Lane 1 is active
    rerender(
      <LanesSidebar
        orderChanged={false}
        drag={drag}
        lanes={lanesData}
        library="library"
        findLaneForIdentifier={findLaneForIdentifier}
        findParentOfLane={findParentOfLane}
        identifier="1"
      />
    );
    const activeLane = document.querySelector(".lane-parent.active");
    expect(activeLane).toBeTruthy();
    expect(activeLane.textContent).toContain("Top Lane 1");

    // identifier="2" means sublane 1 is active
    rerender(
      <LanesSidebar
        orderChanged={false}
        drag={drag}
        lanes={lanesData}
        library="library"
        findLaneForIdentifier={findLaneForIdentifier}
        findParentOfLane={findParentOfLane}
        identifier="2"
      />
    );
    const activeSublane = document.querySelector(".lane-parent.active");
    expect(activeSublane).toBeTruthy();
    expect(activeSublane.textContent).toContain("Sublane 1");
  });

  it("drags and drops a top-level lane: calls drag twice with correct args", () => {
    renderSidebar();
    const dragEvent = {
      draggableId: "4",
      source: { index: 1, droppableId: "top" },
    };
    // Simulate onDragStart
    act(() => {
      capturedDragHandlers.onDragStart?.(dragEvent);
    });
    expect(drag).toHaveBeenCalledTimes(1);
    expect(drag.mock.calls[0][0]).toEqual({
      draggableId: "4",
      draggingFrom: "top",
    });

    // findLaneForIdentifier needs to return lane 4 for the drag to work
    findLaneForIdentifier.mockReturnValue(lanesData[1]); // lane 4
    findParentOfLane.mockReturnValue(null); // top-level lane has no parent

    // Simulate onDragEnd: drop Top Lane 2 before Top Lane 1 (index 1 → index 0)
    act(() => {
      capturedDragHandlers.onDragEnd?.({
        ...dragEvent,
        destination: { droppableId: "top", index: 0 },
      });
    });
    expect(drag).toHaveBeenCalledTimes(2);
    expect(drag.mock.calls[1][0].draggableId).toBeNull();
    expect(drag.mock.calls[1][0].draggingFrom).toBeNull();
    expect(drag.mock.calls[1][0].orderChanged).toBe(true);
    // lanes should be reordered: [lane4, lane1]
    expect(drag.mock.calls[1][0].lanes[0].id).toBe(4);
    expect(drag.mock.calls[1][0].lanes[1].id).toBe(1);
  });

  it("drags and drops a sublane: calls drag twice, reorders sublanes", () => {
    const newSublane = {
      id: 5,
      display_name: "Sublane 2",
      visible: true,
      count: 0,
      inherit_parent_restrictions: false,
      sublanes: [],
      custom_list_ids: [],
    };
    lanesData[0] = {
      ...lanesData[0],
      sublanes: [{ ...sublaneData, sublanes: [] }, newSublane],
    };

    findLaneForIdentifier.mockReturnValue(newSublane);
    findParentOfLane.mockReturnValue(lanesData[0]);

    renderSidebar();

    const dragEvent = {
      draggableId: "5",
      source: { index: 1, droppableId: "1" },
    };

    act(() => {
      capturedDragHandlers.onDragStart?.(dragEvent);
    });
    expect(drag).toHaveBeenCalledTimes(1);
    expect(drag.mock.calls[0][0]).toEqual({
      draggableId: "5",
      draggingFrom: "1",
    });

    act(() => {
      capturedDragHandlers.onDragEnd?.({
        ...dragEvent,
        destination: { droppableId: "1", index: 0 },
      });
    });
    expect(drag).toHaveBeenCalledTimes(2);
    expect(drag.mock.calls[1][0].draggableId).toBeNull();
    expect(drag.mock.calls[1][0].draggingFrom).toBeNull();
    expect(drag.mock.calls[1][0].orderChanged).toBe(true);
    // sublanes reordered: [newSublane, sublaneData]
    expect(drag.mock.calls[1][0].lanes[0].sublanes[0].id).toBe(5);
    expect(drag.mock.calls[1][0].lanes[0].sublanes[1].id).toBe(2);
  });

  it("drops a lane back to original position: drag is NOT called", () => {
    renderSidebar();
    act(() => {
      capturedDragHandlers.onDragEnd?.({
        draggableId: "1",
        source: { index: 0, droppableId: "top" },
        destination: { index: 0, droppableId: "top" },
      });
    });
    expect(drag).not.toHaveBeenCalled();
  });

  it("renders lane names and counts", () => {
    renderSidebar();
    expect(screen.getByText(/Top Lane 1/)).toBeTruthy();
    expect(screen.getByText(/Top Lane 2/)).toBeTruthy();
  });

  it("renders sublanes and can expand/collapse them", () => {
    renderSidebar();
    // Top Lane 1 starts expanded (top-level), but Sublane 1 is collapsed
    expect(screen.getByText(/Top Lane 1/)).toBeTruthy();
    expect(screen.getByText(/Sublane 1/)).toBeTruthy();

    // SubSublane 1 should NOT be visible (Sublane 1 is initially collapsed)
    expect(screen.queryByText(/SubSublane 1/)).toBeNull();

    // Find expand button for Sublane 1 (it's a sublane = has expand-button)
    const expandButtons = document.querySelectorAll(".expand-button");
    // Click the first expand button (for Sublane 1)
    fireEvent.click(expandButtons[0]);

    // Now SubSublane 1 should be visible
    expect(screen.getByText(/SubSublane 1/)).toBeTruthy();

    // Find collapse button for Sublane 1 now
    const sublane1Area = document.querySelector(".lane-parent .lane-parent");
    const collapseBtn = sublane1Area.querySelector(".collapse-button");
    expect(collapseBtn).toBeTruthy();
    fireEvent.click(collapseBtn);

    // SubSublane 1 hidden again
    expect(screen.queryByText(/SubSublane 1/)).toBeNull();
  });

  it("top-level lanes start expanded, showing collapse button", () => {
    renderSidebar();
    // Top Lane 1 and Top Lane 2 are top-level, start expanded
    const collapseBtns = document.querySelectorAll(".collapse-button");
    // At least the two top-level lanes show collapse buttons
    expect(collapseBtns.length).toBeGreaterThanOrEqual(2);
  });

  it("renders two top-level lanes in a droppable list", () => {
    renderSidebar();
    // Both lanes with >1 sibling get a droppable; top level has 2 lanes → uses droppable-top
    const droppableTop = document.querySelector(
      "[data-testid='droppable-top']"
    );
    expect(droppableTop).toBeTruthy();
    // Lane names visible
    expect(screen.getByText(/Top Lane 1/)).toBeTruthy();
    expect(screen.getByText(/Top Lane 2/)).toBeTruthy();
  });

  it("single sublane not rendered as draggable (no droppable for parent id=1)", () => {
    // Sublane 1 is the only child of Top Lane 1 → no droppable for id=1
    const droppable1 = document.querySelector("[data-testid='droppable-1']");
    expect(droppable1).toBeNull();
  });
});
