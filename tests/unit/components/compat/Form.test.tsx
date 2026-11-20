import * as React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Form } from "../../../../src/components/compat";
import { installFormDataShim } from "../../testUtils/formDataShim";

// The compat `Form` builds `new FormData(formElement)` on submit. Install the
// shared shim, so the payload holds only the form's successful controls, as a
// browser sends them.
installFormDataShim();

const fields = (
  <label>
    Name
    <input name="name" defaultValue="Ada" />
  </label>
);

describe("compat Form", () => {
  it("passes the form data to `onSubmit` when the submit button is clicked", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <Form
        content={fields}
        onSubmit={onSubmit}
        hiddenName="csrf_token"
        hiddenValue="token"
      />
    );

    await user.click(screen.getByRole("button", { name: "Submit" }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    const data: FormData = onSubmit.mock.calls[0][0];
    expect(data.get("name")).toBe("Ada");
    expect(data.get("csrf_token")).toBe("token");
  });

  it("stops the browser's own submit when the submit button is clicked", () => {
    render(<Form onSubmit={vi.fn()} />);
    // `fireEvent` returns false when a handler called `preventDefault()`.
    // Without that call, the browser would submit the form and load a new page.
    expect(
      fireEvent.click(screen.getByRole("button", { name: "Submit" }))
    ).toBe(false);
  });

  it("submits when Enter is pressed in a field", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<Form content={fields} onSubmit={onSubmit} />);

    await user.type(screen.getByRole("textbox", { name: "Name" }), "{Enter}");

    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("renders the given button content, class, and disabled state", () => {
    render(
      <Form
        onSubmit={vi.fn()}
        buttonContent="Save"
        buttonClass="left-align"
        disableButton={true}
      />
    );
    const button = screen.getByRole("button", { name: "Save" });
    expect(button).toHaveClass("btn", "left-align");
    expect(button).toBeDisabled();
  });

  it("leaves out the submit button with `withoutButton`", () => {
    render(<Form onSubmit={vi.fn()} withoutButton={true} />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("has only the clearfix class when no class is given", () => {
    const { container } = render(<Form onSubmit={vi.fn()} />);
    expect(container.firstChild).toHaveAttribute("class", "clearfix");
  });

  it("renders the title and the class", () => {
    const { container } = render(
      <Form onSubmit={vi.fn()} title="Settings" className="edit-form" />
    );
    expect(container.querySelector("label.form-title")).toHaveTextContent(
      "Settings"
    );
    expect(container.firstChild).toHaveAttribute("class", "clearfix edit-form");
  });

  it.each([
    { prop: "errorText", alertClass: "alert-danger" },
    { prop: "successText", alertClass: "alert-success" },
    { prop: "infoText", alertClass: "alert-info" },
    { prop: "loadingText", alertClass: "alert-loading" },
    { prop: "warningText", alertClass: "alert-warning" },
  ])("shows $prop as an alert with $alertClass", ({ prop, alertClass }) => {
    render(<Form onSubmit={vi.fn()} {...{ [prop]: "A message" }} />);
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("A message");
    expect(alert).toHaveClass("alert", alertClass);
    expect(alert).toHaveAttribute("tabindex", "-1");
  });

  it("keeps the type and props of an element message, and renders it inside", () => {
    render(
      <Form
        onSubmit={vi.fn()}
        errorText={<div className="details">Failed</div>}
      />
    );
    const alert = screen.getByRole("alert");
    expect(alert.tagName).toBe("DIV");
    // Its own class replaces the alert class.
    expect(alert).toHaveAttribute("class", "details");
    // The element also renders again inside the alert.
    expect(alert.querySelector(".details")).toHaveTextContent("Failed");
    // Its text shows only once.
    expect(screen.getAllByText("Failed")).toHaveLength(1);
  });

  it.each([
    {
      name: "errorText",
      props: {
        errorText: "Error",
        infoText: "Info",
        loadingText: "Loading",
        warningText: "Warning",
      },
      order: ["Error", "Info", "Loading", "Warning"],
    },
    {
      name: "successText",
      props: {
        successText: "Success",
        infoText: "Info",
        loadingText: "Loading",
        warningText: "Warning",
      },
      order: ["Success", "Info", "Loading", "Warning"],
    },
  ])("shows the alerts in order, starting with $name", ({ props, order }) => {
    render(<Form onSubmit={vi.fn()} {...props} />);
    expect(
      screen.getAllByRole("alert").map((alert) => alert.textContent)
    ).toEqual(order);
  });

  it("shows no success alert while there is an error", () => {
    render(<Form onSubmit={vi.fn()} errorText="Failed" successText="Saved" />);
    expect(screen.getByRole("alert")).toHaveTextContent("Failed");
    expect(screen.queryByText("Saved")).not.toBeInTheDocument();
  });

  it.each(["errorText", "successText", "warningText"])(
    "moves the focus to a new %s alert",
    (prop) => {
      const { rerender } = render(<Form onSubmit={vi.fn()} content={fields} />);
      screen.getByRole("textbox", { name: "Name" }).focus();

      rerender(
        <Form
          onSubmit={vi.fn()}
          content={fields}
          {...{ [prop]: "A message" }}
        />
      );

      expect(screen.getByRole("alert")).toHaveFocus();
    }
  );

  it.each(["infoText", "loadingText"])(
    "keeps the focus where it is for a new %s alert",
    (prop) => {
      const { rerender } = render(<Form onSubmit={vi.fn()} content={fields} />);
      const input = screen.getByRole("textbox", { name: "Name" });
      input.focus();

      rerender(
        <Form
          onSubmit={vi.fn()}
          content={fields}
          {...{ [prop]: "A message" }}
        />
      );

      expect(input).toHaveFocus();
    }
  );

  it("moves the focus to the last alert when several show", () => {
    const { rerender } = render(<Form onSubmit={vi.fn()} />);

    rerender(
      <Form onSubmit={vi.fn()} errorText="Failed" warningText="Careful" />
    );

    expect(screen.getByText("Careful")).toHaveFocus();
  });

  it("keeps the focus where it is when the message does not change", () => {
    const { rerender } = render(
      <Form onSubmit={vi.fn()} content={fields} errorText="Failed" />
    );
    const input = screen.getByRole("textbox", { name: "Name" });
    input.focus();

    rerender(<Form onSubmit={vi.fn()} content={fields} errorText="Failed" />);

    expect(input).toHaveFocus();
  });
});
