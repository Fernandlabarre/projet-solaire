import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Paper,
  Tooltip,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import api from "../api/axios";
import SidebarLayout from "../components/layout/SidebarLayout";

const defaultForm = {
  name: "",
  address: "",
  type: "",
  power: "",
  phone: "",
  email: "",
  comments: "",
  status: "En cours",
};

export default function ProjectList() {
  const [projects, setProjects] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [search, setSearch] = useState("");

  // Charger les projets
  useEffect(() => {
    api.get("/projects").then((res) => setProjects(res.data));
  }, []);

  // CRUD
  const handleOpen = (row) => {
    if (row) {
      setForm(row);
      setEditId(row.id);
    } else {
      setForm(defaultForm);
      setEditId(null);
    }
    setModalOpen(true);
  };

  const handleClose = () => {
    setModalOpen(false);
    setForm(defaultForm);
    setEditId(null);
  };

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    try {
      if (editId) {
        await api.put(`/projects/${editId}`, form);
      } else {
        await api.post("/projects", form);
      }
      const res = await api.get("/projects");
      setProjects(res.data);
      handleClose();
    } catch (err) {
      alert("Erreur lors de l'enregistrement !");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer ce projet ?")) return;
    await api.delete(`/projects/${id}`);
    setProjects((p) => p.filter((proj) => proj.id !== id));
  };

  // Recherche multi-champs
  const filteredRows = projects.filter((p) =>
    Object.values(p).join(" ").toLowerCase().includes(search.toLowerCase())
  );

  // Colonnes DataGrid
  const columns = [
    { field: "id", headerName: "ID", width: 80 },
    { field: "name", headerName: "Nom", flex: 1, minWidth: 160 },
    { field: "address", headerName: "Adresse", flex: 2, minWidth: 220 },
    { field: "type", headerName: "Type", width: 120 },
    { field: "power", headerName: "Puissance", width: 110 },
    { field: "status", headerName: "Statut", width: 110 },
    {
      field: "actions",
      headerName: "",
      width: 100,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <>
          <Tooltip title="Modifier">
            <IconButton
              size="small"
              color="primary"
              onClick={() => handleOpen(params.row)}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Supprimer">
            <IconButton
              size="small"
              color="error"
              onClick={() => handleDelete(params.row.id)}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </>
      ),
    },
  ];

  return (
    <SidebarLayout>
      {/* Contenu principal — pleine largeur */}
      <Box
        sx={{
          width: "100%",
          minWidth: 0,
          boxSizing: "border-box",
          px: { xs: 2, md: 4 },
          pt: 2,
          pb: 6,
        }}
      >
        <Paper sx={{ width: "100%", p: { xs: 2, md: 3 }, borderRadius: 3, boxShadow: 2 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 2,
            }}
          >
            <Box>
              <Typography variant="h5" fontWeight={700}>
                Liste des Projets
              </Typography>
              <Typography color="text.secondary" fontSize={15}>
                Gestion de tous les projets
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpen(null)}
              sx={{ borderRadius: 3, fontWeight: 700 }}
            >
              Créer
            </Button>
          </Box>

          {/* Barre de recherche */}
          <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
            <TextField
              size="small"
              placeholder="Recherche globale"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <SearchIcon sx={{ color: "text.disabled", mr: 1 }} />
                ),
              }}
              sx={{ maxWidth: 420, bgcolor: "#fff", borderRadius: 2 }}
            />
          </Box>

          <DataGrid
            rows={filteredRows}
            columns={columns}
            getRowId={(row) => row.id}
            autoHeight
            pageSize={8}
            rowsPerPageOptions={[8, 16, 32]}
            disableSelectionOnClick
            sx={{
              bgcolor: "#fff",
              borderRadius: 2,
              fontSize: 16,
              boxShadow: 1,
              "& .MuiDataGrid-row": { cursor: "pointer" },
              minHeight: 400,
              maxHeight: 600,
            }}
          />

          {/* Modal Ajout/Édition */}
          <Dialog open={modalOpen} onClose={handleClose} fullWidth maxWidth="sm">
            <DialogTitle>
              {editId ? "Modifier le projet" : "Ajouter un projet"}
            </DialogTitle>
            <DialogContent
              sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
            >
              <TextField
                label="Nom *"
                name="name"
                value={form.name}
                onChange={handleChange}
                fullWidth
              />
              <TextField
                label="Adresse *"
                name="address"
                value={form.address}
                onChange={handleChange}
                fullWidth
              />
              <TextField
                label="Type *"
                name="type"
                value={form.type}
                onChange={handleChange}
                fullWidth
              />
              <TextField
                label="Puissance *"
                name="power"
                value={form.power}
                onChange={handleChange}
                fullWidth
              />
              <TextField
                label="Téléphone"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                fullWidth
              />
              <TextField
                label="Email"
                name="email"
                value={form.email}
                onChange={handleChange}
                fullWidth
              />
              <TextField
                label="Commentaires"
                name="comments"
                value={form.comments}
                onChange={handleChange}
                fullWidth
                multiline
                rows={2}
              />
              <TextField
                select
                label="Statut"
                name="status"
                value={form.status}
                onChange={handleChange}
                fullWidth
                SelectProps={{ native: true }}
              >
                <option value="En cours">En cours</option>
                <option value="Terminée">Terminée</option>
                <option value="Annulée">Annulée</option>
              </TextField>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose}>Annuler</Button>
              <Button onClick={handleSave} variant="contained" color="success">
                {editId ? "Enregistrer" : "Créer"}
              </Button>
            </DialogActions>
          </Dialog>
        </Paper>
      </Box>
    </SidebarLayout>
  );
}
