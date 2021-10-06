import * as React from "react";
import Admin from "../models/Admin";
import buildStore from "../store";

export const ListManagerContext = React.createContext(null);

export const ListManagerProvider: React.FC<any> = ({
  children,
  roles,
  email,
  csrfToken,
}) => {
  const admin = new Admin(roles || [], email || null);
  const editorStore = buildStore();
  return (
    <ListManagerContext.Provider value={{ admin, csrfToken, editorStore }}>
      {children}
    </ListManagerContext.Provider>
  );
};
