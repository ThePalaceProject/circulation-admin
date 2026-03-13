import * as React from "react";
import { render } from "@testing-library/react";
import Timestamp from "../../../src/components/shared/Timestamp";

const ts = {
  service: "test_service",
  id: "1",
  start: "start_time_string",
  duration: "60",
  collection_name: "collection1",
};

describe("Timestamp", () => {
  describe("rendering", () => {
    it("renders the start time in the panel title", () => {
      const { container } = render(<Timestamp timestamp={ts} />);
      const title = container.querySelector(".panel-title");
      expect(title).toBeInTheDocument();
      expect(title.textContent).toBe("start_time_string");
    });

    it("renders the duration", () => {
      const { container } = render(<Timestamp timestamp={ts} />);
      const items = container.querySelectorAll("ul li");
      expect(items.length).toBe(1);
      expect(items[0].textContent).toBe("Duration: 60 seconds");
    });
  });

  describe("rendering with achievements", () => {
    it("renders achievements in a pre element", () => {
      const tsWithAchievements = { ...ts, achievements: "Ran a script" };
      const { container } = render(
        <Timestamp timestamp={tsWithAchievements} />
      );
      const items = container.querySelectorAll("ul li");
      expect(items.length).toBe(2);
      const pre = container.querySelector(".well pre");
      expect(pre).toBeInTheDocument();
      expect(pre.textContent).toContain("Ran a script");
    });
  });

  describe("rendering with exception", () => {
    it("renders exception in pre element", () => {
      const tsWithException = { ...ts, exception: "Stack trace" };
      const { container } = render(<Timestamp timestamp={tsWithException} />);
      const pre = container.querySelector(".exception pre");
      expect(pre).toBeInTheDocument();
      expect(pre.textContent).toBe("Stack trace");
    });

    it("uses danger style when exception is present", () => {
      const tsWithException = { ...ts, exception: "Stack trace" };
      const { container } = render(<Timestamp timestamp={tsWithException} />);
      // Panel with danger style adds panel-danger class
      expect(container.querySelector(".panel-danger")).toBeInTheDocument();
    });
  });
});
