import * as React from "react";
import { libraryConfigHref, libraryLabel } from "../utils/sharedFunctions";

export interface LibraryConfigLinkProps {
  name?: string;
  short_name?: string;
  uuid?: string;
}

/**
 * Shows a library's "name - short name" label, linked to that library's
 * configuration page when its uuid is known.
 *
 * The link opens in a new tab so that an accidental click cannot discard
 * unsaved changes to the form the link is rendered in.
 */
export default function LibraryConfigLink({
  name,
  short_name,
  uuid,
}: LibraryConfigLinkProps): JSX.Element {
  const label = libraryLabel(name, short_name);
  const href = libraryConfigHref(uuid);
  return href ? (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${label} (opens in a new tab)`}
    >
      {label}
    </a>
  ) : (
    <>{label}</>
  );
}
