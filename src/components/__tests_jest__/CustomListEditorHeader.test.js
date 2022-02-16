import React from "react";
import { render } from "../../testUtils/testUtils";
import CustomListEditorHeader from "../CustomListEditorHeader";
import { fireEvent } from "@testing-library/react";

const setDraftTitle = jest.fn();
const editCustomList = jest.fn();

let utils;

describe("CustomListEditorHeader", () => {
  beforeAll(() => {
    utils = render(
      <CustomListEditorHeader
        draftTitle="title"
        listId={1}
        setDraftTitle={setDraftTitle}
        editCustomList={editCustomList}
      />
    );
  });

  test("if there is a list passed, its title and id renders on the page", () => {
    const title = utils.getByRole("heading", { level: 3 });

    expect(title).toHaveTextContent("title");

    const id = utils.getByRole("heading", { level: 4 });

    // The UI prefixes the id with "ID-".
    expect(id).toHaveTextContent("ID-1");

    const titleButton = utils.getByRole("button", {
      name: "Edit list title",
    });

    expect(titleButton).toBeInTheDocument();
  });

  test("if there is no list passed, the create form is rendered", () => {
    utils = render(
      <CustomListEditorHeader
        draftTitle=""
        setDraftTitle={setDraftTitle}
        editCustomList={editCustomList}
      />
    );

    const titleInput = utils.getByRole("textbox", {
      name: "Enter a title for this list",
    });

    expect(titleInput).toHaveValue("");

    const titleButton = utils.getByRole("button", {
      name: "Save list title",
    });

    expect(titleButton).toBeInTheDocument();
  });

  test("a user can update the title", () => {
    utils = render(
      <CustomListEditorHeader
        draftTitle=""
        setDraftTitle={setDraftTitle}
        editCustomList={editCustomList}
      />
    );

    const titleInput = utils.getByRole("textbox", {
      name: "Enter a title for this list",
    });

    expect(titleInput).toHaveValue("");

    let titleButton = utils.getByRole("button", {
      name: "Save list title",
    });

    fireEvent.change(titleInput, { target: { value: "new list" } });
    fireEvent.click(titleButton);

    expect(titleInput).toHaveValue("new list");

    titleButton = utils.getByRole("button", {
      name: "Edit list title",
    });

    expect(titleButton).toBeInTheDocument();
  });
});
