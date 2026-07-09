import * as React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { renderWithProviders } from "../testUtils/withProviders";
import ConnectedChangePasswordForm, {
  ChangePasswordForm,
} from "../../../src/components/ChangePasswordForm";

// The unit jsdom environment installs undici's `FormData`, which throws on
// `new FormData(formElement)`. The reusable-components `Form` builds FormData
// that way on submit, so provide a minimal shim that reads a form element's
// named controls. Restored after this suite.
class FormDataShim {
  private entries: Array<[string, string]> = [];
  constructor(form?: HTMLFormElement) {
    if (form) {
      form
        .querySelectorAll<HTMLInputElement>("input, select, textarea")
        .forEach((el) => {
          if (el.name) this.entries.push([el.name, el.value]);
        });
    }
  }
  get(key: string) {
    const found = this.entries.find(([k]) => k === key);
    return found ? found[1] : null;
  }
  append(key: string, value: string) {
    this.entries.push([key, value]);
  }
  set(key: string, value: string) {
    this.entries = this.entries.filter(([k]) => k !== key);
    this.entries.push([key, value]);
  }
}

let originalFormData: typeof FormData;
beforeAll(() => {
  originalFormData = window.FormData;
  (window as any).FormData = FormDataShim;
});
afterAll(() => {
  (window as any).FormData = originalFormData;
});
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

  it("does not submit a blank or partially blank form", async () => {
    const user = userEvent.setup();
    const changePassword = jest.fn().mockResolvedValue(undefined);
    const { container } = renderUnconnected({ changePassword });
    const submit = screen.getByRole("button", { name: "Submit" });

    // Both fields blank.
    await user.click(submit);
    expect(changePassword).not.toHaveBeenCalled();
    expect(screen.getByText("Fields cannot be blank.")).toBeInTheDocument();

    // Only the first field filled.
    await user.type(passwordInput(container), "newPassword");
    await user.click(submit);
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
