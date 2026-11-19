import { useAppFeatureFlags } from "../context/appContext";

/**
 * The name the circulation manager uses for the periodicals entry point.
 * A library's enabled entry points arrive as the circulation manager's own
 * internal names: ebooks are "Book" and audiobooks are "Audio", so periodical
 * issues are "Periodical".
 */
export const PERIODICALS_ENTRY_POINT = "Periodical";

/**
 * Whether the admin interface may offer periodicals.
 *
 * The circulation manager sends `showPeriodicals` in its feature flag payload.
 * That field does not exist yet -- PP-5642 adds it -- so every circulation
 * manager running today leaves it out, and a missing flag has to mean no.
 *
 * This is the only place that reads the flag. If the circulation manager ends
 * up naming or shaping the field differently, this is the function to change.
 */
export const useMayShowPeriodicals = (): boolean =>
  !!useAppFeatureFlags().showPeriodicals;

/**
 * The entry points we may offer as search filters, which is all of them unless
 * periodicals are hidden.
 */
export const useOfferedEntryPoints = (entryPoints: string[]): string[] => {
  const mayShowPeriodicals = useMayShowPeriodicals();

  return mayShowPeriodicals
    ? entryPoints
    : entryPoints.filter(
        (entryPoint) =>
          entryPoint.toLowerCase() !== PERIODICALS_ENTRY_POINT.toLowerCase()
      );
};
