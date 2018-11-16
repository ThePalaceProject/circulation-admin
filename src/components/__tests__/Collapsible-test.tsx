import { expect } from "chai";
import { stub } from "sinon";

import * as React from "react";
import { shallow, mount } from "enzyme";

import Collapsible from "../Collapsible";

describe("Collapsible", () => {
  describe("Collapsible text", () => {
    let wrapper;
    beforeEach(() => {
      wrapper = mount(
        <Collapsible
          title="TITLE!"
          text="INSTRUCTIONS!"
          type="instruction"
        />
      );
    });

    describe("rendering", () => {
      it("renders a panel component", () => {
        let panel = wrapper.find("Panel");
        expect(panel.length).to.equal(1);
        expect(panel.hasClass("collapsible")).to.be.true;
      });

      it("is collapsed by default", () => {
        expect(wrapper.state().open).to.be.false;

        let panel = wrapper.find("Panel");
        expect(panel.props().expanded).to.be.false;
        expect(panel.props().defaultExpanded).to.be.false;
      });

      it("should be opened by default with openByDefault prop passed", () => {
        wrapper = mount(
          <Collapsible
            title="TITLE!"
            text="INSTRUCTIONS!"
            type="instruction"
            openByDefault={true}
          />
        );
        expect(wrapper.state().open).to.be.true;

        let panel = wrapper.find("Panel");
        expect(panel.props().expanded).to.be.true;
      });

      it("receives the correct title and body props", () => {
        let section = wrapper.find("section");

        expect(wrapper.props().title).to.equal("TITLE!");
        expect(wrapper.props().text).to.equal("INSTRUCTIONS!");
        expect(section.props().dangerouslySetInnerHTML["__html"]).to.equal("INSTRUCTIONS!");
      });

      it("renders a heading with a title and a toggle button", () => {
        let heading = wrapper.find(".panel-heading");
        expect(heading.length).to.equal(1);
        expect(heading.text()).to.equal("TITLE!");

        let button = heading.find("button");
        expect(button.length).to.equal(1);
        let icon = button.find(".glyphicon");
        expect(icon.length).to.equal(1);
      });

      it("renders a collapsible body section with the correct content", () => {
        let body = wrapper.find(".panel-body");
        expect(body.length).to.equal(1);
        expect(body.text()).to.equal("INSTRUCTIONS!");
      });
    });

    describe("behavior", () => {
      it("expands and collapses when clicked", () => {
        let panel = wrapper.find("Panel");
        expect(wrapper.state().open).to.be.false;
        expect(panel.props().expanded).to.be.false;

        let title = wrapper.find(".panel-title");
        title.simulate("click");

        expect(wrapper.state().open).to.be.true;
        expect(panel.props().expanded).to.be.true;

        title.simulate("click");

        expect(wrapper.state().open).to.be.false;
        expect(panel.props().expanded).to.be.false;
      });

      it("flips the toggle icon when clicked", () => {
        let icon = wrapper.find(".glyphicon");
        expect(icon.props().glyph).to.equal("plus");

        let title = wrapper.find(".panel-title");
        title.simulate("click");

        expect(icon.props().glyph).to.equal("minus");

        title.simulate("click");

        expect(icon.props().glyph).to.equal("plus");
      });
    });
  });

  describe("Collapsible HTML body", () => {
    let wrapper;
    beforeEach(() => {
      wrapper = mount(
        <Collapsible
          title="TITLE!"
          body={<div>Form here <label>Test label</label><input type="text" /></div>}
        />
      );
    });

    it("should render the HTML body", () => {
      let section = wrapper.find("section");

      expect(wrapper.props().title).to.equal("TITLE!");
      expect(wrapper.props().text).to.equal(undefined);
      expect(section.props().dangerouslySetInnerHTML).to.equal(undefined);
      expect(section.html()).to.equal(
        "<section><div><!-- react-text: 12 -->Form here <!-- /react-text --><label>Test label</label><input type=\"text\"></div></section>"
      );
    });
  });
});
