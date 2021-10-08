import * as React from "react";
import Admin from "../models/Admin";
import { Store } from "redux";
import { State } from "../reducers/index";

export const ListManagerContext = React.createContext(null);

export interface ListManagerProviderProps {
  children?: JSX.Element[];
  roles?: {
    role: string;
    library?: string;
  }[];
  email?: string;
  csrfToken: string;
  editorStore: Store<State>;
}

export const ListManagerProvider: React.FC = ({
  children,
  roles,
  email,
  csrfToken,
  editorStore,
}: ListManagerProviderProps) => {
  const admin = new Admin(roles || [], email || null);
  return (
    <ListManagerContext.Provider value={{ admin, csrfToken, editorStore }}>
      {children}
    </ListManagerContext.Provider>
  );
};
