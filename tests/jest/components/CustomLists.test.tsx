import * as React from "react";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";
import CustomLists from "../../../src/components/CustomLists";
import renderWithContext from "../testUtils/renderWithContext";
import buildStore from "../../../src/store";

describe("CustomLists", () => {
  // Stub scrollTo, since a component in the render tree will try to call it, and it is not
  // provided by JSDOM.
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  Element.prototype.scrollTo = () => {};

  const server = setupServer(
    http.get("*/search", () => HttpResponse.xml("<feed />")),
    http.get("*", () => HttpResponse.json({}))
  );

  beforeAll(() => {
    server.listen();
  });

  afterAll(() => {
    server.close();
  });

  it("adds filters when new filter values are entered", async () => {
    const user = userEvent.setup();

    const contextProviderProps = {
      csrfToken: "",
      roles: [{ role: "system" }],
    };

    renderWithContext(
      <CustomLists
        csrfToken=""
        editOrCreate="create"
        library="testlib"
        store={buildStore()}
      />,
      contextProviderProps
    );

    await user.click(screen.getByRole("textbox", { name: "filter value" }));
    await user.keyboard("horror{enter}");

    const items = screen.getAllByRole("treeitem");

    expect(items).toHaveLength(1);
    expect(items[0]).toHaveTextContent(/genre = horror/);

    await user.click(screen.getByRole("textbox", { name: "filter value" }));
    await user.keyboard("science fiction{enter}");

    const newItems = screen.getAllByRole("treeitem");

    expect(newItems).toHaveLength(3);
    expect(newItems[0]).toHaveTextContent(
      /all of these filters must be matched/i
    );
    expect(newItems[1]).toHaveTextContent(/genre = horror/i);
    expect(newItems[2]).toHaveTextContent(/genre = science fiction/i);
  });

  it("replaces the existing filters when adding a new filter when the clear filters checkbox is checked", async () => {
    const user = userEvent.setup();

    const contextProviderProps = {
      csrfToken: "",
      roles: [{ role: "system" }],
    };

    renderWithContext(
      <CustomLists
        csrfToken=""
        editOrCreate="create"
        library="testlib"
        store={buildStore()}
      />,
      contextProviderProps
    );

    await user.click(screen.getByRole("textbox", { name: "filter value" }));
    await user.keyboard("horror{enter}");

    let items = screen.getAllByRole("treeitem");

    expect(items).toHaveLength(1);
    expect(items[0]).toHaveTextContent(/genre = horror/);

    await user.click(screen.getByRole("textbox", { name: "filter value" }));
    await user.keyboard("science fiction{enter}");

    items = screen.getAllByRole("treeitem");
    expect(items).toHaveLength(3);

    await user.click(screen.getByRole("checkbox", { name: /clear filters/i }));

    await user.click(screen.getByRole("textbox", { name: "filter value" }));
    await user.keyboard("fantasy{enter}");

    items = screen.getAllByRole("treeitem");
    expect(items).toHaveLength(1);
  });

  it("sends the language=all search parameter", async () => {
    let searchParams = null;

    server.use(
      http.get("*/search", ({ request }) => {
        const url = new URL(request.url);
        searchParams = url.searchParams;
        return HttpResponse.xml("<feed />");
      })
    );

    const user = userEvent.setup();

    const contextProviderProps = {
      csrfToken: "",
      roles: [{ role: "system" }],
    };

    renderWithContext(
      <CustomLists
        csrfToken=""
        editOrCreate="create"
        library="testlib"
        store={buildStore()}
      />,
      contextProviderProps
    );

    await user.click(screen.getByRole("textbox", { name: "filter value" }));
    await user.keyboard("horror{enter}");

    await waitFor(() => {
      expect(searchParams.get("language")).toEqual("all");

      expect(JSON.parse(searchParams.get("q"))).toEqual({
        query: {
          key: "genre",
          value: "horror",
        },
      });
    });
  });

  it("sends the language=all search parameter when a language filter is added, and places the language filter in the q parameter", async () => {
    let searchParams = null;

    server.use(
      http.get("*/search", ({ request }) => {
        const url = new URL(request.url);
        searchParams = url.searchParams;
        return HttpResponse.xml("<feed />");
      })
    );

    const user = userEvent.setup();

    const contextProviderProps = {
      csrfToken: "",
      roles: [{ role: "system" }],
    };

    renderWithContext(
      <CustomLists
        csrfToken=""
        editOrCreate="create"
        library="testlib"
        store={buildStore()}
      />,
      contextProviderProps
    );

    await user.click(screen.getByRole("radio", { name: "language" }));
    await user.click(screen.getByRole("textbox", { name: "filter value" }));
    await user.keyboard("french{enter}");

    await waitFor(() => {
      expect(searchParams.get("language")).toEqual("all");

      expect(JSON.parse(searchParams.get("q"))).toEqual({
        query: {
          key: "language",
          value: "french",
        },
      });
    });
  });
});
