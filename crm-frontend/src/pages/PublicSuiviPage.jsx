// src/pages/PublicSuiviPage.jsx
import { useEffect, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import api from "../api/axios";
import {
  Box,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Chip,
  Divider,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Paper,
} from "@mui/material";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

const drawerWidth = 300;

export default function PublicSuiviPage() {
  const { token } = useParams();
  const [projectData, setProjectData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  useEffect(() => {
    api
      .get(`/public/projects/${token}`)
      .then((res) => setProjectData(res.data))
      .catch(() => setError("Lien invalide ou expiré"))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", height: "100vh", justifyContent: "center", alignItems: "center" }}>
        <CircularProgress />
      </Box>
    );
  }
  if (error) return <Typography color="error" align="center" sx={{ mt: 4 }}>{error}</Typography>;
  if (!projectData) return <Navigate to="/" replace />;

  const {
    name,
    address,
    latitude,
    longitude,
    type,
    power,
    phone,
    email,
    status,
    comments,
    steps = [],
    custom_fields = [],
  } = projectData;

  const InfoPanel = (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>{name}</Typography>
      <Divider sx={{ mb: 2 }} />

      <List dense>
        <ListItem>
          <ListItemText primary="Adresse" secondary={address} />
        </ListItem>
        <ListItem>
          <ListItemText primary="Type" secondary={type} />
        </ListItem>
        <ListItem>
          <ListItemText primary="Puissance" secondary={`${power} kWc`} />
        </ListItem>
        <ListItem>
          <ListItemText
            primary="Statut"
            secondary={
              <Chip
                label={status}
                size="small"
                sx={{ bgcolor: theme.palette.info.light, color: theme.palette.info.contrastText }}
              />
            }
          />
        </ListItem>

        <Divider sx={{ my: 1.5 }} />

        <ListItem>
          <ListItemText primary="Commentaires" secondary={comments || "— Aucun commentaire —"} />
        </ListItem>

        <Divider sx={{ my: 1.5 }} />

        <ListItem>
          <ListItemText
            primary="Contact"
            secondary={
              <>
                <Typography variant="body2">Tél. : {phone || "—"}</Typography>
                <Typography variant="body2">Email : {email || "—"}</Typography>
              </>
            }
          />
        </ListItem>

        <Divider sx={{ my: 1.5 }} />

        <Typography variant="subtitle1" sx={{ px: 2, mb: 1 }}>
          Champs personnalisés
        </Typography>
        {custom_fields.length > 0 ? (
          custom_fields.map((f) => (
            <Chip
              key={f.id}
              label={`${f.field_name} : ${f.field_value}`}
              variant="outlined"
              sx={{ mb: 1, mx: 2, width: "calc(100% - 32px)" }}
            />
          ))
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ px: 2 }}>
            Aucun champ personnalisé.
          </Typography>
        )}
      </List>
    </Box>
  );

  return (
    <Box
      sx={{
        display: { xs: "block", md: "flex" },
        width: "100%",
        minHeight: "100vh",
        bgcolor: "#fafafa",
      }}
    >
      {/* Panneau d’info */}
      {isMobile ? (
        <Paper elevation={1} sx={{ m: 2, borderRadius: 2 }}>{InfoPanel}</Paper>
      ) : (
        <Drawer
          variant="permanent"
          anchor="left"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              boxSizing: "border-box",
              p: 0,
            },
          }}
        >
          {InfoPanel}
        </Drawer>
      )}

      {/* Contenu principal */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, md: 4 },
          ml: { md: `${drawerWidth}px` }, // espace pris par le drawer en desktop
        }}
      >
        {/* Carte */}
        {latitude && longitude && (
          <Paper elevation={2} sx={{ borderRadius: 2, overflow: "hidden", mb: 3 }}>
            <Typography fontWeight={700} sx={{ p: 2, pb: 0 }}>
              Carte du projet
            </Typography>
            <Box sx={{ height: { xs: 260, sm: 320, md: 400 }, mt: 1 }}>
              <MapContainer
                center={[latitude, longitude]}
                zoom={13}
                style={{ width: "100%", height: "100%" }}
                scrollWheelZoom={false}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker position={[latitude, longitude]}>
                  <Popup>{name}</Popup>
                </Marker>
              </MapContainer>
            </Box>
          </Paper>
        )}

        {/* Timeline */}
        <Paper elevation={1} sx={{ borderRadius: 2, p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Historique des étapes
          </Typography>
          {steps.length > 0 ? (
            <List dense>
              {steps.map((s) => (
                <ListItem
                  key={s.id}
                  sx={{ mb: 1, bgcolor: theme.palette.background.paper, borderRadius: 1, boxShadow: 0 }}
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {s.label}
                        </Typography>
                        <Chip
                          label={s.status}
                          size="small"
                          color={
                            (s.status || "").toLowerCase().includes("ok")
                              ? "success"
                              : (s.status || "").toLowerCase().includes("annul")
                              ? "error"
                              : "default"
                          }
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(s.step_date).toLocaleDateString("fr-FR")}
                        </Typography>
                        {s.step_comment && (
                          <Typography variant="body2" sx={{ fontStyle: "italic", mt: 0.5 }}>
                            {s.step_comment}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography sx={{ fontStyle: "italic", color: theme.palette.text.disabled }}>
              Aucune étape enregistrée.
            </Typography>
          )}
        </Paper>
      </Box>
    </Box>
  );
}
