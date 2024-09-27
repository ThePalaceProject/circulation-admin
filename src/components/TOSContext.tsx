import * as React from "react";

export type TOSContextProviderProps = {
  [key: number]: string;
};

export const TOSContext = React.createContext<TOSContextProviderProps>(null);
export const TOSContextProvider = TOSContext.Provider;
