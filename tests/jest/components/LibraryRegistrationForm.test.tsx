import * as React from "react";
import { installFormDataShim } from "../testUtils/formDataShim";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import LibraryRegistrationForm from "../../../src/components/LibraryRegistrationForm";
installFormDataShim();

describe("LibraryRegistrationForm", () => {
  const library = {
    name: "Test Library",
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

  type Props = React.ComponentProps<typeof LibraryRegistrationForm>;

  const makeProps = (overrides: Partial<Props> = {}): Props => ({
    library: library as Props["library"],
    checked: true,
    buttonText: "Update registration",
    register: jest.fn(),
    disabled: false,
    registrationData: registrationData as Props["registrationData"],
    ...overrides,
  });

  const renderForm = (overrides: Partial<Props> = {}) => {
    const props = makeProps(overrides);
    const result = render(<LibraryRegistrationForm {...props} />);
    const rerender = (nextOverrides: Partial<Props>) =>
      result.rerender(
        <LibraryRegistrationForm {...makeProps(nextOverrides)} />
      );
    return { ...result, rerender, props };
  };

  it("does not display a label and checkbox if there is no terms-of-service data", () => {
    const { container } = renderForm({ registrationData: null });

    expect(
      container.querySelector(".registration-checkbox")
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("I agree to the terms of service.")
    ).not.toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
  });

  it("displays an error message if there is a problem with the terms-of-service data", () => {
    const dataWithProblem = {
      ...registrationData,
      access_problem: { detail: "Something went wrong." },
    };
    const { container } = renderForm({
      registrationData: dataWithProblem as Props["registrationData"],
    });

    const danger = container.querySelector(".registration-checkbox .bg-danger");
    expect(danger).toHaveTextContent("Something went wrong.");
    // If the terms can't be displayed, there's no point showing the checkbox
    // and button.
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("displays content and a checkbox with a label if there is terms-of-service HTML", () => {
    const { container } = renderForm();

    const termsSection = container.querySelector(".registration-checkbox");
    expect(termsSection).toBeInTheDocument();

    const content = termsSection.querySelector("p");
    expect(content).toHaveTextContent("Here are the terms of service!");

    const checkbox = screen.getByRole("checkbox", {
      name: "I agree to the terms of service.",
    });
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).toHaveAttribute("type", "checkbox");
  });

  it("displays content and a checkbox with a label if there is a terms-of-service link", () => {
    const { container } = renderForm({
      registrationData: {
        ...registrationData,
        terms_of_service_html: null,
      } as Props["registrationData"],
    });

    const termsSection = container.querySelector(".registration-checkbox");
    expect(termsSection).toBeInTheDocument();

    const content = termsSection.querySelector("p");
    expect(content).toHaveTextContent(
      "You must read the terms of service before registering your library."
    );

    const link = screen.getByRole("link", { name: "terms of service" });
    expect(link).toHaveAttribute("href", "terms.html");

    const checkbox = screen.getByRole("checkbox", {
      name: "I agree to the terms of service.",
    });
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).toHaveAttribute("type", "checkbox");
  });

  it("displays a registration button", () => {
    const { rerender } = renderForm();
    expect(
      screen.getByRole("button", { name: "Update registration" })
    ).toBeInTheDocument();

    rerender({ buttonText: "Register" });
    expect(
      screen.getByRole("button", { name: "Register" })
    ).toBeInTheDocument();

    rerender({ buttonText: "Retry registration" });
    expect(
      screen.getByRole("button", { name: "Retry registration" })
    ).toBeInTheDocument();
  });

  it("disables the button if there is a checkbox and it is unchecked", async () => {
    const user = userEvent.setup();
    renderForm();

    const button = screen.getByRole("button", { name: "Update registration" });
    expect(button).toBeEnabled();

    // Unchecking the terms-of-service checkbox disables the button.
    await user.click(
      screen.getByRole("checkbox", {
        name: "I agree to the terms of service.",
      })
    );

    expect(
      screen.getByRole("button", { name: "Update registration" })
    ).toBeDisabled();
  });

  it("disables the button if the disabled prop is set to true, regardless of the checkbox", () => {
    const { rerender } = renderForm();

    rerender({ disabled: true });
    expect(
      screen.getByRole("button", { name: "Update registration" })
    ).toBeDisabled();

    rerender({ disabled: false });
    expect(
      screen.getByRole("button", { name: "Update registration" })
    ).toBeEnabled();
  });

  it("determines whether to pre-check the checkbox", () => {
    const { rerender } = renderForm();

    expect(
      screen.getByRole("checkbox", {
        name: "I agree to the terms of service.",
      })
    ).toBeChecked();

    rerender({ checked: false });
    expect(
      screen.getByRole("checkbox", {
        name: "I agree to the terms of service.",
      })
    ).not.toBeChecked();
  });

  it("calls register", async () => {
    const user = userEvent.setup();
    const register = jest.fn();
    const { rerender } = renderForm({ register });

    await user.click(
      screen.getByRole("button", { name: "Update registration" })
    );
    expect(register).toHaveBeenCalledTimes(1);
    expect(register).toHaveBeenCalledWith(library);

    // A disabled button does not fire register again.
    rerender({ register, disabled: true });
    await user.click(
      screen.getByRole("button", { name: "Update registration" })
    );
    expect(register).toHaveBeenCalledTimes(1);
  });
});
