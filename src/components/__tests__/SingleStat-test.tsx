import { expect } from "chai";
import { shallow, ShallowWrapper } from "enzyme";
import { beforeEach } from "mocha";
import * as React from "react";
import SingleStat, { SingleStatProps } from "../SingleStat";

describe("SingleStat", () => {
  const statWithTooltip: SingleStatProps = {
    label: "Number of Widgets",
    value: 357892,
    tooltip: "Total Widget Count",
  };
  const humanReadableValue = "357.9k";
  const formattedValue = "357,892";

  // Verifies the structure and content.
  const expectStatContent = (item: ShallowWrapper) => {
    expect(item.length).to.equal(1);
    expect(item.childAt(0).text()).to.equal(humanReadableValue);
    expect(item.childAt(1).text()).to.equal(statWithTooltip.label);
  };

  describe("rendering the list item", () => {
    let wrapper;

    beforeEach(() => {
      wrapper = shallow(<SingleStat {...statWithTooltip} />);
    });

    it("has a top-level list element, with or without a tooltip", () => {
      expect(wrapper.name()).to.equal("li");
      wrapper.setProps({ tooltip: null });
      expect(wrapper.name()).to.equal("li");
      wrapper.setProps({ tooltip: undefined });
      expect(wrapper.name()).to.equal("li");
    });

    it("shows tooltip, when available", () => {
      const tooltip = wrapper.find({ "data-toggle": "tooltip" });
      expect(tooltip.length).to.equal(1);
      expect(tooltip.props().title).to.contain(statWithTooltip.tooltip);
      expect(tooltip.props().title).to.contain(formattedValue);
      // When there's a tooltip, it wraps the content.
      expectStatContent(tooltip); // When there's a tooltip, it wraps the content
    });

    it("omits tooltip, if not specified", () => {
      wrapper.setProps({ tooltip: null });
      const tooltip = wrapper.find({ "data-toggle": "tooltip" });
      expect(tooltip.length).to.equal(0);
      // When there's no tooltip, the list element wraps the content.
      expectStatContent(wrapper);
    });
  });
});
