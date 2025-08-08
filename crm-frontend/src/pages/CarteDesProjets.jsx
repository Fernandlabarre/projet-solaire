// src/pages/CarteDesProjets.jsx
import { useEffect, useState } from "react";
import { Box, Typography, Paper } from "@mui/material";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import api from "../api/axios";
import SidebarLayout from "../components/layout/SidebarLayout";

// Ajuste la vue automatiquement
function FitBounds({ projects }) {
  const map = useMap();
  useEffect(() => {
    const points = projects
      .filter((p) => p.latitude && p.longitude)
      .map((p) => [parseFloat(p.latitude), parseFloat(p.longitude)]);
    if (points.length === 1) map.setView(points[0], 13);
    else if (points.length > 1) map.fitBounds(points, { padding: [30, 30] });
    else map.setView([46.603354, 1.888334], 6);
  }, [projects, map]);
  return null;
}

// Force Leaflet à recalculer la taille quand le layout change
function AutoResize() {
  const map = useMap();
  useEffect(() => {
    const tick = () => map.invalidateSize();
    // petit délai pour laisser l'animation du drawer finir
    const timeout = setTimeout(tick, 300);
    window.addEventListener("resize", tick);
    return () => {
      clearTimeout(timeout);
      window.removeEventListener("resize", tick);
    };
  }, [map]);
  return null;
}

export default function CarteDesProjets() {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    api.get("/projects").then((res) => setProjects(res.data));
  }, []);

  return (
    <SidebarLayout>
            <MapContainer
              center={[46.603354, 1.888334]}
              zoom={6}
              scrollWheelZoom
              style={{ width: "100%", height: "90vh" }}
            >
              <TileLayer
                attribution="&copy; OpenStreetMap"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {projects.map(
                (p) =>
                  p.latitude &&
                  p.longitude && (
                    <Marker
                      key={p.id}
                      position={[parseFloat(p.latitude), parseFloat(p.longitude)]}
                    >
                      <Popup>
                        <Typography variant="subtitle1" fontWeight={700}>
                          {p.name}
                        </Typography>
                        <Typography variant="body2">
                          <b>Type&nbsp;:</b> {p.type}
                        </Typography>
                        <Typography variant="body2">
                          <b>Adresse&nbsp;:</b> {p.address}
                        </Typography>
                        <Typography variant="body2">
                          <b>Puissance&nbsp;:</b> {p.power} kWc
                        </Typography>
                        <Typography variant="body2">
                          <b>Statut&nbsp;:</b> {p.status}
                        </Typography>
                        <Typography variant="body2">
                          <b>Tél&nbsp;:</b> {p.phone}
                          <br />
                          <b>Email&nbsp;:</b> {p.email}
                        </Typography>
                      </Popup>
                    </Marker>
                  )
              )}

              <FitBounds projects={projects} />
              <AutoResize />
            </MapContainer>
          
    </SidebarLayout>
  );
}
