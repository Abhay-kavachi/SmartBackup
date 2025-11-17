import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useCallback, useContext, useMemo, useState } from "react";
const AuthContext = createContext({
    user: null,
    token: null,
    login: () => undefined,
    logout: () => undefined,
});
export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(() => localStorage.getItem("smartbackup_token"));
    const [user, setUser] = useState(() => {
        const stored = localStorage.getItem("smartbackup_user");
        return stored ? JSON.parse(stored) : null;
    });
    const login = useCallback((newToken, newUser) => {
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
    return _jsx(AuthContext.Provider, { value: value, children: children });
};
export const useAuth = () => useContext(AuthContext);
