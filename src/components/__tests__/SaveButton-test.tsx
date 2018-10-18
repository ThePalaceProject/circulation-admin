import { expect } from "chai";
import { stub, spy } from "sinon";

import * as React from "react";
import { mount } from "enzyme";

import SaveButton from "../SaveButton";

describe("SaveButton", () => {
  let wrapper;
  let submit;
  let handleSubmit;
  let data = {key: "value"};

  beforeEach(() => {
    submit = stub();
    wrapper = mount(
      <SaveButton
        disabled={false}
        submit={submit}
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

  it("should call submit", () => {
    wrapper.simulate("click");
    expect(submit.callCount).to.equal(1);
  });

  it("should do nothing if disabled", () => {
    wrapper.setProps({ disabled: true });
    wrapper.simulate("click");
    expect(submit.callCount).to.equal(0);
  });

});
