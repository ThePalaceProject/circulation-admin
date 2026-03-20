import { createContext, useContext } from "react";

/** Current catalog tab from the route (e.g. details, classifications). */
export const CatalogTabContext = createContext<string | undefined>(undefined);

export const useCatalogTab = (): string | undefined =>
  useContext(CatalogTabContext);
