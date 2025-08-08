import { Paper, Box, Typography, Chip, Select, MenuItem, Button, IconButton, Tooltip } from "@mui/material";
import ShareIcon from "@mui/icons-material/Share";

export default function ProjectHeaderBar({
  project,
  user,
  onEditClick,
  onStatusChange,
  statusUpdating,
  onShareClick, // ⬅️ nouvelle prop
}) {
  const statusList = ["En cours", "Terminée", "Annulée"];

  return (
    <Paper elevation={1} sx={{ p: 2, mb: 2, borderRadius: 2 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        {/* Titre + statut */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
          <Typography variant="h6" fontWeight={800}>{project.name}</Typography>
          {project.type && <Chip label={project.type} color="info" sx={{ fontWeight: 700 }} />}

          <Select
            value={project.status || "En cours"}
            onChange={onStatusChange}
            size="small"
            sx={{ ml: 0.5, fontWeight: 700, minWidth: 120, bgcolor: "#f6f7fa" }}
            disabled={statusUpdating}
          >
            {statusList.map((s) => (
              <MenuItem key={s} value={s}>{s}</MenuItem>
            ))}
          </Select>
        </Box>

        {/* Actions à droite */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Tooltip title="Partager le projet">
            <IconButton
              size="small"
              onClick={onShareClick}
              aria-label="Partager le projet"
            >
              <ShareIcon />
            </IconButton>
          </Tooltip>

          {user?.role === "admin" && (
            <Button variant="outlined" onClick={onEditClick} size="small">
              Modifier
            </Button>
          )}
        </Box>
      </Box>

      {/* Infos clés */}
      <Box
        sx={{
          mt: 1,
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
          columnGap: 3,
          rowGap: 0.5,
        }}
      >
        <Typography variant="body2"><b>Adresse :</b> {project.address || "—"}</Typography>
        <Typography variant="body2"><b>Puissance :</b> {project.power ? `${project.power} kWc` : "—"}</Typography>
        <Typography variant="body2"><b>Téléphone :</b> {project.phone || "—"}</Typography>
        <Typography variant="body2"><b>Email :</b> {project.email || "—"}</Typography>
      </Box>

      {project.comments && (
        <Typography variant="body2" sx={{ mt: 1 }}>
          <b>Commentaires :</b><br />
          <span style={{ whiteSpace: "pre-line" }}>{project.comments}</span>
        </Typography>
      )}
    </Paper>
  );
}
