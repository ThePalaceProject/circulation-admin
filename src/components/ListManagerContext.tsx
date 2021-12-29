import * as React from "react";
import Admin from "../models/Admin";
import { Store } from "redux";
import { State } from "../reducers/index";

export const ListManagerContext = React.createContext(null);

export interface ListManagerProviderProps {
  children?: JSX.Element[] | JSX.Element;
  roles?: {
    role: string;
    library?: string;
  }[];
  email?: string;
  csrfToken?: string;
  editorStore?: Store<State>;
  library?: any;
}

export function ListManagerProvider({
  children,
  roles,
  email,
  csrfToken,
  editorStore,
  library,
}: ListManagerProviderProps): JSX.Element {
  const admin = new Admin(roles || [], email || null);
  const [entryCountInContext, setEntryCountInContext] = React.useState({});

  return (
    <ListManagerContext.Provider
      value={{
        entryCountInContext,
        setEntryCountInContext,
        admin,
        csrfToken,
        editorStore,
        library,
      }}
    >
      {children}
    </ListManagerContext.Provider>
  );
}
