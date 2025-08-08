// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import ProjectDetail from "./pages/ProjectDetail";
import { useContext } from "react";
import { AuthContext } from "./contexts/AuthContext";
import { Box } from "@mui/material";
import CarteDesProjets from "./pages/CarteDesProjets";
import ProjectList from "./pages/ProjectList";
 import PublicSuiviPage from './pages/PublicSuiviPage';
import InvestorList from "./pages/InvestorList";

function App() {
  const { token } = useContext(AuthContext);

  return (
    <BrowserRouter>
      {/* Décale tout le contenu sous le header (AppBar) */}
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/projects" element={token ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/projects/:id" element={token ? <ProjectDetail /> : <Navigate to="/login" />} />
        <Route path="*" element={<Navigate to="/projects" />} />
        <Route path="/carte" element={token ? <CarteDesProjets /> : <Navigate to="/login" />} />
        <Route path="/projects-list" element={<ProjectList />} />
        <Route path="/investors-list" element={<InvestorList />} />
        <Route path="/public/suivi/:token" element={<PublicSuiviPage />} />


      </Routes>
    </BrowserRouter>
  );
}

export default App;
