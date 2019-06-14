import { expect } from "chai";
import { stub } from "sinon";

import * as React from "react";
import { shallow, mount } from "enzyme";

import { ChangePasswordForm } from "../ChangePasswordForm";
import LoadingIndicator from "opds-web-client/lib/components/LoadingIndicator";
import ErrorMessage from "../ErrorMessage";
import EditableInput from "../EditableInput";
import { Alert } from "react-bootstrap";
import { Form } from "library-simplified-reusable-components";


describe("ChangePasswordForm", () => {
  let wrapper;
  let changePassword;

  beforeEach(() => {
    changePassword = stub().returns(new Promise<void>(resolve => resolve()));
    wrapper = mount(
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
    let error = wrapper.find(".alert-danger");
    expect(error.length).to.equal(0);

    wrapper.setState({ success: false, error: "Error!" });
    error = wrapper.find(".alert-danger");
    expect(error.length).to.equal(1);
    expect(error.text()).to.equal("Error!");
  });

  it("shows success message", () => {
    let success = wrapper.find(".alert-success");
    expect(success.length).to.equal(0);

    wrapper.setState({ success: true, error: null });
    success = wrapper.find(".alert-success");
    expect(success.length).to.equal(1);
    console.log(success.text());
    expect(success.text()).to.equal("Password changed successfully");
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
    const formData = new (window as any).FormData();
    formData.append("password", "newPassword");
    formData.append("confirm_password", "somethingElse");

    wrapper.instance().save(formData);

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
    const formData = new (window as any).FormData();
    formData.append("password", "newPassword");
    formData.append("confirm_password", "newPassword");
    wrapper.instance().save(formData);

    expect(changePassword.callCount).to.equal(1);
    let calledWith = changePassword.args[0][0];
    expect(calledWith.get("password")).to.equal("newPassword");

    // Let the call stack clear so the callback after editItem will run.
    const pause = (): Promise<void> => {
      return new Promise<void>(resolve => setTimeout(resolve, 0));
    };
    await pause();
    expect(wrapper.instance().state.success).to.equal(true);
  });
});
