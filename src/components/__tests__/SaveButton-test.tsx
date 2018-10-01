import { expect } from "chai";
import { stub, spy } from "sinon";

import * as React from "react";
import { mount } from "enzyme";

import SaveButton from "../SaveButton";

describe("SaveButton", () => {
  let wrapper;
  let save;
  let handleData;
  let handleSubmit;
  let data = {key: "value"};

  beforeEach(() => {
    handleData = stub();
    save = stub();
    wrapper = mount(
      <SaveButton
        disabled={false}
        save={save}
        form={undefined}
      />
    );
  });

  it("should say 'Save' if no text prop has been passed in", () => {
    expect(wrapper.text()).to.contain("Save");
  });

  it("should display text from the text prop, if there is one", () => {
    wrapper.setProps({ text: "some other string" });
    expect(wrapper.text()).to.contain("some other string");
  });

  it("should call save", () => {
    wrapper.simulate("click");
    expect(save.callCount).to.equal(1);
  });

  it("should not call handleData if the handleData prop was not passed down", () => {
    wrapper.simulate("click");
    expect(handleData.callCount).to.equal(0);
  });

  it("should call handleData if the handleData prop was passed down", () => {
    wrapper.setProps({ handleData: handleData });
    wrapper.simulate("click");
    expect(handleData.callCount).to.equal(1);
  });

  it("should do nothing if disabled", () => {
    wrapper.setProps({ disabled: true });
    wrapper.simulate("click");
    expect(save.callCount).to.equal(0);
    expect(handleData.callCount).to.equal(0);
  });

});
