import * as React from "react";
import { render, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { LaneData } from "../../../src/interfaces";
import LanesSidebar from "../../../src/components/LanesSidebar";

// react-router's Link is rendered as a marker `<div data-testid="Link">` so we
// can assert its target (`data-to`) and className without a Router in context.
// Both LanesSidebar and its Lane children render Links.
jest.mock("react-router", () => ({
  ...jest.requireActual("react-router"),
  Link: (props: any) => (
    <div data-testid="Link" data-to={props.to} className={props.className}>
      {props.children}
    </div>
  ),
}));

// react-beautiful-dnd is mocked so that (a) we can capture the drag handlers
// LanesSidebar hands to DragDropContext and invoke them the way the library
// would — without simulating pixel-level drags — and (b) Droppable/Draggable
// still call their render-prop children with `provided`/`snapshot`, which is
// what gives draggable lanes their `.draggable` class and grab handle. A lane
// group of size one is rendered by LanesSidebar without a Draggable, so those
// lanes are (correctly) not draggable.
jest.mock("react-beautiful-dnd", () => {
  const handlers: any = {};
  return {
    __handlers: handlers,
    DragDropContext: ({ onDragStart, onDragEnd, children }: any) => {
      handlers.onDragStart = onDragStart;
      handlers.onDragEnd = onDragEnd;
      handlers.droppables = []; // reset the per-render capture
      return children;
    },
    Droppable: ({ droppableId, isDropDisabled, children }: any) => {
      handlers.droppables.push({
        droppableId,
        isDropDisabled: !!isDropDisabled,
      });
      return children(
        { innerRef: () => undefined, droppableProps: {}, placeholder: null },
        { isDraggingOver: false }
      );
    },
    Draggable: ({ children }: any) =>
      children(
        {
          innerRef: () => undefined,
          draggableProps: {},
          dragHandleProps: {},
          draggableStyle: {},
          placeholder: null,
        },
        { isDragging: false }
      ),
  };
});

const getHandlers = () =>
  (jest.requireMock("react-beautiful-dnd") as any).__handlers;

const makeSubsublane = (): LaneData => ({
  id: 3,
  display_name: "SubSublane 1",
  visible: false,
  count: 2,
  sublanes: [],
  custom_list_ids: [2],
  inherit_parent_restrictions: false,
});
const makeSublane = (): LaneData => ({
  id: 2,
  display_name: "Sublane 1",
  visible: false,
  count: 3,
  sublanes: [makeSubsublane()],
  custom_list_ids: [2],
  inherit_parent_restrictions: false,
});
const makeLanes = (): LaneData[] => [
  {
    id: 1,
    display_name: "Top Lane 1",
    visible: true,
    count: 5,
    sublanes: [makeSublane()],
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

const renderSidebar = (extra: any = {}) => {
  const lanes: LaneData[] = extra.lanes ?? makeLanes();
  const drag = extra.drag ?? jest.fn();
  const findLaneForIdentifier =
    extra.findLaneForIdentifier ?? jest.fn().mockReturnValue(lanes[1]);
  const findParentOfLane =
    extra.findParentOfLane ?? jest.fn().mockReturnValue(null);
  const props: any = {
    orderChanged: false,
    library: "library",
    drag,
    lanes,
    findLaneForIdentifier,
    findParentOfLane,
    ...extra.props,
  };
  const result = render(<LanesSidebar {...props} />);
  const rerenderWith = (next: any = {}) =>
    result.rerender(<LanesSidebar {...props} {...next} />);
  return {
    ...result,
    rerenderWith,
    drag,
    findLaneForIdentifier,
    findParentOfLane,
    lanes,
  };
};

// --- DOM helpers -----------------------------------------------------------

// The <li>s of the top-level droppable list.
const droppableLis = (container: HTMLElement) =>
  Array.from(container.querySelector("ul.droppable")!.children).filter(
    (el) => el.tagName === "LI"
  ) as HTMLElement[];
// A lane's `.lane-parent` div (the first div in its <li>).
const parentDiv = (li: Element) =>
  li.querySelector(":scope > div") as HTMLElement;
// A lane's own `.lane-info` (not those of its descendants).
const ownInfo = (lp: Element) =>
  lp.querySelector(":scope > .lane-info") as HTMLElement;
const collapseBtn = (lp: Element) =>
  ownInfo(lp).querySelector(".collapse-button") as HTMLElement | null;
const expandBtn = (lp: Element) =>
  ownInfo(lp).querySelector(".expand-button") as HTMLElement | null;
// The first descendant sublane `.lane-parent`.
const firstChildParent = (lp: Element) =>
  lp.querySelector("li > div") as HTMLElement | null;
// All descendant sublane `.lane-parent`s (used for counting when only the
// immediate level is rendered).
const childParents = (lp: Element) =>
  Array.from(lp.querySelectorAll("li > div")) as HTMLElement[];
// Whether a lane's own lane-info carries the draggable class.
const isDraggable = (lp: Element) =>
  ownInfo(lp).classList.contains("draggable");
// The lane's own display name (the last text node in its lane-info span).
const laneName = (lp: Element) => {
  const span = lp.querySelector(":scope > .lane-info > span");
  return (span?.lastChild?.textContent || "").trim();
};
const laneParentByName = (container: HTMLElement, name: string) =>
  Array.from(container.querySelectorAll<HTMLElement>(".lane-parent")).find(
    (lp) => laneName(lp) === name
  )!;
// A lane's direct sublane <li>s.
const directSublanes = (lp: Element) => {
  const ul = lp.querySelector(":scope > ul");
  if (!ul) return [];
  return Array.from(ul.children).filter((c) => c.tagName === "LI");
};

describe("LanesSidebar", () => {
  it("renders create top-level lane link", () => {
    const { container, rerenderWith } = renderSidebar();
    const header = container.querySelector<HTMLElement>(".lanes-sidebar > div");

    let create = within(header).getAllByTestId("Link")[0];
    expect(create).toHaveClass("create-lane");
    expect(create).toHaveAttribute(
      "data-to",
      "/admin/web/lanes/library/create"
    );

    // the link is disabled if there are lane order changes
    rerenderWith({ orderChanged: true });
    create = within(header).getAllByTestId("Link")[0];
    expect(create).toHaveClass("create-lane");
    expect(create).not.toHaveAttribute("data-to");
    expect(create).toHaveClass("disabled");
  });

  it("renders reset link", () => {
    const { container, rerenderWith } = renderSidebar();
    const header = container.querySelector<HTMLElement>(".lanes-sidebar > div");

    let reset = within(header).getAllByTestId("Link")[1];
    expect(reset).toHaveClass("reset-lane");
    expect(reset).toHaveAttribute("data-to", "/admin/web/lanes/library/reset");

    rerenderWith({ orderChanged: true });
    reset = within(header).getAllByTestId("Link")[1];
    expect(reset).toHaveClass("reset-lane");
    expect(reset).not.toHaveAttribute("data-to");
    expect(reset).toHaveClass("disabled");
  });

  it("renders active lane", () => {
    const { container, rerenderWith } = renderSidebar();

    const topLane1 = () => parentDiv(droppableLis(container)[0]);
    const topLane2 = () => parentDiv(droppableLis(container)[1]);
    const subLane1 = () => firstChildParent(topLane1())!;

    expect(topLane1()).not.toHaveClass("active");
    expect(topLane2()).not.toHaveClass("active");
    expect(subLane1()).not.toHaveClass("active");

    rerenderWith({ identifier: "1" });
    expect(topLane1()).toHaveClass("active");
    expect(topLane2()).not.toHaveClass("active");
    expect(subLane1()).not.toHaveClass("active");

    rerenderWith({ identifier: "2" });
    expect(topLane1()).not.toHaveClass("active");
    expect(topLane2()).not.toHaveClass("active");
    expect(subLane1()).toHaveClass("active");
  });

  it("drags and drops a top-level lane", () => {
    const { drag, lanes } = renderSidebar();
    const handlers = getHandlers();

    // pick up Top Lane 2
    handlers.onDragStart({
      draggableId: "4",
      source: { index: 1, droppableId: "top" },
    });
    expect(drag).toHaveBeenCalledTimes(1);
    expect(drag.mock.calls[0][0]).toStrictEqual({
      draggableId: "4",
      draggingFrom: "top",
    });

    // drop it before Top Lane 1
    handlers.onDragEnd({
      draggableId: "4",
      source: { index: 1, droppableId: "top" },
      destination: { droppableId: "top", index: 0 },
    });
    expect(drag).toHaveBeenCalledTimes(2);
    expect(drag.mock.calls[1][0]).toStrictEqual({
      draggableId: null,
      draggingFrom: null,
      lanes: [lanes[1], lanes[0]],
      orderChanged: true,
    });
  });

  it("drags and drops a sublane", () => {
    const lanes = makeLanes();
    const sublaneData = lanes[0].sublanes[0];
    const newSublane: LaneData = {
      id: 5,
      display_name: "Sublane 2",
      visible: true,
      count: 0,
      inherit_parent_restrictions: false,
      sublanes: [],
      custom_list_ids: [],
    };
    lanes[0].sublanes = [sublaneData, newSublane];

    const drag = jest.fn();
    renderSidebar({
      lanes,
      drag,
      findLaneForIdentifier: jest.fn().mockReturnValue(newSublane),
      findParentOfLane: jest.fn().mockReturnValue(lanes[0]),
    });
    const handlers = getHandlers();

    // pick up Sublane 2
    handlers.onDragStart({
      draggableId: "5",
      source: { index: 1, droppableId: "1" },
    });
    expect(drag).toHaveBeenCalledTimes(1);
    expect(drag.mock.calls[0][0]).toStrictEqual({
      draggableId: "5",
      draggingFrom: "1",
    });

    // drop it before Sublane 1
    handlers.onDragEnd({
      draggableId: "5",
      source: { index: 1, droppableId: "1" },
      destination: { droppableId: "1", index: 0 },
    });
    expect(drag).toHaveBeenCalledTimes(2);
    expect(drag.mock.calls[1][0].draggableId).toBeNull();
    expect(drag.mock.calls[1][0].draggingFrom).toBeNull();
    expect(drag.mock.calls[1][0].orderChanged).toBe(true);
    expect(drag.mock.calls[1][0].lanes[0].sublanes).toStrictEqual([
      newSublane,
      sublaneData,
    ]);
  });

  it("drops a lane back into its original position", () => {
    const { drag } = renderSidebar();
    const handlers = getHandlers();

    handlers.onDragEnd({
      draggableId: "1",
      source: { index: 0, droppableId: "top" },
      destination: { index: 0, droppableId: "top" },
    });
    expect(drag).not.toHaveBeenCalled();
  });

  it("renders and expands and collapses lanes and sublanes", async () => {
    const user = userEvent.setup();
    const { container } = renderSidebar();

    const lis = droppableLis(container);
    expect(lis).toHaveLength(2);
    let topLane1 = parentDiv(lis[0]);
    const topLane2 = parentDiv(lis[1]);
    expect(topLane1).toHaveTextContent("Top Lane 1");
    expect(topLane2).toHaveTextContent("Top Lane 2");

    // both top-level lanes are expanded to start
    expect(collapseBtn(topLane1)).toBeInTheDocument();
    expect(expandBtn(topLane1)).not.toBeInTheDocument();
    expect(collapseBtn(topLane2)).toBeInTheDocument();
    expect(expandBtn(topLane2)).not.toBeInTheDocument();

    // top lane 1 has one sublane which is collapsed
    let subLane1 = firstChildParent(topLane1)!;
    expect(subLane1).toHaveTextContent("Sublane 1");
    expect(childParents(topLane1)).toHaveLength(1);
    expect(expandBtn(subLane1)).toBeInTheDocument();
    expect(collapseBtn(subLane1)).not.toBeInTheDocument();

    // top lane 2 has no sublanes
    expect(childParents(topLane2)).toHaveLength(0);

    // sublane 1 has a sublane, but it's not shown while sublane 1 is collapsed
    expect(childParents(subLane1)).toHaveLength(0);

    // if we expand sublane 1, we can see its sublane below it
    await user.click(expandBtn(subLane1)!);
    topLane1 = parentDiv(droppableLis(container)[0]);
    subLane1 = firstChildParent(topLane1)!;
    expect(collapseBtn(subLane1)).toBeInTheDocument();
    const subSubLane = firstChildParent(subLane1)!;
    expect(subSubLane).toHaveTextContent("SubSublane 1");
    expect(expandBtn(subSubLane)).toBeInTheDocument();

    // if we collapse sublane 1, its sublane is hidden again
    await user.click(collapseBtn(subLane1)!);
    topLane1 = parentDiv(droppableLis(container)[0]);
    subLane1 = firstChildParent(topLane1)!;
    expect(expandBtn(subLane1)).toBeInTheDocument();
    expect(childParents(subLane1)).toHaveLength(0);

    // if we collapse lane 1, its sublane is hidden
    await user.click(collapseBtn(topLane1)!);
    topLane1 = parentDiv(droppableLis(container)[0]);
    expect(expandBtn(topLane1)).toBeInTheDocument();
    expect(childParents(topLane1)).toHaveLength(0);

    // if we expand lane 1, its sublane is shown again
    await user.click(expandBtn(topLane1)!);
    topLane1 = parentDiv(droppableLis(container)[0]);
    expect(collapseBtn(topLane1)).toBeInTheDocument();
    expect(childParents(topLane1)).toHaveLength(1);
  });

  it("renders draggable sublanes only if there's more than one", async () => {
    const user = userEvent.setup();
    // lane structure:
    //        top
    //       /   \
    //      1     4
    //     / \
    //    2   5
    //   /   / \
    //  3   6   7
    //      |
    //      8
    //
    // top, 1, and 5 are the only lanes with more than one sublane, so only
    // their children (1, 4, 2, 5, 6, 7) are draggable.
    const subsublane = makeSubsublane(); // id 3, "SubSublane 1"
    const sublane2: LaneData = {
      id: 2,
      display_name: "sublane 2",
      visible: false,
      count: 3,
      sublanes: [subsublane],
      custom_list_ids: [2],
      inherit_parent_restrictions: false,
    };
    const sublane8: LaneData = {
      id: 8,
      display_name: "sublane 8",
      visible: true,
      count: 6,
      sublanes: [],
      custom_list_ids: [2],
      inherit_parent_restrictions: false,
    };
    const sublane6: LaneData = {
      id: 6,
      display_name: "sublane 6",
      visible: true,
      count: 6,
      sublanes: [sublane8],
      custom_list_ids: [2],
      inherit_parent_restrictions: false,
    };
    const sublane7: LaneData = {
      id: 7,
      display_name: "sublane 7",
      visible: true,
      count: 6,
      sublanes: [],
      custom_list_ids: [2],
      inherit_parent_restrictions: false,
    };
    const sublane5: LaneData = {
      id: 5,
      display_name: "sublane 5",
      visible: true,
      count: 6,
      sublanes: [sublane6, sublane7],
      custom_list_ids: [2],
      inherit_parent_restrictions: false,
    };
    const lanes: LaneData[] = [
      {
        id: 1,
        display_name: "lane 1",
        visible: true,
        count: 5,
        sublanes: [sublane2, sublane5],
        custom_list_ids: [1],
        inherit_parent_restrictions: true,
      },
      {
        id: 4,
        display_name: "lane 4",
        visible: true,
        count: 1,
        sublanes: [],
        custom_list_ids: [],
        inherit_parent_restrictions: false,
      },
    ];

    const { container } = renderSidebar({ lanes });

    // Expand every collapsible lane so the whole tree is in the DOM.
    for (let i = 0; i < 20; i++) {
      const btns = Array.from(
        container.querySelectorAll<HTMLElement>(".expand-button")
      );
      if (btns.length === 0) break;
      for (const btn of btns) await user.click(btn);
    }

    const byName = (name: string) => laneParentByName(container, name);

    // A lane is draggable only when it has a sibling (its parent group > 1).
    expect(isDraggable(byName("lane 1"))).toBe(true);
    expect(isDraggable(byName("lane 4"))).toBe(true);
    expect(isDraggable(byName("sublane 2"))).toBe(true);
    expect(isDraggable(byName("sublane 5"))).toBe(true);
    expect(isDraggable(byName("SubSublane 1"))).toBe(false);
    expect(isDraggable(byName("sublane 6"))).toBe(true);
    expect(isDraggable(byName("sublane 7"))).toBe(true);
    expect(isDraggable(byName("sublane 8"))).toBe(false);

    // The tree renders each lane's direct children.
    expect(directSublanes(byName("lane 1"))).toHaveLength(2); // 2 and 5
    expect(directSublanes(byName("lane 4"))).toHaveLength(0);
    expect(directSublanes(byName("sublane 2"))).toHaveLength(1); // SubSublane 1
    expect(directSublanes(byName("sublane 5"))).toHaveLength(2); // 6 and 7
    expect(directSublanes(byName("sublane 6"))).toHaveLength(1); // 8
    expect(directSublanes(byName("sublane 7"))).toHaveLength(0);
  });

  // A tree with two sibling parent groups — each with >1 child, so each renders a
  // nested drop target — plus the top-level list. The mocks stand in for Lanes:
  // onDragStart reports the dragged id, and findLaneForIdentifier resolves the
  // lane from it, so nothing is "in flight" until the sidebar reports a drag.
  const renderDropBoundary = async (
    user: ReturnType<typeof userEvent.setup>
  ) => {
    const child = (id: number, name: string): LaneData => ({
      id,
      display_name: name,
      visible: true,
      count: 0,
      sublanes: [],
      custom_list_ids: [],
      inherit_parent_restrictions: false,
    });
    const parentA: LaneData = {
      id: 1,
      display_name: "Parent A",
      visible: true,
      count: 0,
      sublanes: [child(11, "A-1"), child(12, "A-2")],
      custom_list_ids: [],
      inherit_parent_restrictions: true,
    };
    const parentB: LaneData = {
      id: 2,
      display_name: "Parent B",
      visible: true,
      count: 0,
      sublanes: [child(21, "B-1"), child(22, "B-2")],
      custom_list_ids: [],
      inherit_parent_restrictions: true,
    };
    const lanes = [parentA, parentB];
    const allLanes = [...lanes, ...parentA.sublanes, ...parentB.sublanes];

    let draggingId: string = null;
    const drag = jest.fn(({ draggableId }) => {
      draggingId = draggableId;
    });
    const findLaneForIdentifier = jest.fn(() =>
      draggingId
        ? allLanes.find((l) => String(l.id) === String(draggingId))
        : null
    );
    const findParentOfLane = jest.fn(
      (lane: LaneData) =>
        lanes.find((p) => p.sublanes.some((s) => s.id === lane?.id)) ?? null
    );

    const { container, rerenderWith } = renderSidebar({
      lanes,
      drag,
      findLaneForIdentifier,
      findParentOfLane,
    });

    // Expand both parents so their nested drop targets render.
    for (let i = 0; i < 20; i++) {
      const btns = Array.from(
        container.querySelectorAll<HTMLElement>(".expand-button")
      );
      if (btns.length === 0) break;
      for (const btn of btns) await user.click(btn);
    }

    const byId = (id: string) =>
      getHandlers().droppables.find((d: any) => d.droppableId === id);

    // Report a drag start, then let the (stand-in) parent re-render the sidebar
    // with that lane in flight — the same round trip the real Lanes makes.
    const startDrag = (draggableId: string, from: string) => {
      getHandlers().onDragStart({
        draggableId,
        source: { index: 0, droppableId: from },
      });
      rerenderWith();
    };

    return { byId, drag, startDrag };
  };

  it("enables dropping a sublane only within its own parent", async () => {
    const user = userEvent.setup();
    const { byId, drag, startDrag } = await renderDropBoundary(user);

    // Before any drag, every list accepts drops.
    expect(byId("1")?.isDropDisabled).toBe(false);
    expect(byId("2")?.isDropDisabled).toBe(false);
    expect(byId("top")?.isDropDisabled).toBe(false);

    // Drag A-1, a child of Parent A.
    startDrag("11", "1");
    expect(drag).toHaveBeenCalledWith({
      draggableId: "11",
      draggingFrom: "1",
    });

    // Only its own parent accepts the drop; the sibling parent and the
    // cross-level top list reject it.
    expect(byId("1")?.isDropDisabled).toBe(false);
    expect(byId("2")?.isDropDisabled).toBe(true);
    expect(byId("top")?.isDropDisabled).toBe(true);
  });

  it("keeps a dragged top-level lane in the top-level list", async () => {
    const user = userEvent.setup();
    const { byId, drag, startDrag } = await renderDropBoundary(user);

    // Drag Parent A itself — a top-level lane, so it has no parent. This is the
    // mirror of the sublane case: it may be reordered among the top-level lanes,
    // but must not be droppable into any parent's sublane list (which would
    // persist a top-level lane underneath another lane).
    startDrag("1", "top");
    expect(drag).toHaveBeenCalledWith({
      draggableId: "1",
      draggingFrom: "top",
    });

    expect(byId("top")?.isDropDisabled).toBe(false);
    expect(byId("1")?.isDropDisabled).toBe(true);
    expect(byId("2")?.isDropDisabled).toBe(true);
  });
});
