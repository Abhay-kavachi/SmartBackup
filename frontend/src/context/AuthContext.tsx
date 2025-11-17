import { createContext, useCallback, useContext, useMemo, useState } from "react";

type User = {
  id: number;
  email: string;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  login: () => undefined,
  logout: () => undefined,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("smartbackup_token"));
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem("smartbackup_user");
    return stored ? (JSON.parse(stored) as User) : null;
  });

  const login = useCallback((newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem("smartbackup_token", newToken);
    localStorage.setItem("smartbackup_user", JSON.stringify(newUser));
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("smartbackup_token");
    localStorage.removeItem("smartbackup_user");
  }, []);

  const value = useMemo(() => ({ user, token, login, logout }), [user, token, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);

