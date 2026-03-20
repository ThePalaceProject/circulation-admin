/**
 * LibraryContext
 *
 * Replaces the legacy React `childContextTypes: { library: PropTypes.func }`
 * pattern that page-level components (CatalogPage, DashboardPage,
 * QuicksightDashboardPage, ManagePatrons, LanePage, CustomListPage) used to
 * provide the currently active library short name to the Header.
 *
 * Usage (provider):
 *   <LibraryContext.Provider value={() => libraryShortName}>
 *     {children}
 *   </LibraryContext.Provider>
 *
 * Usage (consumer via hook):
 *   const library = useLibrary();  // returns () => string | undefined
 */
import { createContext, useContext } from "react";

/** Function that returns the currently active library short name, or undefined when sitewide. */
export type LibraryFn = () => string | undefined;

export const LibraryContext = createContext<LibraryFn | undefined>(undefined);

export const useLibrary = (): LibraryFn | undefined =>
  useContext(LibraryContext);
