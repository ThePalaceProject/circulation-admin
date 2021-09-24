import * as React from "react";
import Admin from "../models/Admin";

export const ListManagerContext = React.createContext(null);

export const ListManagerProvider: React.FC<any> = ({
  children,
  roles,
  email,
}) => {
  const admin = new Admin(roles || [], email || null);
  return (
    <ListManagerContext.Provider value={admin}>
      {children}
    </ListManagerContext.Provider>
  );
};
