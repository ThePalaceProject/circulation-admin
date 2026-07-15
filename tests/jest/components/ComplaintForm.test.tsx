import * as React from "react";
import { installFormDataShim } from "../testUtils/formDataShim";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import ComplaintForm from "../../../src/components/ComplaintForm";
installFormDataShim();

// ComplaintForm's default export is a plain (unconnected) class component, so a
// bare `render` is sufficient — no providers/store/context are required.
const renderForm = (
  props: Partial<React.ComponentProps<typeof ComplaintForm>> = {}
) =>
  render(
    <ComplaintForm
      disabled={false}
      complaintUrl="complaint url"
      postComplaint={jest.fn().mockResolvedValue(undefined)}
      refreshComplaints={jest.fn()}
      {...props}
    />
  );

const getSelect = (container: HTMLElement) =>
  container.querySelector("select") as HTMLSelectElement;

describe("ComplaintForm", () => {
  describe("rendering", () => {
    it("shows a select field with a default value", () => {
      const { container } = renderForm();
      const select = getSelect(container);
      expect(select).toBeInTheDocument();
      expect(select).not.toBeDisabled();
      expect(screen.getAllByRole("option")[0]).toHaveTextContent(
        "Complaint type"
      );
    });

    it("shows complaint type options", () => {
      renderForm();
      const values = screen
        .getAllByRole("option")
        .map((option) => (option as HTMLOptionElement).value);
      expect(values).toStrictEqual([
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
      ]);
    });

    it("formats complaint type options", () => {
      renderForm();
      const texts = screen
        .getAllByRole("option")
        .map((option) => option.textContent);
      expect(texts).toStrictEqual([
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
      ]);
    });

    it("shows a submit button", () => {
      renderForm();
      expect(
        screen.getByRole("button", { name: "Submit" })
      ).toBeInTheDocument();
    });

    it("disables the select and submit button when disabled", () => {
      const { container } = renderForm({ disabled: true });
      expect(screen.getByRole("button", { name: "Submit" })).toBeDisabled();
      expect(getSelect(container)).toBeDisabled();
    });
  });

  describe("behavior", () => {
    it("posts complaints", async () => {
      const user = userEvent.setup();
      const postComplaint = jest.fn().mockResolvedValue(undefined);
      const { container } = renderForm({ postComplaint });

      await user.selectOptions(getSelect(container), "bad-description");
      await user.click(screen.getByRole("button", { name: "Submit" }));

      expect(postComplaint).toHaveBeenCalledTimes(1);
      expect(postComplaint.mock.calls[0][0]).toBe("complaint url");
      expect(postComplaint.mock.calls[0][1].type).toBe(
        "http://librarysimplified.org/terms/problem/bad-description"
      );
    });

    it("refreshes complaints after a successful post", async () => {
      const user = userEvent.setup();
      const refreshComplaints = jest.fn();
      const { container } = renderForm({
        postComplaint: jest.fn().mockResolvedValue(undefined),
        refreshComplaints,
      });

      await user.selectOptions(getSelect(container), "bad-description");
      await user.click(screen.getByRole("button", { name: "Submit" }));

      await waitFor(() => expect(refreshComplaints).toHaveBeenCalledTimes(1));
    });

    it("clears the selected complaint type after a successful post", async () => {
      const user = userEvent.setup();
      const { container } = renderForm({
        postComplaint: jest.fn().mockResolvedValue(undefined),
      });

      const select = getSelect(container);
      await user.selectOptions(select, "bad-description");
      expect(select).toHaveValue("bad-description");

      await user.click(screen.getByRole("button", { name: "Submit" }));

      await waitFor(() => expect(getSelect(container)).toHaveValue(""));
    });

    it("displays an error if no type is selected", async () => {
      const user = userEvent.setup();
      const postComplaint = jest.fn().mockResolvedValue(undefined);
      renderForm({ postComplaint });

      await user.click(screen.getByRole("button", { name: "Submit" }));

      expect(
        await screen.findByText("You must select a complaint type!")
      ).toBeInTheDocument();
      expect(screen.getByRole("alert")).toHaveTextContent(
        "You must select a complaint type!"
      );
      expect(postComplaint).not.toHaveBeenCalled();
    });

    it("shows an error message if the post fails", async () => {
      const user = userEvent.setup();
      const postComplaint = jest.fn().mockRejectedValue(new Error("nope"));
      const { container } = renderForm({ postComplaint });

      await user.selectOptions(getSelect(container), "bad-description");
      await user.click(screen.getByRole("button", { name: "Submit" }));

      expect(
        await screen.findByText("Couldn't post complaint.")
      ).toBeInTheDocument();
    });
  });
});
