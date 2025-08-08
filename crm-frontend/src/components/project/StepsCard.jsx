import { Paper, Typography, Box, Stack, Chip, IconButton, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { useState } from "react";

function chipColor(s) {
  const v = (s || "").toLowerCase();
  if (v.includes("ok")) return "success";
  if (v.includes("annul")) return "error";
  if (v.includes("cours")) return "info";
  return "default";
}

export default function StepsCard({ steps, onAdd, onDelete }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ label: "", date: "", status: "En Cours", comment: "" });

  async function submit(e) {
    e.preventDefault();
    await onAdd({ label: form.label, step_date: form.date, status: form.status, step_comment: form.comment });
    setForm({ label: "", date: "", status: "En Cours", comment: "" });
    setOpen(false);
  }

  return (
    <Paper elevation={1} sx={{ p: 2, borderRadius: 2 }}>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>Suivi du projet</Typography>
      <Box sx={{ bgcolor: "#f6f7fb", borderRadius: 1, p: 1, mb: 1, maxHeight: 220, overflowY: "auto" }}>
        <Stack spacing={1}>
          {steps.map(step => (
            <Box key={step.id} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Chip size="small" label={step.status || "En Cours"} color={chipColor(step.status)} />
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" fontWeight={600} sx={{ display: "inline", mr: 1 }}>{step.label}</Typography>
                <Typography variant="caption" sx={{ color: "#888", ml: 1 }}>
                  {step.step_date ? new Date(step.step_date).toLocaleDateString("fr-FR") : ""}
                </Typography>
                {step.step_comment && <Typography variant="caption" sx={{ ml: 2, fontStyle: "italic", color: "#888" }}>{step.step_comment}</Typography>}
              </Box>
              <IconButton size="small" color="error" onClick={() => onDelete(step.id)}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          ))}
        </Stack>
      </Box>
      <Button size="small" variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>
        Ajouter une étape
      </Button>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Ajouter une étape</DialogTitle>
        <Box component="form" onSubmit={submit}>
          <DialogContent sx={{ display: "grid", gap: 2 }}>
            <TextField label="Libellé *" value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} required />
            <TextField label="Date *" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} InputLabelProps={{ shrink: true }} required />
            <TextField select label="Statut" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
              <MenuItem value="OK">OK</MenuItem>
              <MenuItem value="En Cours">En Cours</MenuItem>
              <MenuItem value="Annulé">Annulé</MenuItem>
            </TextField>
            <TextField label="Commentaire" value={form.comment} onChange={e => setForm(f => ({ ...f, comment: e.target.value }))} />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>Annuler</Button>
            <Button type="submit" variant="contained" color="success">Ajouter</Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Paper>
  );
}
