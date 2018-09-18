import { expect } from "chai";
import { stub } from "sinon";

import * as React from "react";
import { mount } from "enzyme";

import LoadButton from "../LoadButton";
import MoreDotsIcon from "../icons/MoreDotsIcon";

describe("LoadButton", () => {
  let wrapper;
  let loadMore;

  beforeEach(() => {
    loadMore = stub();
    wrapper = mount(
      <LoadButton
        isFetching={false}
        loadMore={loadMore}
      />
    );
  });

  describe("rendering", () => {
    it("should display 'Load more' text", () => {
      expect(wrapper.text()).to.contain("Load more");
    });

    it("should render the MoreDotsIcon component", () => {
      let moreDotsIcon = wrapper.find("MoreDotsIcon");
      expect(moreDotsIcon.length).to.equal(0);

      wrapper.setProps({ isFetching: true });

      moreDotsIcon = wrapper.find("MoreDotsIcon");
      expect(moreDotsIcon.length).to.equal(1);
    });
  });

  describe("behavior", () => {
    it("should call loadMore", () => {
      wrapper.simulate("click");
      expect(loadMore.callCount).to.equal(1);
    });

    it("does nothing when disabled", () => {
      wrapper.setProps({ isFetching: true });
      wrapper.simulate("click");
      expect(loadMore.callCount).to.equal(0);
    });
  });
});
