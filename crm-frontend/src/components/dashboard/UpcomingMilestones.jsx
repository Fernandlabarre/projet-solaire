import { useEffect, useState } from "react";
import { Paper, Typography, Chip, List, ListItem, ListItemText, Box } from "@mui/material";
import api from "../../api/axios";

function normalize(s) {
  return String(s || "")
    .toLowerCase()
    .normalize("NFD").replace(/\p{Diacritic}/gu, "")
    .replace(/_/g, " ")
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

export default function UpcomingMilestones() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/milestones/upcoming");
        const arr = Array.isArray(data) ? data : [];
        const today0 = startOfDay(new Date());
        const filtered = arr
          .filter(m => m?.due_date)
          .filter(m => startOfDay(m.due_date) >= today0)
          .filter(m => !isClosedStatus(m?.status))
          .sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
        setItems(filtered.slice(0, 8));
      } catch (e) {
        console.error("Erreur chargement jalons", e);
        setItems([]);
      }
    })();
  }, []);

  const today0 = startOfDay(new Date());

  return (
    <Paper
      sx={{
        p: { xs: 1.5, md: 2 },
        borderRadius: 3,
        boxShadow: { xs: 1, md: 3 },
        height: "100%",
        m: { xs: 0, md: 2 },
        minWidth: { xs: 260, md: 'auto' },
      }}
    >
      <Typography fontWeight={700} sx={{ mb: 1 }}>📅 Échéances à venir</Typography>
      {items.length > 0 ? (
        <List dense sx={{ maxHeight: { xs: 180, md: 'none' }, overflowY: { xs: 'auto', md: 'visible' } }}>
          {items.map(m => {
            const d = m.due_date ? new Date(m.due_date) : null;
            const d0 = d ? startOfDay(d) : null;
            const overdue = d0 && d0 < today0;
            return (
              <ListItem
                key={m.id}
                sx={{ py: 0.5, cursor: "pointer", "&:hover": { bgcolor: "#f5f5f5" } }}
                onClick={() => window.location.assign(`/projects/${m.project_id}`)}
                secondaryAction={
                  d ? (
                    <Chip
                      size="small"
                      color={overdue ? "error" : "default"}
                      label={d.toLocaleDateString("fr-FR")}
                    />
                  ) : null
                }
              >
                <ListItemText
                  primary={<b>{m.label}</b>}
                  secondary={`${m.project_name ?? "Projet"} • ${m.investor_name ?? "Investisseur"}`}
                />
              </ListItem>
            );
          })}
        </List>
      ) : (
        <Box sx={{ mt: 1, color: "text.secondary" }}>Aucun jalon à venir 👍</Box>
      )}
    </Paper>
  );
}
