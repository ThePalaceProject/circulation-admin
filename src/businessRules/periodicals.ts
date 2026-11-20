import { useAppFeatureFlags } from "../context/appContext";

/**
 * The name the circulation manager uses for the periodicals entry point.
 * A library's enabled entry points arrive as the circulation manager's own
 * internal names: ebooks are "Book" and audiobooks are "Audio", so periodical
 * issues are "Periodical", after its PeriodicalsEntryPoint.
 */
export const PERIODICALS_ENTRY_POINT = "Periodical";

/**
 * Whether the admin interface may offer periodicals.
 *
 * The circulation manager sends `showPeriodicals` in its feature flag payload,
 * from a sitewide setting an operator turns on with PALACE_PERIODICALS_ENABLED.
 * A circulation manager older than that setting sends nothing at all, so a
 * missing flag means no.
 *
 * This is the only place that reads the flag.
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
