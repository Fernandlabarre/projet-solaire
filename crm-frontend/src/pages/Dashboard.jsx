import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Chip,
  IconButton,
  Paper,
  CircularProgress,
  InputAdornment,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import AutocompleteAdresse from "../components/AutocompleteAdresse";
import SidebarLayout from "../components/layout/SidebarLayout";

// Widgets
import ProjectStatusDonut from "../components/dashboard/ProjectStatusDonut";
import UpcomingMilestones from "../components/dashboard/UpcomingMilestones";
import OverdueMilestones from "../components/dashboard/OverdueMilestones";
import RecentActivity from "../components/dashboard/RecentActivity";

function FitBounds({ projects }) {
  const map = useMap();
  useEffect(() => {
    const pts = (projects || [])
      .filter((p) => p.latitude && p.longitude)
      .map((p) => [Number(p.latitude), Number(p.longitude)]);
    if (pts.length === 1) map.setView(pts[0], 13);
    else if (pts.length > 1) map.fitBounds(pts, { padding: [30, 30] });
    else map.setView([46.603354, 1.888334], 6);
  }, [projects, map]);
  return null;
}

export default function Dashboard() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    address: "",
    type: "",
    power: "",
    phone: "",
    email: "",
    comments: "",
    owner_id: "",
    latitude: null,
    longitude: null,
    status: "En cours",
  });
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.get("/projects");
        const data = Array.isArray(res.data) ? res.data : [];
        if (mounted) {
          setProjects(data);
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setProjects([]);
          setLoading(false);
        }
        if (err?.response?.status === 401) {
          navigate("/login");
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, [navigate]);

  const counts = {
    enCours: (projects || []).filter((p) => p.status === "En cours").length,
    terminee: (projects || []).filter((p) => p.status === "Terminée").length,
    annulee: (projects || []).filter((p) => p.status === "Annulée").length,
  };

  const lowerSearch = search.toLowerCase().trim();
  const filteredProjects = (projects || []).filter((p) => {
    if (statusFilter && p.status !== statusFilter) return false;
    if (!lowerSearch) return true;
    return Object.values(p).join(" ").toLowerCase().includes(lowerSearch);
  });

  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);
  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    if (!form.name || !form.address || !form.type || !form.power)
      return alert("Champs obligatoires manquants.");
    if (!form.latitude || !form.longitude)
      return alert("Sélectionne une adresse (coordonnées manquantes).");
    try {
      await api.post("/projects", form);
      closeModal();
      const { data } = await api.get("/projects");
      setProjects(Array.isArray(data) ? data : []);
    } catch (err) {
      alert("Erreur lors de l'ajout du projet.");
    }
  }

  return (
    <SidebarLayout>
      <Box
        sx={{
          width: "100%",
          minWidth: 0,
          boxSizing: "border-box",
          px: { xs: 1.5, md: 4 },
          pt: 2,
          pb: 6,
        }}
      >
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* ROW 1 — Widgets */}
            {/* Mobile: horizontal scroll, on utilise directement les widgets (pas de Paper supplémentaire) */}
            <Box
              sx={{
                display: { xs: "flex", md: "none" },
                gap: 1.5,
                mb: 2,
                overflowX: "auto",
                pb: 1,
                scrollSnapType: "x mandatory",
                "& > *": { scrollSnapAlign: "start" },
                "&::-webkit-scrollbar": { display: "none" },
              }}
            >
              <ProjectStatusDonut counts={counts} />
              <UpcomingMilestones />
              <OverdueMilestones />
              <RecentActivity />
            </Box>

            {/* Desktop (inchangé) */}
            <Grid
              container
              spacing={2}
              sx={{ mb: 4, display: { xs: "none", md: "flex" } }}
            >
              <Grid size={3} item xs={12} md={3}>
                <ProjectStatusDonut counts={counts} />
              </Grid>
              <Grid size={3} item xs={12} md={3}>
                <UpcomingMilestones />
              </Grid>
              <Grid size={3} item xs={12} md={3}>
                <OverdueMilestones />
              </Grid>
              <Grid size={3} item xs={12} md={3}>
                <RecentActivity />
              </Grid>
            </Grid>

            {/* ROW 2 — Carte */}
            <Paper sx={{ p: 2, borderRadius: 3, boxShadow: 2, mb: 3 }}>
              <Typography fontWeight={700} sx={{ mb: 1 }}>
                Carte des Projets
              </Typography>
              <Box
                sx={{
                  height: { xs: 300, sm: 360, md: 420 },
                  borderRadius: 2,
                  overflow: "hidden",
                }}
              >
                <MapContainer
                  center={[46.603354, 1.888334]}
                  zoom={6}
                  scrollWheelZoom
                  style={{ height: "100%", width: "100%" }}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  {(filteredProjects || []).map((p) =>
                    p.latitude && p.longitude ? (
                      <Marker
                        key={p.id}
                        position={[Number(p.latitude), Number(p.longitude)]}
                      />
                    ) : null
                  )}
                  <FitBounds projects={filteredProjects} />
                </MapContainer>
              </Box>
            </Paper>

            {/* ROW 3 — Filtres */}
            <Paper
              sx={{
                p: 2,
                borderRadius: 2,
                display: "grid",
                gap: 1.5,
                alignItems: "center",
                mb: 3,
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "1fr 220px auto",
                },
              }}
            >
              <TextField
                size="small"
                fullWidth
                placeholder="Rechercher..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: "text.disabled" }} />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                select
                size="small"
                label="Statut"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                sx={{ minWidth: { xs: "100%", sm: 180 } }}
              >
                {["", "En cours", "Terminée", "Annulée"].map((v) => (
                  <MenuItem key={v || "all"} value={v}>
                    {v || "Tous les statuts"}
                  </MenuItem>
                ))}
              </TextField>
              <Button
                variant="contained"
                color="success"
                startIcon={<AddIcon />}
                onClick={openModal}
                sx={{ width: { xs: "100%", sm: "auto" } }}
              >
                Ajouter un projet
              </Button>
            </Paper>

            {/* ROW 4 — Cartes projets */}
            <Grid container spacing={2}>
              {(filteredProjects || []).map((project) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={project.id}>
                  <Paper
                    elevation={1}
                    sx={{
                      p: 2,
                      borderRadius: 3,
                      position: "relative",
                      cursor: "pointer",
                      bgcolor: "#fff",
                      minHeight: { xs: 148, md: 165 },
                      "&:hover": { boxShadow: 4, border: "2px solid #06C270" },
                      transition: "all .15s",
                    }}
                    onClick={() => navigate(`/projects/${project.id}`)}
                  >
                    <IconButton
                      size="small"
                      color="error"
                      onClick={async (e) => {
                        e.stopPropagation();
                        if (window.confirm("Supprimer ce projet ?")) {
                          await api.delete(`/projects/${project.id}`);
                          setProjects((prev) =>
                            prev.filter((p) => p.id !== project.id)
                          );
                        }
                      }}
                      sx={{ position: "absolute", top: 8, right: 8 }}
                    >
                      <DeleteIcon />
                    </IconButton>

                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 0.5,
                        minWidth: 0,
                      }}
                    >
                      <Typography
                        variant="h6"
                        fontWeight={700}
                        noWrap
                        sx={{ flex: 1 }}
                      >
                        {project.name}
                      </Typography>
                      <Chip
                        size="small"
                        label={project.status}
                        color={
                          project.status === "Terminée"
                            ? "success"
                            : project.status === "Annulée"
                            ? "error"
                            : "info"
                        }
                        sx={{ fontWeight: 700, fontSize: 12 }}
                      />
                    </Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      noWrap
                      sx={{ mb: 0.5 }}
                    >
                      📍 {project.address}
                    </Typography>
                    <Typography variant="body2">
                      <b>Type :</b> {project.type}
                    </Typography>
                    <Typography variant="body2">
                      <b>Puissance :</b> {project.power} kWc
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </>
        )}
      </Box>

      <Dialog open={modalOpen} onClose={closeModal} fullWidth maxWidth="sm">
        <DialogTitle>Nouveau Projet</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 1 }}>
            <TextField
              label="Nom du projet *"
              name="name"
              value={form.name}
              onChange={onChange}
              fullWidth
              sx={{ mb: 2 }}
            />
            <AutocompleteAdresse
              value={form.address}
              onChange={(val) => setForm((f) => ({ ...f, address: val }))}
              onCoords={(c) =>
                setForm((f) => ({
                  ...f,
                  latitude: c.latitude,
                  longitude: c.longitude,
                }))
              }
            />
            <TextField
              label="Type *"
              name="type"
              value={form.type}
              onChange={onChange}
              fullWidth
              sx={{ mb: 2 }}
            />
            <TextField
              label="Puissance (kWc) *"
              name="power"
              value={form.power}
              onChange={onChange}
              type="number"
              fullWidth
              sx={{ mb: 2 }}
            />
            <TextField
              label="Téléphone"
              name="phone"
              value={form.phone}
              onChange={onChange}
              fullWidth
              sx={{ mb: 2 }}
            />
            <TextField
              label="Email"
              name="email"
              value={form.email}
              onChange={onChange}
              fullWidth
              sx={{ mb: 2 }}
            />
            <TextField
              label="Commentaires"
              name="comments"
              value={form.comments}
              onChange={onChange}
              fullWidth
              multiline
              rows={2}
              sx={{ mb: 2 }}
            />
            <TextField
              select
              label="Statut *"
              name="status"
              value={form.status}
              onChange={onChange}
              fullWidth
              sx={{ mb: 2 }}
            >
              <MenuItem value="En cours">En cours</MenuItem>
              <MenuItem value="Terminée">Terminée</MenuItem>
              <MenuItem value="Annulée">Annulée</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeModal}>Annuler</Button>
          <Button onClick={submit} variant="contained" color="success">
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>
    </SidebarLayout>
  );
}
