import { useEffect, useState } from "react";
import { Paper, Typography, List, ListItem, ListItemText, Chip, Box } from "@mui/material";
import api from "../../api/axios";

function normalize(s) {
  return String(s ?? "")
    .toLowerCase()
    .normalize("NFD").replace(/\p{Diacritic}/gu, "")
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
function isClosedStatus(status) {
  const n = normalize(status);
  return n === "paye" || n === "payee" || n === "annule";
}
function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export default function OverdueMilestones() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/milestones/overdue");
        const arr = Array.isArray(data) ? data : [];
        const today0 = startOfDay(new Date());
        const filtered = arr
          .filter(m => m?.due_date)
          .filter(m => startOfDay(m.due_date) < today0)
          .filter(m => !isClosedStatus(m?.status))
          .sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
        setItems(filtered.slice(0, 8));
      } catch (e) {
        console.error("Erreur chargement jalons en retard", e);
        setItems([]);
      }
    })();
  }, []);

  const count = items.length;

  return (
    <Paper
      sx={{
        p: { xs: 1.5, md: 2 },
        borderRadius: 3,
        boxShadow: { xs: 1, md: 3 },
        height: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 1,
        m: { xs: 0, md: 2 },
        minWidth: { xs: 260, md: 'auto' },
      }}
    >
      <Typography fontWeight={700}>⏳ Jalons en retard</Typography>
      <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5 }}>
        {count === 0 ? "Aucun jalon en retard 🎉" : ""}
      </Typography>
      <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto", maxHeight: { xs: 180, md: 'none' } }}>
        <List dense>
          {items.map(m => {
            const d = m.due_date ? new Date(m.due_date) : null;
            return (
              <ListItem
                key={m.id}
                sx={{ py: 0.5, cursor: "pointer", "&:hover": { bgcolor: "#fafafa" }, borderRadius: 1 }}
                onClick={() => window.location.assign(`/projects/${m.project_id}`)}
                secondaryAction={
                  d ? <Chip size="small" color="error" label={d.toLocaleDateString("fr-FR")} /> : null
                }
              >
                <ListItemText
                  primary={<b>{m.label || "Jalon"}</b>}
                  secondary={`${m.project_name ?? "Projet"}${m.investor_name ? " • " + m.investor_name : ""}`}
                />
              </ListItem>
            );
          })}
        </List>
      </Box>
    </Paper>
  );
}
