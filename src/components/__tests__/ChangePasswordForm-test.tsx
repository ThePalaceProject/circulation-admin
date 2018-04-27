import { expect } from "chai";
import { stub } from "sinon";

import * as React from "react";
import { shallow, mount } from "enzyme";

import { ChangePasswordForm } from "../ChangePasswordForm";
import LoadingIndicator from "opds-web-client/lib/components/LoadingIndicator";
import ErrorMessage from "../ErrorMessage";
import EditableInput from "../EditableInput";
import { Alert } from "react-bootstrap";

describe("ChangePasswordForm", () => {
  let wrapper;
  let changePassword;

  beforeEach(() => {
    changePassword = stub().returns(new Promise<void>(resolve => resolve()));
    wrapper = shallow(
      <ChangePasswordForm
        isFetching={false}
        csrfToken="token"
        changePassword={changePassword}
        />
    );
  });

  it("shows ErrorMessage on request error", () => {
    let error = wrapper.find(ErrorMessage);
    expect(error.length).to.equal(0);

    let fetchError = {
      status: 500,
      response: "response",
      url: ""
    };
    wrapper.setProps({ fetchError });
    error = wrapper.find(ErrorMessage);
    expect(error.length).to.equal(1);
  });

  it("shows LoadingIndicator", () => {
    let loading = wrapper.find(LoadingIndicator);
    expect(loading.length).to.equal(0);

    wrapper.setProps({ isFetching: true });
    loading = wrapper.find(LoadingIndicator);
    expect(loading.length).to.equal(1);
  });

  it("shows validation error", () => {
    let error = wrapper.find(Alert);
    expect(error.length).to.equal(0);

    wrapper.setState({ success: false, error: "Error!" });
    error = wrapper.find(Alert);
    expect(error.length).to.equal(1);
    expect(error.prop("bsStyle")).to.equal("danger");
  });

  it("shows success message", () => {
    let success = wrapper.find(Alert);
    expect(success.length).to.equal(0);

    wrapper.setState({ success: true, error: null });
    success = wrapper.find(Alert);
    expect(success.length).to.equal(1);
    expect(success.prop("bsStyle")).to.equal("success");
  });

  it("shows password inputs", () => {
    let inputs = wrapper.find(EditableInput);
    expect(inputs.length).to.equal(2);
    expect(inputs.at(0).prop("label")).to.contain("New Password");
    expect(inputs.at(1).prop("label")).to.contain("Confirm New Password");
    expect(inputs.at(0).prop("type")).to.equal("password");
    expect(inputs.at(1).prop("type")).to.equal("password");
  });

  it("checks if passwords match", () => {
    wrapper = mount(
      <ChangePasswordForm
        isFetching={false}
        csrfToken="token"
        changePassword={changePassword}
        />
    );
    let passwordInput = wrapper.find("input[name='password']");
    let confirmInput = wrapper.find("input[name='confirm_password']");
    let passwordInputElement = passwordInput.get(0);
    passwordInputElement.value = "newPassword";
    passwordInput.simulate("change");
    let confirmInputElement = confirmInput.get(0);
    confirmInputElement.value = "somethingElse";
    confirmInput.simulate("change");

    let form = wrapper.find("form");
    form.simulate("submit");

    expect(changePassword.callCount).to.equal(0);
    expect(wrapper.instance().state.error).to.contain("Passwords do not match");
  });

  it("submits new password", async () => {
    wrapper = mount(
      <ChangePasswordForm
        isFetching={false}
        csrfToken="token"
        changePassword={changePassword}
        />
    );
    let passwordInput = wrapper.find("input[name='password']");
    let confirmInput = wrapper.find("input[name='confirm_password']");
    let passwordInputElement = passwordInput.get(0);
    passwordInputElement.value = "newPassword";
    passwordInput.simulate("change");
    let confirmInputElement = confirmInput.get(0);
    confirmInputElement.value = "newPassword";
    confirmInput.simulate("change");

    let form = wrapper.find("form");
    form.simulate("submit");

    expect(changePassword.callCount).to.equal(1);
    let formData = changePassword.args[0][0];
    expect(formData.get("password")).to.equal("newPassword");

    // Let the call stack clear so the callback after editItem will run.
    const pause = (): Promise<void> => {
      return new Promise<void>(resolve => setTimeout(resolve, 0));
    };
    await pause();
    expect(wrapper.instance().state.success).to.equal(true);
  });
});