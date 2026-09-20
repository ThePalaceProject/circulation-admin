import * as React from "react";
import { Alert } from "react-bootstrap";
import { FetchErrorData } from "@thepalaceproject/web-opds-client/lib/interfaces";

export interface LibrariesRefreshWarningProps {
  allLibrariesRefreshError?: FetchErrorData;
  detail?: string;
}

/**
 * Warning that the sitewide library list is being served from its last
 * loaded copy because a refresh failed. Renders nothing while there is no
 * refresh error. `detail` appends a panel-specific consequence to the
 * shared wording.
 */
export default function LibrariesRefreshWarning({
  allLibrariesRefreshError,
  detail,
}: LibrariesRefreshWarningProps): JSX.Element | null {
  if (!allLibrariesRefreshError) {
    return null;
  }
  return (
    <Alert bsStyle="warning">
      The library list could not be refreshed. Showing the last loaded list,
      which may be out of date.
      {detail ? ` ${detail}` : ""}
    </Alert>
  );
}
