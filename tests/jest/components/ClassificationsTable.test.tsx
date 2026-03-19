import * as React from "react";
import { render } from "@testing-library/react";
import ClassificationsTable from "../../../src/components/book/ClassificationsTable";
import classificationsData from "../classificationsData";

describe("ClassificationsTable", () => {
  describe("rendering", () => {
    it("shows a 'Related Classifications' header", () => {
      const { getByRole } = render(
        <ClassificationsTable classifications={classificationsData} />
      );
      expect(
        getByRole("heading", { name: "Related Classifications" })
      ).toBeInTheDocument();
    });

    it("shows the correct column headers", () => {
      const { getAllByRole } = render(
        <ClassificationsTable classifications={classificationsData} />
      );
      const headers = getAllByRole("columnheader").map((th) => th.textContent);
      expect(headers).toEqual(["Type", "Name", "Source", "Weight"]);
    });

    it("shows one row for each classification", () => {
      const { getAllByRole } = render(
        <ClassificationsTable classifications={classificationsData} />
      );
      // getAllByRole("row") includes the header row
      const dataRows = getAllByRole("row").slice(1);
      expect(dataRows).toHaveLength(classificationsData.length);
    });

    it("shows correct type, name, source, and weight for each row", () => {
      const { getAllByRole } = render(
        <ClassificationsTable classifications={classificationsData} />
      );
      const dataRows = getAllByRole("row").slice(1);

      classificationsData.forEach((c, i) => {
        const cells = dataRows[i].querySelectorAll("td");
        // readableType strips librarysimplified genre URL prefix
        const expectedType = c.type.replace(
          /http:\/\/librarysimplified\.org\/terms\/genres\/([^/]+)\//,
          "$1"
        );
        expect(cells[0].textContent).toBe(expectedType);
        expect(cells[1].textContent).toBe(c.name);
        expect(cells[2].textContent).toBe(c.source);
        expect(parseInt(cells[3].textContent!, 10)).toBe(c.weight);
      });
    });
  });
});
