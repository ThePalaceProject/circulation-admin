import { expect } from "chai";

import * as React from "react";
import { shallow, ShallowWrapper } from "enzyme";

import SingleStat, { SingleStatProps } from "../SingleStat";
import { beforeEach } from "mocha";

describe("SingleStat", () => {
  const statWithTooltip: SingleStatProps = {
    label: "Number of Widgets",
    value: 357892,
    tooltip: "Total Widget Count",
  };
  const humanReadableValue = "357.9k";
  const formattedValue = "357,892";

  // verifies the structure and content of a SingleStat list element.
  const expectStatItem = (item: ShallowWrapper) => {
    expect(item.length).to.equal(1);
    expect(item.name()).to.equal("li");
    expect(item.childAt(0).text()).to.equal(humanReadableValue);
    expect(item.childAt(1).text()).to.equal(statWithTooltip.label);
  };

  describe("rendering the list item", () => {
    let wrapper;

    beforeEach(() => {
      wrapper = shallow(<SingleStat {...statWithTooltip} />);
    });

    it("shows tooltip, when available", () => {
      const tooltip = wrapper.find({ "data-toggle": "tooltip" });
      expect(tooltip.length).to.equal(1);
      expect(tooltip.props().title).to.contain(statWithTooltip.tooltip);
      expect(tooltip.props().title).to.contain(formattedValue);
      // The tooltip should wrap a single list item.
      expectStatItem(tooltip.at(0).find("li"));
    });

    it("omits tooltip, if not specified", () => {
      wrapper.setProps({ tooltip: null });
      const tooltip = wrapper.find({ "data-toggle": "tooltip" });
      expect(tooltip.length).to.equal(0);
      // The list item should be present in the fragment,
      // even though the tooltip is absent.
      expectStatItem(wrapper.find("li"));
    });
  });
});
