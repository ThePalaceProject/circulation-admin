import * as React from "react";
import { LibraryData } from "../interfaces";
import { FetchErrorData } from "@thepalaceproject/web-opds-client/lib/interfaces";

export interface LibrariesLoadStatusProps {
  allLibraries?: LibraryData[];
  allLibrariesError?: FetchErrorData;
}

/**
 * Live status line for the sitewide library list load. It stays mounted so
 * that the settled text is a content change, which screen readers announce
 * (content present at mount is not announced). The settled text is visually
 * hidden; the surrounding UI shows the outcome.
 */
export default function LibrariesLoadStatus({
  allLibraries,
  allLibrariesError,
}: LibrariesLoadStatusProps): JSX.Element {
  const loading = !allLibraries;
  return (
    <p role="status" className={loading ? undefined : "visuallyHidden"}>
      {loading
        ? "Loading libraries..."
        : allLibrariesError
          ? "Libraries failed to load."
          : "Libraries loaded."}
    </p>
  );
}
