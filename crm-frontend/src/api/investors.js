import api from './axios';

/**
 * Mapping UI -> valeurs internes (sans accents) utilisées dans le front.
 * Les libellés FR (gauche) sont ceux affichés dans les selects.
 * Les valeurs internes (droite) sont celles qu'on stocke côté UI.
 */
export const STATUS_MAP = {
  'Payé': 'payee',
  'Pas payé': 'pas_payee',
  'Annulé': 'annule',
  'En cours': 'en_cours',
};

// Inverse: valeur interne -> libellé FR exact attendu par l'ENUM Postgres
export const REVERSE_STATUS_MAP = Object.fromEntries(
  Object.entries(STATUS_MAP).map(([label, value]) => [value, label])
);

// Optionnel: set des libellés FR valides (ENUM DB)
export const DB_STATUS = new Set(['Payé', 'Pas payé', 'Annulé', 'En cours']);

export const listInvestors = () =>
  api.get('/investors').then((r) => r.data);

export const listProjectInvestors = (projectId) =>
  api.get(`/projects/${projectId}/investors`).then((r) => r.data);

export const attachInvestor = (projectId, investor_id, role) =>
  api.post(`/projects/${projectId}/investors`, { investor_id, role }).then((r) => r.data);

export const detachInvestor = (projectId, investor_id) =>
  api.delete(`/projects/${projectId}/investors/${investor_id}`).then((r) => r.data);

export const listMilestones = (projectId, investor_id) =>
  api.get(`/projects/${projectId}/investors/${investor_id}/milestones`).then((r) => r.data);

export const deleteMilestone = (projectId, investorId, milestoneId) =>
  api.delete(`/projects/${projectId}/investors/${investorId}/milestones/${milestoneId}`).then(r => r.data);

/**
 * Ajout jalon : accepte un body avec status interne ("en_cours") ou libellé FR ("En cours").
 * On convertit toujours vers le libellé FR exact pour la DB.
 */
export async function addMilestone(projectId, investorId, body) {
  const statusFR = DB_STATUS.has(body.status) ? body.status : (REVERSE_STATUS_MAP[body.status] ?? body.status);
  const payload = {
    ...body,
    status: statusFR, // "Payé" | "Pas payé" | "Annulé" | "En cours"
  };
  const { data } = await api.post(
    `/projects/${projectId}/investors/${investorId}/milestones`,
    payload
  );
  return data; // 201 + objet créé
}

/**
 * Mise à jour jalon (ex: changer statut).
 * `body.status` peut être interne ("payee") ou FR ("Payé"), on mappe vers FR pour la DB.
 */
export async function updateMilestone(projectId, investorId, milestoneId, body) {
  const statusFR = body.status != null
    ? (DB_STATUS.has(body.status) ? body.status : (REVERSE_STATUS_MAP[body.status] ?? body.status))
    : undefined;

  const payload = {
    ...body,
    ...(statusFR != null ? { status: statusFR } : {}), // n'envoie status que si présent
  };

  const { data } = await api.put(
    `/projects/${projectId}/investors/${investorId}/milestones/${milestoneId}`,
    payload
  );
  return data;
}

export const createInvestor = (payload) =>
  api.post('/investors', payload).then((r) => r.data);
