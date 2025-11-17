import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";

const App = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={user ? <DashboardPage /> : <Navigate to="/login" replace />} />
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route path="/register" element={user ? <Navigate to="/" replace /> : <RegisterPage />} />
    </Routes>
  );
};

export default App;

