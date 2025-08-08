// src/components/project/ShareCard.jsx
import { useState } from "react";
import { Paper, Typography, Box, TextField, Button } from "@mui/material";

export default function ShareCard({ onInvite }) {
  const [email, setEmail] = useState("");

  async function handleInvite(e) {
    e.preventDefault();
    if (!email) return;
    await onInvite(email);
    setEmail("");
  }

  return (
    <Paper sx={{ p: 2, borderRadius: 2 }}>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>Partager le projet</Typography>

      <Box component="form" onSubmit={handleInvite} sx={{ display: "flex", gap: 1 }}>
        <TextField
          size="small"
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
        />
        <Button type="submit" size="small" variant="contained">Inviter</Button>
      </Box>
    </Paper>
  );
}
