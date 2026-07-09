import * as React from "react";
import { render, screen } from "@testing-library/react";

import ClassificationsTable from "../../../src/components/ClassificationsTable";
import classificationsData from "../../../src/components/__tests__/classificationsData";

// Mirrors ClassificationsTable's own `readableType`: it strips the genres URL
// prefix so the displayed type is human-readable.
const readableType = (type: string) =>
  type.replace(
    /http:\/\/librarysimplified\.org\/terms\/genres\/([^/]+)\//,
    "$1"
  );

describe("ClassificationsTable", () => {
  describe("rendering", () => {
    it("should show header", () => {
      render(<ClassificationsTable classifications={classificationsData} />);

      expect(
        screen.getByRole("heading", {
          level: 3,
          name: "Related Classifications",
        })
      ).toBeInTheDocument();
    });

    it("should show column headers", () => {
      render(<ClassificationsTable classifications={classificationsData} />);

      const headers = screen.getAllByRole("columnheader");
      expect(headers.map((header) => header.textContent)).toStrictEqual([
        "Type",
        "Name",
        "Source",
        "Weight",
      ]);
    });

    it("should show one row for each classification", () => {
      const { container } = render(
        <ClassificationsTable classifications={classificationsData} />
      );

      const rows = container.querySelectorAll("tbody tr");
      expect(rows).toHaveLength(classificationsData.length);
      rows.forEach((row, i) => {
        const cells = row.querySelectorAll("td");
        const c = classificationsData[i];
        expect(cells[0].textContent).toBe(readableType(c.type));
        expect(cells[1].textContent).toBe(c.name);
        expect(cells[2].textContent).toBe(c.source);
        expect(parseInt(cells[3].textContent, 10)).toBe(c.weight);
      });
    });
  });
});
