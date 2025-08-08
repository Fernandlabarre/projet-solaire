import { useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import api, { setAuthToken } from '../api/axios';
import { Card, TextField, Button, Typography, Box } from '@mui/material';

export default function LoginPage() {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await api.post('/users/login', { email, password });
      setAuthToken(res.data.token);
      login(res.data.token, res.data.user); // passe aussi le user si tu veux
      window.location.href = '/projects';
    } catch {
      setError('Identifiants invalides');
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Card sx={{ p: 4, minWidth: 350 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>Connexion</Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            label="Mot de passe"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          />
          {error && <Typography color="error" sx={{ mb: 1 }}>{error}</Typography>}
          <Button type="submit" variant="contained" fullWidth>
            Se connecter
          </Button>
        </form>
      </Card>
    </Box>
  );
}
