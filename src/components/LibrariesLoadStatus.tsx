import * as React from "react";
import { AllLibrariesData } from "../interfaces";

export type LibrariesLoadStatusProps = AllLibrariesData;

/**
 * Live status line for the sitewide library list load. It stays mounted so
 * that the settled text is a content change, which screen readers announce
 * (content present at mount is not announced). The settled text is
 * visually hidden; the surrounding UI shows the outcome. On the failure
 * paths the text empties instead: the adjacent Alert renders role="alert"
 * and announces the outcome itself, so a status text there would be read
 * twice. This region covers the one transition nothing else announces,
 * loading to cleanly loaded.
 */
export default function LibrariesLoadStatus({
  allLibraries,
  allLibrariesError,
  allLibrariesRefreshError,
}: LibrariesLoadStatusProps): JSX.Element {
  const loading = !allLibraries;
  return (
    <p role="status" className={loading ? undefined : "visuallyHidden"}>
      {loading
        ? "Loading libraries..."
        : allLibrariesError || allLibrariesRefreshError
          ? ""
          : "Libraries loaded."}
    </p>
  );
}
