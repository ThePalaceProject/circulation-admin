import { expect } from "chai";
import { stub } from "sinon";

import * as React from "react";
import { mount } from "enzyme";

import SaveButton from "../SaveButton";

describe("SaveButton", () => {
  let wrapper;
  let save;
  let handleData;
  let form;
  let FormData = {testProperty: "testing..."};

  beforeEach(() => {
    save = stub();
    handleData = stub();
    wrapper = mount(
      <SaveButton
        disabled={false}
        save={save}
        form={undefined}
      />
    );
  });

  it("should display 'Submit' text", () => {
    expect(wrapper.text()).to.contain("Submit");
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
    wrapper.setProps({ disabled: true, handleData: stub() });
    wrapper.simulate("click");
    expect(save.callCount).to.equal(0);
    expect(handleData.callCount).to.equal(0);
  });

});
