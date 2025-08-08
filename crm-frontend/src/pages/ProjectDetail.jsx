import { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, MenuItem, Typography,
  Card, CardHeader, CardContent,
  Tabs, Tab, Accordion, AccordionSummary, AccordionDetails,
  Stack
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import api from "../api/axios";
import { AuthContext } from "../contexts/AuthContext";
import SidebarLayout from "../components/layout/SidebarLayout";

// cards
import ProjectHeaderBar from "../components/project/ProjectHeaderBar";
import CustomFieldsCard from "../components/project/CustomFieldsCard";
import InvestorsCard from "../components/project/InvestorsCard";
import StepsCard from "../components/project/StepsCard";
import AutocompleteAdresse from "../components/AutocompleteAdresse";

const statusList = ["En cours", "Terminée", "Annulée"];

export default function ProjectDetail() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);

  const [project, setProject] = useState(null);
  const [customFields, setCustomFields] = useState([]);
  const [steps, setSteps] = useState([]);
  const [loading, setLoading] = useState(true);

  // edit project dialog
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [statusUpdating, setStatusUpdating] = useState(false);

  // share dialog
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteUrl, setInviteUrl] = useState("");

  // tabs: 0 = Étapes, 1 = Investisseurs
  const [tab, setTab] = useState(0);

  // ===== LOAD =====
  useEffect(() => {
    (async () => {
      setLoading(true);
      const res = await api.get(`/projects/${id}`);
      setProject(res.data);

      const cf = await api.get(`/projects/${id}/custom_fields`);
      setCustomFields(cf.data);

      const st = await api.get(`/projects/${id}/steps`);
      setSteps(st.data);

      setLoading(false);
    })();
  }, [id]);

  // ===== Custom fields CRUD =====
  async function refreshCustomFields() {
    const cf = await api.get(`/projects/${id}/custom_fields`);
    setCustomFields(cf.data);
  }
  async function addCustomField(field_name, field_value, user_id) {
    await api.post(`/projects/${id}/custom_fields`, { field_name, field_value, user_id });
    await refreshCustomFields();
  }
  async function updateCustomField(field_id, field_name, field_value) {
    await api.put(`/projects/custom_fields/${field_id}`, { field_name, field_value });
    await refreshCustomFields();
  }
  async function deleteCustomField(field_id) {
    await api.delete(`/projects/custom_fields/${field_id}`);
    await refreshCustomFields();
  }

  // ===== Steps =====
  async function refreshSteps() {
    const st = await api.get(`/projects/${id}/steps`);
    setSteps(st.data);
  }
  async function addStep(payload) {
    await api.post(`/projects/${id}/steps`, payload);
    await refreshSteps();
  }
  async function deleteStep(stepId) {
    await api.delete(`/projects/${id}/steps/${stepId}`);
    await refreshSteps();
  }

  // ===== Project header actions =====
  function openEdit() {
    setEditForm({
      name: project.name || "",
      address: project.address || "",
      type: project.type || "",
      power: project.power || "",
      phone: project.phone || "",
      email: project.email || "",
      comments: project.comments || "",
      status: project.status || "En cours",
      latitude: project.latitude || null,
      longitude: project.longitude || null,
    });
    setEditOpen(true);
  }
  async function saveEdit(e) {
    e && e.preventDefault();
    await api.put(`/projects/${id}`, editForm);
    setEditOpen(false);
    const res = await api.get(`/projects/${id}`);
    setProject(res.data);
  }
  async function changeStatus(e) {
    const newStatus = e.target.value;
    setStatusUpdating(true);
    await api.put(`/projects/${id}`, {
      name: project.name || "",
      address: project.address || "",
      type: project.type || "",
      power: project.power || "",
      phone: project.phone || "",
      email: project.email || "",
      comments: project.comments || "",
      status: newStatus,
      latitude: project.latitude,
      longitude: project.longitude,
      owner_id: project.owner_id || null,
    });
    setProject((p) => ({ ...p, status: newStatus }));
    setStatusUpdating(false);
  }

  // ===== Public share (dialog) =====
  async function doInvite(email) {
    const res = await api.post(`/projects/${id}/invite`, { email });
    setInviteUrl(res.data.url);
  }
  function openShareDialog() {
    setInviteEmail("");
    setInviteUrl("");
    setInviteDialogOpen(true);
  }
  function closeShareDialog() {
    setInviteDialogOpen(false);
    setInviteEmail("");
    setInviteUrl("");
  }
  async function submitShare(e) {
    e.preventDefault();
    if (!inviteEmail) return;
    await doInvite(inviteEmail);
  }

  if (loading || !project) {
    return (
      <SidebarLayout>
        <Box sx={{ p: 4 }}>Chargement…</Box>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout>
      <Box sx={{ display: "flex", gap: 2 }}>
        {/* COLONNE GAUCHE (pile verticale) */}
        <Box
          sx={{
            width: { xs: "100%", md: "55%" },
            maxHeight: "80vh",
            overflowY: "auto",
            pr: 1,
          }}
        >
          <ProjectHeaderBar
            project={project}
            user={user}
            onEditClick={openEdit}
            onStatusChange={changeStatus}
            statusUpdating={statusUpdating}
            onShareClick={openShareDialog}
          />

          <Stack spacing={2}>
            {/* Infos personnalisées en accordéon compact */}
            <Accordion defaultExpanded disableGutters elevation={0} sx={{ borderRadius: 2, background: "transparent" }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 0 }}>
                <Typography variant="subtitle2">Infos personnalisées</Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 0 }}>
                <CustomFieldsCard
                  fields={customFields}
                  onAdd={(name, value) => addCustomField(name, value, user.id)}
                  onEdit={updateCustomField}
                  onDelete={deleteCustomField}
                />
              </AccordionDetails>
            </Accordion>

            {/* Bloc Suivi avec onglets */}
            <Card elevation={1} sx={{ borderRadius: 2 }}>
              <CardHeader
                sx={{
                  py: 0.5,
                  "& .MuiCardHeader-content": { m: 0 },
                }}
                title={
                  <Box sx={{ height: 40, display: "flex", alignItems: "center", overflow: "hidden" }}>
                    <Tabs
                      value={tab}
                      onChange={(_, v) => setTab(v)}
                      variant="standard"
                      sx={{
                        minHeight: 40,
                        "& .MuiTabs-flexContainer": { gap: 1 },
                        "& .MuiTab-root": {
                          minHeight: 40,
                          px: 1.5,
                          py: 0.5,
                          minWidth: 0,
                          textTransform: "none",
                          fontWeight: 600,
                          lineHeight: 1.2,
                        },
                        "& .MuiTab-root.Mui-selected": {
                          px: 1.5,
                          py: 0.5,
                          fontWeight: 600,
                          lineHeight: 1.2,
                        },
                      }}
                      TabIndicatorProps={{ sx: { height: 2, bottom: 0 } }}
                    >
                      <Tab disableRipple label="Étapes" />
                      <Tab disableRipple label="Investisseurs" />
                    </Tabs>
                  </Box>
                }
              />
              <CardContent sx={{ pt: 2 }}>
                {tab === 0 && <StepsCard steps={steps} onAdd={addStep} onDelete={deleteStep} />}
                {tab === 1 && <InvestorsCard projectId={id} />}
              </CardContent>
            </Card>
          </Stack>
        </Box>

        {/* COLONNE DROITE : CARTE */}
        <Box
          sx={{
            width: { xs: "100%", md: "45%" },
            display: { xs: "none", md: "block" },
            height: "80vh",
            position: "relative",
            bgcolor: "#f0f4f7",
            borderRadius: 2,
            overflow: "hidden",
          }}
        >
          {project.latitude && project.longitude ? (
            <MapContainer
              center={[project.latitude, project.longitude]}
              zoom={15}
              style={{ width: "100%", height: "100%" }}
              scrollWheelZoom
              dragging
              doubleClickZoom
            >
              <TileLayer attribution="&copy; OpenStreetMap" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker position={[project.latitude, project.longitude]} />
            </MapContainer>
          ) : (
            <Box sx={{ display: "grid", placeItems: "center", height: "100%" }}>
              <Typography variant="body2" color="text.secondary">
                Aucune position définie pour ce projet.
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* ==== DIALOG: Edit projet ==== */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Modifier le projet</DialogTitle>
        <DialogContent>
          {editForm && (
            <Box component="form" sx={{ mt: 1 }}>
              <TextField label="Nom" name="name" value={editForm.name} onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))} fullWidth sx={{ mb: 1 }} />
              <AutocompleteAdresse
                value={editForm?.address || ""}
                onChange={(val) => setEditForm((f) => ({ ...f, address: val }))}
                onCoords={(coords) => setEditForm((f) => ({ ...f, latitude: coords.latitude, longitude: coords.longitude }))}
              />
              <TextField label="Type" name="type" value={editForm.type} onChange={(e) => setEditForm((f) => ({ ...f, type: e.target.value }))} fullWidth sx={{ mb: 1 }} />
              <TextField label="Puissance (kWc)" name="power" value={editForm.power} onChange={(e) => setEditForm((f) => ({ ...f, power: e.target.value }))} type="number" fullWidth sx={{ mb: 1 }} />
              <TextField label="Téléphone" name="phone" value={editForm.phone} onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))} fullWidth sx={{ mb: 1 }} />
              <TextField label="Email" name="email" value={editForm.email} onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))} fullWidth sx={{ mb: 1 }} />
              <TextField label="Commentaires" name="comments" value={editForm.comments} onChange={(e) => setEditForm((f) => ({ ...f, comments: e.target.value }))} fullWidth multiline rows={2} sx={{ mb: 1 }} />
              <TextField select label="Statut" name="status" value={editForm.status || "En cours"} onChange={(e) => setEditForm((f) => ({ ...f, status: e.target.value }))} fullWidth sx={{ mb: 1 }}>
                {statusList.map((s) => (
                  <MenuItem key={s} value={s}>{s}</MenuItem>
                ))}
              </TextField>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Annuler</Button>
          <Button onClick={saveEdit} variant="contained" color="success">Enregistrer</Button>
        </DialogActions>
      </Dialog>

      {/* ==== DIALOG: Partager ==== */}
      <Dialog open={inviteDialogOpen} onClose={closeShareDialog} fullWidth maxWidth="xs">
        <DialogTitle>Partager le projet</DialogTitle>
        <DialogContent>
          {!inviteUrl ? (
            <Box component="form" onSubmit={submitShare} sx={{ mt: 1, display: "flex", gap: 1 }}>
              <TextField
                size="small"
                label="Email"
                type="email"
                fullWidth
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                required
              />
              <Button type="submit" variant="contained">Inviter</Button>
            </Box>
          ) : (
            <Typography sx={{ mt: 1 }}>
              Lien généré :{" "}
              <a href={inviteUrl} target="_blank" rel="noreferrer">
                {inviteUrl}
              </a>
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeShareDialog}>Fermer</Button>
        </DialogActions>
      </Dialog>
    </SidebarLayout>
  );
}
