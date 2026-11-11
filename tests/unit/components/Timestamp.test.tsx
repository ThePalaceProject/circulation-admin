import * as React from "react";
import { render, screen } from "@testing-library/react";

import Timestamp from "../../../src/components/Timestamp";

describe("Timestamp", () => {
  const timestamp = {
    service: "test_service",
    id: "1",
    start: "start_time_string",
    duration: "60",
    collection_name: "collection1",
  };

  describe("rendering", () => {
    it("renders a success panel that is not collapsible", () => {
      const { container } = render(<Timestamp timestamp={timestamp} />);

      expect(container.querySelector(".panel-success")).toBeInTheDocument();
      expect(container.querySelector(".panel-danger")).not.toBeInTheDocument();
      // A non-collapsible panel is a static panel with no toggle button.
      expect(container.querySelector(".static-panel")).toBeInTheDocument();
      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });

    it("renders the start time", () => {
      const { container } = render(<Timestamp timestamp={timestamp} />);

      expect(container.querySelector(".panel-title")).toHaveTextContent(
        "start_time_string"
      );
    });

    it("renders the duration", () => {
      const { container } = render(<Timestamp timestamp={timestamp} />);

      expect(container.querySelectorAll("ul li")).toHaveLength(1);
      expect(screen.getByText("Duration: 60 seconds")).toBeInTheDocument();
    });
  });

  describe("rendering with achievements", () => {
    it("renders achievements", () => {
      const { container } = render(
        <Timestamp timestamp={{ ...timestamp, achievements: "Ran a script" }} />
      );

      expect(container.querySelectorAll("ul li")).toHaveLength(2);
      const achievements = container.querySelector(".well pre");
      expect(achievements).toBeInTheDocument();
      expect(achievements).toHaveTextContent("Ran a script");
    });
  });

  describe("rendering with exception", () => {
    it("determines style based on whether there is an exception", () => {
      const { container } = render(
        <Timestamp timestamp={{ ...timestamp, exception: "Stack trace" }} />
      );

      expect(container.querySelector(".panel-danger")).toBeInTheDocument();
    });

    it("renders an exception", () => {
      const { container } = render(
        <Timestamp timestamp={{ ...timestamp, exception: "Stack trace" }} />
      );

      const exception = container.querySelector(".exception pre");
      expect(exception).toBeInTheDocument();
      expect(exception).toHaveTextContent("Stack trace");
    });
  });
});
