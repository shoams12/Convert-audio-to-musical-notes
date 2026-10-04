import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { getUser, removeUser, saveUser } from "../data/user";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getUser());

  const login = useCallback((newUser) => {
    saveUser(newUser);
    setUser(newUser);
  }, []);

  const logout = useCallback(() => {
    removeUser();
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, login, logout }), [user, login, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
