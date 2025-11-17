import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
const App = () => {
    const { user } = useAuth();
    return (_jsxs(Routes, { children: [_jsx(Route, { path: "/", element: user ? _jsx(DashboardPage, {}) : _jsx(Navigate, { to: "/login", replace: true }) }), _jsx(Route, { path: "/login", element: user ? _jsx(Navigate, { to: "/", replace: true }) : _jsx(LoginPage, {}) }), _jsx(Route, { path: "/register", element: user ? _jsx(Navigate, { to: "/", replace: true }) : _jsx(RegisterPage, {}) })] }));
};
export default App;
