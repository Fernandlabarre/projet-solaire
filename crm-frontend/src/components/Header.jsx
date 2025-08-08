import { useContext } from "react";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";

export default function Header() {
  const { token, user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Logo clickable : va toujours sur le dashboard si connecté, sinon accueil
  const handleLogoClick = () => {
    if (token) navigate("/projects");
    else navigate("/login");
  };

  return (
    <AppBar position="fixed" sx={{ background: "#0288d1", zIndex: 1200 }}>
      <Toolbar sx={{ display: "flex", justifyContent: "space-between", minHeight: 64 }}>
        {/* Logo / App Name */}
        <Box sx={{ display: "flex", alignItems: "center", cursor: "pointer" }} onClick={handleLogoClick}>
          <Typography variant="h6" fontWeight={800} sx={{ color: "white", mr: 1 }}>
            🌞 Gestion des Projets Solaires
          </Typography>
        </Box>
        {/* Navigation boutons */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {token ? (
            <>
              <Button
                color={location.pathname === "/projects" ? "success" : "inherit"}
                variant="text"
                component={Link}
                to="/projects"
                sx={{ fontWeight: 600 }}
              >
                Dashboard
              </Button>
              <Button
  color={location.pathname === "/carte" ? "success" : "inherit"}
  variant="text"
  component={Link}
  to="/carte"
  sx={{ fontWeight: 600 }}
>
  Carte des projets
</Button>
              <Typography sx={{ mx: 2, fontWeight: 600, color: "#fff" }}>
                {user?.name}
                {user?.role === "admin" && (
                  <span style={{
                    background: "#06c270", color: "#fff",
                    fontSize: "12px", padding: "2px 8px", borderRadius: "1em",
                    marginLeft: 8, fontWeight: 600
                  }}>
                    Admin
                  </span>
                )}
              </Typography>
              <Button variant="outlined" sx={{
                color: "#fff", borderColor: "#fff",
                "&:hover": { borderColor: "#fff", background: "rgba(255,255,255,0.05)" }
              }} onClick={handleLogout}>Déconnexion</Button>
            </>
          ) : (
            <Button
              variant="contained"
              color="success"
              component={Link}
              to="/login"
              sx={{ fontWeight: 600 }}
            >
              Se connecter
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
