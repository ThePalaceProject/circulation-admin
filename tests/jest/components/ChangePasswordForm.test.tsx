import * as React from "react";
import { installFormDataShim } from "../testUtils/formDataShim";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { renderWithProviders } from "../testUtils/withProviders";
import ConnectedChangePasswordForm, {
  ChangePasswordForm,
} from "../../../src/components/ChangePasswordForm";
// The reusable-components `Form` builds `new FormData(formElement)` on
// submit, which the unit jsdom env's undici FormData rejects; install the
// shared shim that reads the form's successful controls.
installFormDataShim();
afterEach(() => {
  jest.restoreAllMocks();
});

// Render the unconnected class so tests can pass a `changePassword` spy and
// drive props directly. A separate test below renders the connected default
// export to cover the connect wiring (mapStateToProps/mapDispatchToProps).
const renderUnconnected = (
  props: Partial<React.ComponentProps<typeof ChangePasswordForm>> = {}
) =>
  render(
    <ChangePasswordForm
      isFetching={false}
      csrfToken="token"
      changePassword={jest.fn().mockResolvedValue(undefined)}
      {...props}
    />
  );

const passwordInput = (container: HTMLElement) =>
  container.querySelector('input[name="password"]') as HTMLInputElement;
const confirmInput = (container: HTMLElement) =>
  container.querySelector('input[name="confirm_password"]') as HTMLInputElement;

describe("ChangePasswordForm", () => {
  it("shows an error message when there is a fetch error", () => {
    const { container, rerender } = renderUnconnected();
    expect(container.querySelector(".alert-danger")).not.toBeInTheDocument();

    rerender(
      <ChangePasswordForm
        isFetching={false}
        csrfToken="token"
        changePassword={jest.fn()}
        fetchError={{ status: 500, response: "response", url: "" }}
      />
    );

    expect(container.querySelector(".alert-danger")).toBeInTheDocument();
    expect(screen.getByText("Error: response")).toBeInTheDocument();
  });

  it("shows a loading indicator while fetching", () => {
    const { rerender } = renderUnconnected({ isFetching: false });
    expect(screen.queryByText("Loading")).not.toBeInTheDocument();

    rerender(
      <ChangePasswordForm
        isFetching={true}
        csrfToken="token"
        changePassword={jest.fn()}
      />
    );

    expect(screen.getByText("Loading")).toBeInTheDocument();
  });

  it("renders the two labeled password inputs", () => {
    const { container } = renderUnconnected();

    expect(passwordInput(container)).toHaveAttribute("type", "password");
    expect(confirmInput(container)).toHaveAttribute("type", "password");

    const labels = container.querySelectorAll("label.control-label");
    expect(labels[0]).toHaveTextContent("New Password");
    expect(labels[1]).toHaveTextContent("Confirm New Password");
  });

  it("does not submit a blank form", async () => {
    const user = userEvent.setup();
    const changePassword = jest.fn().mockResolvedValue(undefined);
    renderUnconnected({ changePassword });

    await user.click(screen.getByRole("button", { name: "Submit" }));

    expect(changePassword).not.toHaveBeenCalled();
    expect(screen.getByText("Fields cannot be blank.")).toBeInTheDocument();
  });

  // Rendered fresh, so the error message asserted below can only have come from
  // this partial submit rather than lingering from an earlier blank one.
  it("does not submit a partially blank form", async () => {
    const user = userEvent.setup();
    const changePassword = jest.fn().mockResolvedValue(undefined);
    const { container } = renderUnconnected({ changePassword });
    expect(screen.queryByText("Fields cannot be blank.")).toBeNull();

    // Only the first field filled.
    await user.type(passwordInput(container), "newPassword");
    await user.click(screen.getByRole("button", { name: "Submit" }));

    expect(changePassword).not.toHaveBeenCalled();
    expect(screen.getByText("Fields cannot be blank.")).toBeInTheDocument();
  });

  it("does not submit when the passwords do not match", async () => {
    const user = userEvent.setup();
    const changePassword = jest.fn().mockResolvedValue(undefined);
    const { container } = renderUnconnected({ changePassword });

    await user.type(passwordInput(container), "newPassword");
    await user.type(confirmInput(container), "somethingElse");
    await user.click(screen.getByRole("button", { name: "Submit" }));

    expect(changePassword).not.toHaveBeenCalled();
    expect(screen.getByText("Passwords do not match.")).toBeInTheDocument();
  });

  it("submits the new password and shows a success message", async () => {
    const user = userEvent.setup();
    const changePassword = jest.fn().mockResolvedValue(undefined);
    const { container } = renderUnconnected({ changePassword });

    await user.type(passwordInput(container), "newPassword");
    await user.type(confirmInput(container), "newPassword");
    await user.click(screen.getByRole("button", { name: "Submit" }));

    expect(changePassword).toHaveBeenCalledTimes(1);
    const submittedData = changePassword.mock.calls[0][0];
    expect(submittedData.get("password")).toBe("newPassword");
    expect(submittedData.get("confirm_password")).toBe("newPassword");

    expect(
      await screen.findByText("Password changed successfully")
    ).toBeInTheDocument();
  });

  it("dispatches the password change through the connected store", async () => {
    const user = userEvent.setup();
    const fetchSpy = jest
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response("ok", { status: 200 }));

    const { container } = renderWithProviders(
      <ConnectedChangePasswordForm csrfToken="token" />
    );

    await user.type(passwordInput(container), "newPassword");
    await user.type(confirmInput(container), "newPassword");
    await user.click(screen.getByRole("button", { name: "Submit" }));

    expect(
      await screen.findByText("Password changed successfully")
    ).toBeInTheDocument();
    expect(fetchSpy).toHaveBeenCalledWith(
      "/admin/change_password",
      expect.objectContaining({ method: "POST" })
    );
  });
});
