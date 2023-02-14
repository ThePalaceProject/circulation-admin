import * as React from "react";
import { render, screen } from "@testing-library/react";
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
