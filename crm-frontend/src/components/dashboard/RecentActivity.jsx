// components/dashboard/RecentActivity.jsx
import { useEffect, useState } from "react";
import { Paper, Typography, List, ListItem, ListItemText, Box } from "@mui/material";
import api from "../../api/axios";

export default function RecentActivity() {
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/activity/recent");
        setActivities(data || []);
      } catch (e) {
        console.error("Erreur activité récente", e);
        setActivities([]);
      }
    })();
  }, []);

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
      <Typography fontWeight={700} sx={{ mb: 1 }}>🕒 Activité récente</Typography>
      <Box sx={{ maxHeight: { xs: 180, md: 240 }, overflowY: "auto" }}>
        <List dense>
          {activities.slice(0, 8).map((a, idx) => (
            <ListItem
              key={idx}
              sx={{ py: 0.5, borderRadius: 1, "&:hover": { bgcolor: "#fafafa" }, cursor: a.project_id ? "pointer" : "default" }}
              onClick={() => a.project_id && window.location.assign(`/projects/${a.project_id}`)}
            >
              <ListItemText
                primary={a.text}
                secondary={a.date ? new Date(a.date).toLocaleString("fr-FR") : "—"}
              />
            </ListItem>
          ))}
          {activities.length === 0 && <Typography color="text.secondary">Aucune activité récente</Typography>}
        </List>
      </Box>
    </Paper>
  );
}
