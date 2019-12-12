import { expect } from "chai";
import { stub } from "sinon";

import * as React from "react";
import { mount } from "enzyme";

import EditorField from "../EditorField";
import { Editor } from "draft-js";

describe("EditorField", () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(<EditorField content="This is a summary." disabled={false} />);
  });

  it("renders buttons", () => {
    let stubChangeStyle = stub(wrapper.instance(), "changeStyle");
    let buttons = wrapper.find("button");
    expect(buttons.length).to.equal(3);
    expect(stubChangeStyle.callCount).to.equal(0);

    let bold = buttons.at(0);
    expect(bold.text()).to.equal("Bold");
    expect(bold.find("b").length).to.equal(1);
    bold.simulate("mouseDown");
    expect(stubChangeStyle.callCount).to.equal(1);
    expect(stubChangeStyle.args[0][1]).to.equal("BOLD");

    let italic = buttons.at(1);
    expect(italic.text()).to.equal("Italic");
    expect(italic.find("i").length).to.equal(1);
    italic.simulate("mouseDown");
    expect(stubChangeStyle.callCount).to.equal(2);
    expect(stubChangeStyle.args[1][1]).to.equal("ITALIC");

    let underline = buttons.at(2);
    expect(underline.text()).to.equal("Underline");
    expect(underline.find("u").length).to.equal(1);
    underline.simulate("mouseDown");
    expect(stubChangeStyle.callCount).to.equal(3);
    expect(stubChangeStyle.args[2][1]).to.equal("UNDERLINE");

    stubChangeStyle.restore();
  });

  it("gets the current value", () => {
    expect(wrapper.instance().getValue()).to.equal("<p>This is a summary.</p>");
  });

  it("gets the default content if no content is an empty html string", () => {
    // The empty paragraph element seems to be the default that is
    // injected whenever the editor is saved with no content. We are checking
    // against that in case the summary is empty or it was removed by
    // the admin.
    wrapper = mount(<EditorField content="<p></p>" disabled={false} />);
    expect(wrapper.instance().getValue())
      .to.equal("<p>Update the content for this field.</p>");

    // The empty string case.
    wrapper = mount(<EditorField content="" disabled={false} />);
    expect(wrapper.instance().getValue())
      .to.equal("<p>Update the content for this field.</p>");

    wrapper = mount(<EditorField content={undefined} disabled={false} />);
      expect(wrapper.instance().getValue())
        .to.equal("<p>Update the content for this field.</p>");
  });

  it("can be disabled", () => {
    let buttons = wrapper.find("button");
    let editor = wrapper.find(Editor);
    expect(buttons.every(b => !b.prop("disabled")));
    expect(editor.prop("readOnly")).to.be.false;

    wrapper.setProps({ disabled: true });

    buttons = wrapper.find("button");
    editor = wrapper.find(Editor);
    expect(buttons.every(b => b.prop("disabled")));
    expect(editor.prop("readOnly")).to.be.true;
  });
});
