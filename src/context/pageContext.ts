import { createContext, useContext } from "react";

/** Values that a page gives to the components it renders, such as the header
 *  and, in the catalog, the book details. */
export type PageContextType = {
  /** The short name of the page's library. Leave it out on a page that is not
   *  for one library, such as the system configuration page. */
  library?: string;
  /** The book details tab to show. */
  tab?: string;
};

// The default is an empty value, not an error, because a page that is not for
// one library does not need a provider.
const PageContext = createContext<PageContextType>({});

export const PageContextProvider = PageContext.Provider;

export const usePageLibrary = (): string | undefined =>
  useContext(PageContext).library;
export const usePageTab = (): string | undefined => useContext(PageContext).tab;
