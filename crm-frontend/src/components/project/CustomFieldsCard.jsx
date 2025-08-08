import { Paper, Typography, Table, TableHead, TableRow, TableCell, TableBody, IconButton, TextField } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { useState } from "react";

/**
 * Props:
 * - dense?: boolean (par défaut true) -> compresse les lignes au max
 * - truncate?: boolean (par défaut true) -> tronque les longues valeurs avec ellipsis
 */
export default function CustomFieldsCard({ fields, onAdd, onEdit, onDelete, dense = true, truncate = true }) {
  const [form, setForm] = useState({ name: "", value: "" });
  const [editId, setEditId] = useState(null);

  async function submit() {
    if (!form.name) return;
    if (editId) {
      await onEdit(editId, form.name, form.value);
      setEditId(null);
    } else {
      await onAdd(form.name, form.value);
    }
    setForm({ name: "", value: "" });
  }

  const compactSx = dense
    ? {
        // Réduit la hauteur et les paddings partout dans le tableau
        "& .MuiTableCell-root": { py: 0.25, px: 0.75, lineHeight: 1.25 },
        "& .MuiTableRow-root": { height: 34 }, // ~ compact
        "& .MuiInputBase-input": { py: 0.3 },  // amincit les TextField
        "& .MuiIconButton-root": { p: 0.25 },  // icônes plus serrées
      }
    : undefined;

  const cellTruncateSx = truncate
    ? {
        maxWidth: 240,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      }
    : undefined;

  return (
    <Paper elevation={1} sx={{ p: 2, borderRadius: 2 }}>
      <Typography variant="subtitle2" sx={{ mb: 1, fontSize: 13 }}>Infos personnalisées</Typography>

      <Table size="small" sx={compactSx}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>Nom</TableCell>
            <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>Valeur</TableCell>
            <TableCell sx={{ width: 40 }} />
          </TableRow>
        </TableHead>

        <TableBody>
          {fields.map((f) => (
            <TableRow key={f.id} hover>
              <TableCell sx={cellTruncateSx} title={truncate ? f.field_name : undefined}>
                {f.field_name}
              </TableCell>
              <TableCell sx={cellTruncateSx} title={truncate ? f.field_value : undefined}>
                {f.field_value}
              </TableCell>
              <TableCell align="right">
                <IconButton
                  size="small"
                  onClick={() => {
                    setEditId(f.id);
                    setForm({ name: f.field_name, value: f.field_value });
                  }}
                >
                  <EditIcon fontSize="inherit" />
                </IconButton>
                <IconButton size="small" onClick={() => onDelete(f.id)}>
                  <DeleteIcon fontSize="inherit" />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}

          {/* Ligne d'édition/ajout */}
          <TableRow>
            <TableCell>
              <TextField
                size="small"
                placeholder="Nom du champ"
                fullWidth
                value={form.name}
                onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                inputProps={{ "aria-label": "Nom du champ" }}
              />
            </TableCell>
            <TableCell>
              <TextField
                size="small"
                placeholder="Valeur"
                fullWidth
                value={form.value}
                onChange={(e) => setForm((s) => ({ ...s, value: e.target.value }))}
                inputProps={{ "aria-label": "Valeur" }}
              />
            </TableCell>
            <TableCell align="right">
              <IconButton size="small" color="primary" onClick={submit} aria-label={editId ? "Enregistrer" : "Ajouter"}>
                <AddIcon fontSize="inherit" />
              </IconButton>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </Paper>
  );
}
