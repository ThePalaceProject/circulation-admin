import * as React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import LibraryRegistrationForm from "../../../src/components/config/LibraryRegistrationForm";

describe("LibraryRegistrationForm", () => {
  const library = {
    name: "Test Library",
    short_name: "test",
    uuid: "1",
    status: "success",
    stage: "production",
  };
  const registrationData = {
    id: 1,
    libraries: [library],
    access_problem: null,
    terms_of_service_html:
      "Here are the <a href='terms.html'>terms of service</a>!",
    terms_of_service_link: "terms.html",
  };

  function renderForm(
    props: Partial<React.ComponentProps<typeof LibraryRegistrationForm>> = {}
  ) {
    const register = jest.fn();
    const defaultProps = {
      library,
      checked: true,
      buttonText: "Update registration",
      register,
      disabled: false,
      registrationData,
    };
    const { rerender } = render(
      <LibraryRegistrationForm {...defaultProps} {...props} />
    );
    return { register, rerender };
  }

  it("does not display a label and checkbox if there is no terms-of-service data", () => {
    renderForm({ registrationData: null });
    expect(document.querySelector(".registration-checkbox")).toBeNull();
    expect(document.querySelector(".registration-status label")).toBeNull();
    expect(document.querySelector(".registration-status a")).toBeNull();
    expect(document.querySelector(".registration-status input")).toBeNull();
  });

  it("displays an error message if there is a problem with the terms-of-service data", () => {
    const dataWithProblem = {
      ...registrationData,
      access_problem: { detail: "Something went wrong." },
    };
    renderForm({ registrationData: dataWithProblem });
    // Error message in .bg-danger
    const errorEl = document.querySelector(".registration-checkbox .bg-danger");
    expect(errorEl).toBeTruthy();
    expect(errorEl.textContent).toBe("Something went wrong.");
    // No checkbox/button when access_problem present
    expect(document.querySelector(".registration-status input")).toBeNull();
    expect(document.querySelector(".registration-status button")).toBeNull();
  });

  it("displays content and a checkbox with a label if there is terms-of-service HTML", () => {
    renderForm();
    const termsSection = document.querySelector(".registration-checkbox");
    expect(termsSection).toBeTruthy();
    // The ToS content paragraph
    const content = termsSection.querySelector("p");
    expect(content).toBeTruthy();
    expect(content.textContent).toBe("Here are the terms of service!");
    // Label text
    const label = screen.getByLabelText("I agree to the terms of service.");
    expect(label).toBeTruthy();
    // Checkbox
    const checkbox = document.querySelector("input[type='checkbox']");
    expect(checkbox).toBeTruthy();
  });

  it("displays content and a checkbox with a label if there is a terms-of-service link", () => {
    const { rerender } = render(
      <LibraryRegistrationForm
        library={library}
        checked={true}
        buttonText="Update registration"
        register={jest.fn()}
        disabled={false}
        registrationData={{
          ...registrationData,
          terms_of_service_html: null,
        }}
      />
    );
    const termsSection = document.querySelector(".registration-checkbox");
    expect(termsSection).toBeTruthy();
    // The paragraph with the link
    const content = termsSection.querySelector("p");
    expect(content.textContent).toContain("terms of service");
    // Link
    const link = termsSection.querySelector("a");
    expect(link.getAttribute("href")).toBe("terms.html");
    // Label + checkbox
    const checkbox = document.querySelector("input[type='checkbox']");
    expect(checkbox).toBeTruthy();
    expect(document.querySelector("label")).toBeTruthy();
  });

  it("displays a registration button with the correct text", () => {
    const { rerender } = render(
      <LibraryRegistrationForm
        library={library}
        checked={true}
        buttonText="Update registration"
        register={jest.fn()}
        disabled={false}
        registrationData={registrationData}
      />
    );
    expect(
      screen.getByRole("button", { name: "Update registration" })
    ).toBeTruthy();

    rerender(
      <LibraryRegistrationForm
        library={library}
        checked={true}
        buttonText="Register"
        register={jest.fn()}
        disabled={false}
        registrationData={registrationData}
      />
    );
    expect(screen.getByRole("button", { name: "Register" })).toBeTruthy();

    rerender(
      <LibraryRegistrationForm
        library={library}
        checked={true}
        buttonText="Retry registration"
        register={jest.fn()}
        disabled={false}
        registrationData={registrationData}
      />
    );
    expect(
      screen.getByRole("button", { name: "Retry registration" })
    ).toBeTruthy();
  });

  it("disables the button if there is a checkbox and it is unchecked", () => {
    const { rerender } = render(
      <LibraryRegistrationForm
        library={library}
        checked={true}
        buttonText="Update registration"
        register={jest.fn()}
        disabled={false}
        registrationData={registrationData}
      />
    );
    // checked=true → button enabled
    expect(screen.getByRole("button")).not.toBeDisabled();

    // unchecked → button disabled
    const checkbox = document.querySelector(
      "input[type='checkbox']"
    ) as HTMLInputElement;
    fireEvent.click(checkbox);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("disables the button if the disabled prop is set to true, regardless of the checkbox", () => {
    const { rerender } = render(
      <LibraryRegistrationForm
        library={library}
        checked={true}
        buttonText="Update registration"
        register={jest.fn()}
        disabled={true}
        registrationData={registrationData}
      />
    );
    expect(screen.getByRole("button")).toBeDisabled();

    rerender(
      <LibraryRegistrationForm
        library={library}
        checked={true}
        buttonText="Update registration"
        register={jest.fn()}
        disabled={false}
        registrationData={registrationData}
      />
    );
    expect(screen.getByRole("button")).not.toBeDisabled();
  });

  it("determines whether to pre-check the checkbox based on checked prop", () => {
    const { rerender } = render(
      <LibraryRegistrationForm
        library={library}
        checked={true}
        buttonText="Update registration"
        register={jest.fn()}
        disabled={false}
        registrationData={registrationData}
      />
    );
    expect(
      (document.querySelector("input[type='checkbox']") as HTMLInputElement)
        .checked
    ).toBe(true);

    rerender(
      <LibraryRegistrationForm
        library={library}
        checked={false}
        buttonText="Update registration"
        register={jest.fn()}
        disabled={false}
        registrationData={registrationData}
      />
    );
    expect(
      (document.querySelector("input[type='checkbox']") as HTMLInputElement)
        .checked
    ).toBe(false);
  });

  it("calls register when button is clicked (and not disabled)", () => {
    const register = jest.fn();
    render(
      <LibraryRegistrationForm
        library={library}
        checked={true}
        buttonText="Update registration"
        register={register}
        disabled={false}
        registrationData={registrationData}
      />
    );
    const button = screen.getByRole("button");
    fireEvent.click(button);
    expect(register).toHaveBeenCalledTimes(1);
    expect(register.mock.calls[0][0]).toEqual(library);
  });

  it("does not call register when button is disabled", () => {
    const register = jest.fn();
    render(
      <LibraryRegistrationForm
        library={library}
        checked={true}
        buttonText="Update registration"
        register={register}
        disabled={true}
        registrationData={registrationData}
      />
    );
    const button = screen.getByRole("button");
    fireEvent.click(button);
    // Button is disabled, form should not submit
    expect(register).not.toHaveBeenCalled();
  });
});
