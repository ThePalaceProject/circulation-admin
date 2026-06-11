import * as React from "react";
import { CollectionData, ProtocolData } from "../interfaces";

/** Protocol capability flags that gate a collection task button. */
type CollectionTaskFlag = "supports_import" | "supports_reap";

/**
 * Returns true when the collection is saved (has an id) and its protocol
 * advertises the given capability. Older backends that predate a capability
 * simply omit the flag, so a missing flag is treated as unsupported and the
 * associated control renders nothing — the admin and circulation manager can
 * deploy out of sync without breaking.
 */
export function protocolSupports(
  collection: CollectionData,
  protocols: ProtocolData[],
  flag: CollectionTaskFlag
): boolean {
  if (!collection?.id || !collection?.protocol) {
    return false;
  }
  const protocol = protocols.find((p) => p.name === collection.protocol);
  return !!protocol?.[flag];
}

/**
 * Extracts a human-readable message from a rejected request, falling back to
 * the supplied default when the error doesn't carry a `response` string.
 */
export function extractErrorMessage(error: unknown, fallback: string): string {
  return error && typeof error === "object" && "response" in error
    ? String((error as { response: string }).response)
    : fallback;
}

export interface CollectionTask {
  /** True while the queued action is in flight. */
  busy: boolean;
  /** The success or error message to display, or null when idle. */
  feedback: string | null;
  /** True when `feedback` describes a success rather than a failure. */
  success: boolean;
  /** Runs the action, managing busy/feedback/success state and errors. */
  run: (
    action: () => Promise<void>,
    successMessage: string,
    errorFallback: string
  ) => Promise<void>;
}

/**
 * Shared state machine for collection task buttons (import, reap, ...).
 * Tracks in-flight/feedback/success state and resets it whenever the edited
 * collection changes.
 */
export function useCollectionTask(
  collectionId?: string | number
): CollectionTask {
  const [busy, setBusy] = React.useState(false);
  const [feedback, setFeedback] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  React.useEffect(() => {
    setBusy(false);
    setFeedback(null);
    setSuccess(false);
  }, [collectionId]);

  const run = React.useCallback(
    async (
      action: () => Promise<void>,
      successMessage: string,
      errorFallback: string
    ): Promise<void> => {
      setBusy(true);
      setFeedback(null);
      try {
        await action();
        setBusy(false);
        setFeedback(successMessage);
        setSuccess(true);
      } catch (e) {
        setBusy(false);
        setFeedback(extractErrorMessage(e, errorFallback));
        setSuccess(false);
      }
    },
    []
  );

  return { busy, feedback, success, run };
}
