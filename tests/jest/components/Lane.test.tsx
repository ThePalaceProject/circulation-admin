import * as React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { stub } from "sinon";
import { LaneData } from "../../../src/interfaces";
import Lane from "../../../src/components/Lane";

// Mock the Link component from React Router, so we can verify that it gets rendered with the
// expected props. This serves as an example of how to do something analogous to Enzyme's shallow
// rendering, when we don't want/need to render the whole component tree down to HTML elements to
// test something. This technique is useful for testing components in isolation (unit testing),
// instead of the integration testing that RTL focuses on.

jest.mock("react-router", () => ({
  ...jest.requireActual("react-router"),
  Link: (props) => (
    <div data-testid="Link" data-to={props.to}>
      {props.children}
    </div>
  ),
}));

const renderLanes = stub();
const toggleLaneVisibility = stub();

function createLaneData(displayName: string, isAutomated: boolean): LaneData {
  return {
    id: 1,
    display_name: displayName,
    visible: true,
    count: 5,
    sublanes: [],
    // The absence/presence of custom list ids determines if a lane is automated or custom.
    custom_list_ids: isAutomated ? [] : [1],
    inherit_parent_restrictions: true,
  };
}

describe("Lane", () => {
  it("renders an edit link on a custom lane", () => {
    const laneData = createLaneData("Custom Lane", false);

    render(
      <Lane
        lane={laneData}
        active={false}
        library="test_library"
        orderChanged={false}
        renderLanes={renderLanes}
        toggleLaneVisibility={toggleLaneVisibility}
      />
    );

    const editLink = screen.getAllByTestId("Link")[0];

    expect(editLink).toHaveAttribute("data-to", expect.stringMatching(/edit/i));
    expect(editLink).toHaveTextContent(/edit/i);
  });

  it("renders an edit link on an automated lane", async () => {
    const laneData = createLaneData("Automated Lane", true);

    render(
      <Lane
        lane={laneData}
        active={false}
        library="test_library"
        orderChanged={false}
        renderLanes={renderLanes}
        toggleLaneVisibility={toggleLaneVisibility}
      />
    );

    const editLink = screen.getAllByTestId("Link")[0];

    expect(editLink).toHaveAttribute("data-to", expect.stringMatching(/edit/i));
    expect(editLink).toHaveTextContent(/edit/i);
  });
});

// Ported from the legacy enzyme Lane-test: the visibility toggle, the prop-sync
// in componentWillReceiveProps, and expand/collapse — none of which the disclosure
// tests above exercise.
describe("Lane - visibility toggle and expansion", () => {
  const makeLane = (visible: boolean): LaneData => ({
    id: 1,
    display_name: "Top Lane",
    visible,
    count: 5,
    sublanes: [],
    custom_list_ids: [1],
    inherit_parent_restrictions: true,
  });

  const renderLane = (overrides: Record<string, unknown> = {}) => {
    const toggle = jest.fn();
    const result = render(
      <Lane
        lane={makeLane(true)}
        active={false}
        library="lib"
        orderChanged={false}
        renderLanes={jest.fn()}
        toggleLaneVisibility={toggle}
        {...overrides}
      />
    );
    return { ...result, toggle };
  };

  it("hides a visible lane when the hide button is clicked", async () => {
    const { container, toggle } = renderLane();
    const hideButton = container.querySelector(
      "button.hide-lane"
    ) as HTMLButtonElement;
    expect(hideButton).toBeInTheDocument();

    await userEvent.click(hideButton);

    expect(toggle).toHaveBeenCalledWith(
      expect.objectContaining({ id: 1 }),
      false
    );
  });

  it("shows a hidden lane when the show button is clicked", async () => {
    const { container, toggle } = renderLane({ lane: makeLane(false) });
    const showButton = container.querySelector(
      "button.show-lane"
    ) as HTMLButtonElement;
    expect(showButton).toBeInTheDocument();

    await userEvent.click(showButton);

    expect(toggle).toHaveBeenCalledWith(
      expect.objectContaining({ id: 1 }),
      true
    );
  });

  it("disables the visibility toggle when lane order has changed", () => {
    const { container } = renderLane({ orderChanged: true });
    expect(container.querySelector("button.hide-lane")).toBeDisabled();
  });

  it("cannot show a lane whose parent is hidden", () => {
    const { container } = renderLane({
      lane: makeLane(false),
      parent: { visible: false },
    });
    expect(container.querySelector("button.show-lane")).toBeDisabled();
  });

  it("syncs its visibility button when the lane prop changes", () => {
    const { container, rerender } = renderLane();
    expect(container.querySelector("button.hide-lane")).toBeInTheDocument();

    rerender(
      <Lane
        lane={makeLane(false)}
        active={false}
        library="lib"
        orderChanged={false}
        renderLanes={jest.fn()}
        toggleLaneVisibility={jest.fn()}
      />
    );
    expect(container.querySelector("button.show-lane")).toBeInTheDocument();
  });

  it("hides the create and edit links when collapsed", async () => {
    renderLane();
    // A top-level lane starts expanded, so both links show.
    expect(screen.getAllByTestId("Link").length).toBeGreaterThanOrEqual(2);

    await userEvent.click(
      screen.getByRole("button", { name: /expand or collapse/i })
    );
    expect(screen.queryAllByTestId("Link")).toHaveLength(0);
  });

  it("renders a create-sublane link when expanded", () => {
    renderLane();
    const createLink = screen
      .getAllByTestId("Link")
      .find((link) => link.getAttribute("data-to")?.includes("/create/"));
    expect(createLink).toHaveAttribute(
      "data-to",
      "/admin/web/lanes/lib/create/1"
    );
  });
});
