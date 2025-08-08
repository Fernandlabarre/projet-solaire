import { useEffect, useState } from "react";
import {
  Paper, Typography, Box, TextField, Button, Card, Stack, IconButton, Divider, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import RefreshIcon from "@mui/icons-material/Refresh";
import AddIcon from "@mui/icons-material/Add";
import {
  listInvestors, listProjectInvestors, attachInvestor, detachInvestor,
  listMilestones, addMilestone, createInvestor, deleteMilestone,
  STATUS_MAP, REVERSE_STATUS_MAP
} from "../../api/investors";
import api from "../../api/axios"; // pour les fallback PUT/PATCH

// rôle fixe
const FIXED_ROLE = "investisseurs";

/** Normalise une chaine: minuscule, sans accents, remplace _ par espace */
function normalize(s) {
  return String(s || "")
    .toLowerCase()
    .normalize("NFD").replace(/\p{Diacritic}/gu, "") // retire accents
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Couleur basée sur le statut (accepte formats internes ET libellés FR)
function getStepColor(status) {
  const n = normalize(status);
  if (n === "payee" || n === "paye") return "success";
  if (n === "annule") return "error";
  if (n === "en cours") return "info";
  if (n === "pas payee" || n === "pas paye") return "warning";
  return "default";
}

// Convertit n'importe quelle forme vers la valeur interne si possible
// "Payé" -> "payee", "payee" -> "payee"
function internalFromAny(s) {
  return STATUS_MAP[s] || s;
}

// Envoie le statut attendu par la DB (libellé FR exact)
function toDbStatus(internalOrFr) {
  return REVERSE_STATUS_MAP[internalOrFr] || internalOrFr; // "en_cours" -> "En cours"
}

/** Fallback intelligent pour update jalon quand le back n'a pas la route nested en PUT */
async function updateMilestoneSmart(projectId, investorId, milestoneId, statusInternal) {
  const status = toDbStatus(statusInternal); // toujours libellé FR pour l'ENUM DB

  // 1) Essai route nested en PUT
  try {
    await api.put(`/projects/${projectId}/investors/${investorId}/milestones/${milestoneId}`, { status });
    return;
  } catch (e) {
    const statusCode = e?.response?.status;
    const body = e?.response?.data;
    const bodyText = typeof body === "string" ? body : JSON.stringify(body || {});
    const isRouteMissing = statusCode === 404 || bodyText.includes("Cannot PUT");
    if (!isRouteMissing) {
      // peut être 400 (validation), etc. -> rethrow
      throw e;
    }
  }

  // 2) Essai route flat en PUT
  try {
    await api.put(`/milestones/${milestoneId}`, { status, project_id: projectId, investor_id: investorId });
    return;
  } catch (e) {
    const statusCode = e?.response?.status;
    const body = e?.response?.data;
    const bodyText = typeof body === "string" ? body : JSON.stringify(body || {});
    const isRouteMissing = statusCode === 404 || bodyText.includes("Cannot PUT");
    if (!isRouteMissing) {
      throw e;
    }
  }

  // 3) Essai nested en PATCH
  try {
    await api.patch(`/projects/${projectId}/investors/${investorId}/milestones/${milestoneId}`, { status });
    return;
  } catch (e) {
    const statusCode = e?.response?.status;
    const body = e?.response?.data;
    const bodyText = typeof body === "string" ? body : JSON.stringify(body || {});
    const isRouteMissing = statusCode === 404 || bodyText.includes("Cannot PATCH");
    if (!isRouteMissing) {
      throw e;
    }
  }

  // 4) Essai flat en PATCH
  await api.patch(`/milestones/${milestoneId}`, { status, project_id: projectId, investor_id: investorId });
}

export default function InvestorsCard({ projectId }) {
  const [allInvestors, setAllInvestors] = useState([]);
  const [projInvestors, setProjInvestors] = useState([]);
  const [selectedInvestorId, setSelectedInvestorId] = useState("");
  const [msByInvestor, setMsByInvestor] = useState({});

  // Dialog création investisseur
  const [createOpen, setCreateOpen] = useState(false);
  const [newInv, setNewInv] = useState({ name: "", company: "", email: "", phone: "", notes: "" });

  // Dialog ajout jalon
  const [msDialogOpenFor, setMsDialogOpenFor] = useState(null); // id investisseur ou null
  const [msForm, setMsForm] = useState({
    label: "",
    due_date: "",
    status: STATUS_MAP["En cours"], // valeur interne
    comment: ""
  });

  // Charger investisseurs du compte + investisseurs du projet
  useEffect(() => {
    (async () => {
      setAllInvestors(await listInvestors());
      const proj = await listProjectInvestors(projectId);
      setProjInvestors(proj);
    })();
  }, [projectId]);

  // Précharger tous les jalons dès qu'on a la liste des investisseurs du projet
  useEffect(() => {
    if (!projInvestors.length) return;
    let cancelled = false;
    (async () => {
      try {
        const entries = await Promise.all(
          projInvestors.map(async (inv) => {
            try {
              const items = await listMilestones(projectId, inv.id);
              return [inv.id, items];
            } catch (e) {
              console.error("Préchargement jalons échoué pour", inv.id, e);
              return [inv.id, []];
            }
          })
        );
        if (!cancelled) {
          setMsByInvestor((prev) => {
            const next = { ...prev };
            for (const [id, items] of entries) next[id] = items;
            return next;
          });
        }
      } catch (e) {
        console.error("Préchargement jalons (global) échoué:", e);
      }
    })();
    return () => { cancelled = true; };
  }, [projectId, projInvestors]);

  async function refreshMilestones(invId) {
    const items = await listMilestones(projectId, invId);
    setMsByInvestor(s => ({ ...s, [invId]: items }));
  }

  function openMsDialog(invId) {
    setMsDialogOpenFor(invId);
    setMsForm({
      label: "",
      due_date: "",
      status: STATUS_MAP["En cours"], // interne
      comment: ""
    });
  }

  async function submitMilestone() {
    if (!msDialogOpenFor || !msForm.label) return;
    const invId = msDialogOpenFor; // capture avant fermeture
    try {
      await addMilestone(projectId, invId, msForm); // mapping vers libellé FR fait côté API
      setMsDialogOpenFor(null);
      await refreshMilestones(invId);
    } catch (err) {
      console.error("Erreur ajout jalon:", err);
      alert("Impossible d'ajouter ce jalon.");
    }
  }

  return (
    <Paper elevation={1} sx={{ p: 2, borderRadius: 2 }}>
      {/* Sélection + bouton + pour ouvrir le dialog de création */}
      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 1, alignItems: "center" }}>
        <TextField
          select size="small" label="Investisseur" value={selectedInvestorId}
          onChange={e => setSelectedInvestorId(e.target.value)} sx={{ minWidth: 260 }} SelectProps={{ native: true }}
        >
          <option value=""></option>
          {allInvestors.map(i => (
            <option key={i.id} value={i.id}>
              {i.name}{i.company ? ` (${i.company})` : ""}
            </option>
          ))}
        </TextField>

        <IconButton
          aria-label="Ajouter un investisseur"
          size="small"
          color="primary"
          onClick={() => setCreateOpen(true)}
          sx={{ border: '1px solid', borderColor: 'primary.main', borderRadius: 1 }}
        >
          <AddIcon fontSize="small" />
        </IconButton>

        <Button
          size="small" variant="contained"
          onClick={async () => {
            if (!selectedInvestorId) return;
            await attachInvestor(projectId, selectedInvestorId, FIXED_ROLE);
            const fresh = await listProjectInvestors(projectId);
            setProjInvestors(fresh);
            // précharger les jalons de l’investisseur attaché
            try { await refreshMilestones(selectedInvestorId); } catch {}
            setSelectedInvestorId("");
          }}
        >
          Attribuer
        </Button>
      </Box>

      {/* --- Dialog création investisseur --- */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Créer un investisseur</DialogTitle>
        <DialogContent sx={{ pt: 2, display: "grid", gap: 2 }}>
          <TextField
            autoFocus
            label="Nom *"
            required
            size="small"
            value={newInv.name}
            onChange={e => setNewInv(v => ({ ...v, name: e.target.value }))}
          />
          <TextField
            label="Société"
            size="small"
            value={newInv.company}
            onChange={e => setNewInv(v => ({ ...v, company: e.target.value }))}
          />
          <TextField
            label="Email"
            size="small"
            type="email"
            value={newInv.email}
            onChange={e => setNewInv(v => ({ ...v, email: e.target.value }))}
          />
          <TextField
            label="Téléphone"
            size="small"
            value={newInv.phone}
            onChange={e => setNewInv(v => ({ ...v, phone: e.target.value }))}
          />
          <TextField
            label="Notes"
            size="small"
            multiline
            minRows={2}
            value={newInv.notes}
            onChange={e => setNewInv(v => ({ ...v, notes: e.target.value }))}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setCreateOpen(false)}>Annuler</Button>
          <Button
            variant="contained"
            onClick={async () => {
              if (!newInv.name) return;
              const created = await createInvestor(newInv);
              const fresh = await listInvestors();
              setAllInvestors(fresh);
              const newId = created?.id ?? fresh.find(i => i.email === newInv.email && i.name === newInv.name)?.id;
              if (newId) setSelectedInvestorId(String(newId));
              setNewInv({ name: "", company: "", email: "", phone: "", notes: "" });
              setCreateOpen(false);
            }}
          >
            Créer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Liste investisseurs + jalons */}
      <Stack spacing={1}>
        {projInvestors.map(inv => (
          <Card key={inv.id} sx={{ p: 1.5 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Box>
                <Typography fontWeight={700}>{inv.name}{inv.company && ` — ${inv.company}`}</Typography>
                <Typography variant="caption">
                  {inv.email || "—"} • {inv.phone || "—"} • rôle: {FIXED_ROLE}
                </Typography>
              </Box>
              <Button color="error" size="small" onClick={async () => {
                await detachInvestor(projectId, inv.id);
                setProjInvestors(await listProjectInvestors(projectId));
                // enlever ses jalons du state
                setMsByInvestor(s => {
                  const n = { ...s };
                  delete n[inv.id];
                  return n;
                });
              }}>
                Retirer
              </Button>
            </Box>

            <Divider sx={{ my: 1 }} />

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="subtitle2">Jalons</Typography>
              <IconButton size="small" onClick={() => refreshMilestones(inv.id)}>
                <RefreshIcon fontSize="small" />
              </IconButton>
              <Box sx={{ flex: 1 }} />
              <Button size="small" startIcon={<AddIcon />} onClick={() => openMsDialog(inv.id)}>
                Ajouter un jalon
              </Button>
            </Box>

            <Stack spacing={0.5} sx={{ my: 1 }}>
              {(msByInvestor[inv.id] || []).map(m => {
                const internal = internalFromAny(m.status); // interne pour select/couleur
                const labelFR = REVERSE_STATUS_MAP[internal] || m.status; // libellé pour chip

                return (
                  <Box key={m.id} sx={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 260 }}>
                      <Chip size="small" label={labelFR} color={getStepColor(internal)} />
                      <Typography variant="body2" fontWeight={600}>{m.label}</Typography>
                      <Typography variant="caption" sx={{ color: "#777" }}>
                        {m.due_date ? new Date(m.due_date).toLocaleDateString('fr-FR') : ''}
                      </Typography>
                      {m.comment && <Typography variant="caption" sx={{ fontStyle: "italic" }}>{m.comment}</Typography>}
                    </Box>

                    {/* Select pour modifier le statut (optimistic UI + fallback routes) */}
                    <TextField
                      label="Statut"
                      select
                      size="small"
                      value={internal}
                      onChange={async (e) => {
                        const newInternal = e.target.value;

                        // optimistic UI
                        setMsByInvestor(prev => {
                          const next = { ...prev };
                          next[inv.id] = (next[inv.id] || []).map(x =>
                            x.id === m.id ? { ...x, status: newInternal } : x
                          );
                          return next;
                        });

                        try {
                          await updateMilestoneSmart(projectId, inv.id, m.id, newInternal);
                          // sécurise: recharge après succès
                          await refreshMilestones(inv.id);
                        } catch (err) {
                          console.error("Maj statut jalon:", err);
                          alert("Impossible de modifier le statut de ce jalon.");
                          // rollback si erreur
                          setMsByInvestor(prev => {
                            const next = { ...prev };
                            next[inv.id] = (next[inv.id] || []).map(x =>
                              x.id === m.id ? { ...x, status: internal } : x
                            );
                            return next;
                          });
                        }
                      }}
                      SelectProps={{ native: true }}
                      sx={{ minWidth: 160 }}
                    >
                      {Object.entries(STATUS_MAP).map(([label, value]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </TextField>

                    <IconButton
                      size="small"
                      color="error"
                      onClick={async () => {
                        try {
                          await deleteMilestone(projectId, inv.id, m.id);
                          refreshMilestones(inv.id);
                        } catch (err) {
                          console.error("Erreur suppression jalon:", err);
                          alert("Impossible de supprimer ce jalon.");
                        }
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                );
              })}
            </Stack>
          </Card>
        ))}
      </Stack>

      {/* Dialog ajout jalon */}
      <Dialog
        open={!!msDialogOpenFor}
        onClose={() => setMsDialogOpenFor(null)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Ajouter un jalon</DialogTitle>
        <DialogContent sx={{ pt: 2, display: "grid", gap: 2 }}>
          <TextField
            label="Libellé *"
            required
            size="small"
            value={msForm.label}
            onChange={e => setMsForm(f => ({ ...f, label: e.target.value }))}
          />
          <TextField
            label="Échéance"
            type="date"
            size="small"
            value={msForm.due_date}
            onChange={e => setMsForm(f => ({ ...f, due_date: e.target.value }))}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Statut"
            select
            size="small"
            value={msForm.status} // interne
            onChange={e => setMsForm(f => ({ ...f, status: e.target.value }))}
            SelectProps={{ native: true }}
          >
            {Object.entries(STATUS_MAP).map(([label, value]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </TextField>
          <TextField
            label="Commentaire"
            size="small"
            value={msForm.comment}
            onChange={e => setMsForm(f => ({ ...f, comment: e.target.value }))}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setMsDialogOpenFor(null)}>Annuler</Button>
          <Button variant="contained" color="success" onClick={submitMilestone}>
            Ajouter
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
