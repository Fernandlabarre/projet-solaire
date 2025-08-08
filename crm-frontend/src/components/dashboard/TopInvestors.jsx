// components/dashboard/TopInvestors.jsx
import { useEffect, useState } from "react";
import { Paper, Typography, Table, TableHead, TableRow, TableCell, TableBody, Box } from "@mui/material";
import api from "../../api/axios";

export default function TopInvestors() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        // Endpoint attendu: GET /api/analytics/top-investors
        // qui retourne: [{ id, name, project_count, upcoming_milestones, last_activity }]
        const { data } = await api.get("/analytics/top-investors");
        setRows(data || []);
      } catch (e) {
        console.error("Erreur top investisseurs", e);
        setRows([]);
      }
    })();
  }, []);

  return (
    <Paper sx={{ p: 2, borderRadius: 3, boxShadow: 3, height: "100%", display: "flex", flexDirection: "column", m: 2  }}>
      <Typography fontWeight={700} sx={{ mb: 1 }}>🏆 Top investisseurs</Typography>
      <Box sx={{ flex: 1, minHeight: 0, overflow: "auto" }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Investisseur</TableCell>
              <TableCell align="right">Projets</TableCell>
              <TableCell align="right">Jalons à venir</TableCell>
              <TableCell align="right">Dernière activité</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.slice(0, 6).map((r) => (
              <TableRow
                key={r.id}
                hover
                sx={{ cursor: "pointer" }}
                onClick={() => window.location.assign(`/investors/${r.id}`)}
              >
                <TableCell>{r.name}</TableCell>
                <TableCell align="right">{r.project_count ?? 0}</TableCell>
                <TableCell align="right">{r.upcoming_milestones ?? 0}</TableCell>
                <TableCell align="right">
                  {r.last_activity ? new Date(r.last_activity).toLocaleDateString("fr-FR") : "—"}
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow><TableCell colSpan={4} align="center">Aucune donnée</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </Box>
    </Paper>
  );
}
