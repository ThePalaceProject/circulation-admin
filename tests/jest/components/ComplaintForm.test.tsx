import * as React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react";

import ComplaintForm from "../../../src/components/book/ComplaintForm";

const COMPLAINT_TYPES = [
  "",
  "cannot-issue-loan",
  "cannot-render",
  "wrong-title",
  "wrong-author",
  "wrong-audience",
  "cannot-fulfill-loan",
  "bad-description",
  "cannot-return",
  "bad-cover-image",
  "wrong-medium",
  "wrong-age-range",
  "wrong-genre",
];

const COMPLAINT_LABELS = [
  "Complaint type",
  "Cannot issue loan",
  "Cannot render",
  "Wrong title",
  "Wrong author",
  "Wrong audience",
  "Cannot fulfill loan",
  "Bad description",
  "Cannot return",
  "Bad cover image",
  "Wrong medium",
  "Wrong age range",
  "Wrong genre",
];

function renderForm(
  overrides: Partial<React.ComponentProps<typeof ComplaintForm>> = {}
) {
  const postComplaint = jest.fn().mockResolvedValue(undefined);
  const refreshComplaints = jest.fn();
  const utils = render(
    <ComplaintForm
      disabled={false}
      complaintUrl="complaint url"
      postComplaint={postComplaint}
      refreshComplaints={refreshComplaints}
      {...overrides}
    />
  );
  return { ...utils, postComplaint, refreshComplaints };
}

// ── rendering ────────────────────────────────────────────────────────────────

describe("ComplaintForm rendering", () => {
  it("shows a select field", () => {
    const { container } = renderForm();
    const select = container.querySelector("select");
    expect(select).toBeTruthy();
  });

  it("default selected option is 'Complaint type'", () => {
    const { container } = renderForm();
    const options = container.querySelectorAll("option");
    expect(options[0].textContent).toBe("Complaint type");
    expect(options[0].getAttribute("value")).toBe("");
  });

  it("shows all complaint type option values", () => {
    const { container } = renderForm();
    const options = Array.from(container.querySelectorAll("option"));
    const values = options.map((o) => o.getAttribute("value") ?? o.value);
    expect(values).toEqual(COMPLAINT_TYPES);
  });

  it("formats complaint type option labels", () => {
    const { container } = renderForm();
    const options = Array.from(container.querySelectorAll("option"));
    const labels = options.map((o) => o.textContent);
    expect(labels).toEqual(COMPLAINT_LABELS);
  });

  it("shows a submit button", () => {
    const { container } = renderForm();
    const button = container.querySelector("button[type='submit']");
    expect(button).toBeTruthy();
  });

  it("disables select and button when disabled prop is true", () => {
    const { container } = renderForm({ disabled: true });
    const select = container.querySelector("select");
    const button = container.querySelector("button[type='submit']");
    expect(select).toBeDisabled();
    expect(button).toBeDisabled();
  });
});

// ── behaviour ────────────────────────────────────────────────────────────────
//
// jest-fixed-jsdom replaces window.FormData with Node's native FormData which
// does NOT support new FormData(htmlFormElement). The Form UI component falls
// back to calling onSubmit(undefined) when the constructor throws.
//
// To bypass this limitation we call the component's `post()` method directly
// via a React ref — exactly mirroring the Mocha pattern of
//   form.prop("onSubmit")(new FormData(form.getDOMNode()))

function renderFormWithRef(
  overrides: Partial<React.ComponentProps<typeof ComplaintForm>> = {}
) {
  const ref = React.createRef<ComplaintForm>();
  const postComplaint = jest.fn().mockResolvedValue(undefined);
  const refreshComplaints = jest.fn();
  const utils = render(
    <ComplaintForm
      ref={ref}
      disabled={false}
      complaintUrl="complaint url"
      postComplaint={postComplaint}
      refreshComplaints={refreshComplaints}
      {...overrides}
    />
  );
  return { ...utils, ref, postComplaint, refreshComplaints };
}

function makeFormData(type: string) {
  const fd = new FormData();
  fd.append("type", type);
  return fd;
}

describe("ComplaintForm behaviour", () => {
  it("posts complaint with correct URL and type", () => {
    const { ref, postComplaint } = renderFormWithRef();
    ref.current!.post(makeFormData("bad-description"));

    expect(postComplaint).toHaveBeenCalledTimes(1);
    expect(postComplaint.mock.calls[0][0]).toBe("complaint url");
    expect(postComplaint.mock.calls[0][1].type).toBe(
      "http://librarysimplified.org/terms/problem/bad-description"
    );
  });

  it("refreshes complaints after successful post", async () => {
    const { ref, refreshComplaints } = renderFormWithRef();
    ref.current!.post(makeFormData("bad-description"));

    await waitFor(() => {
      expect(refreshComplaints).toHaveBeenCalledTimes(1);
    });
  });

  it("shows error when no type is selected", () => {
    const { ref, container } = renderFormWithRef();
    ref.current!.post(makeFormData(""));

    const error = container.querySelector(".alert-danger");
    expect(error).toBeTruthy();
    expect(error!.textContent).toBe("You must select a complaint type!");
  });

  it("shows error when post fails", async () => {
    const postComplaint = jest.fn().mockRejectedValue(new Error("fail"));
    const { ref, container } = renderFormWithRef({ postComplaint });
    ref.current!.post(makeFormData("bad-description"));

    await waitFor(() => {
      const error = container.querySelector(".alert-danger");
      expect(error).toBeTruthy();
      expect(error!.textContent).toBe("Couldn't post complaint.");
    });
  });

  it("shows post error state via showPostError()", () => {
    const { ref, container } = renderFormWithRef();
    ref.current!.showPostError();

    const error = container.querySelector(".alert-danger");
    expect(error).toBeTruthy();
    expect(error!.textContent).toBe("Couldn't post complaint.");
  });

  it("clears form after successful post", async () => {
    const { ref, container } = renderFormWithRef();
    // Set a value on the select DOM node first
    const select = container.querySelector("select") as HTMLSelectElement;
    fireEvent.change(select, { target: { value: "bad-description" } });
    expect(select.value).toBe("bad-description");

    ref.current!.post(makeFormData("bad-description"));

    await waitFor(() => {
      // After clear(), EditableInput.clear() resets the select value to ""
      expect(select.value).toBe("");
    });
  });
});
