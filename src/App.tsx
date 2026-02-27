import { Navigate, Route, Routes } from "react-router-dom";
import Alerts from "./pages/Alerts";
import CreditReport from "./pages/CreditReport";
import Dashboard from "./pages/Dashboard";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import ScoreSimulator from "./pages/ScoreSimulator";
import Settings from "./pages/Settings";
import SignUp from "./pages/SignUp";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/sign-up" element={<SignUp />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/credit-report" element={<CreditReport />} />
      <Route path="/alerts" element={<Alerts />} />
      <Route path="/score-simulator" element={<ScoreSimulator />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
