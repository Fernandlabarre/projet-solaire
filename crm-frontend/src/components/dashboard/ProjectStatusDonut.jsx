// components/dashboard/ProjectStatusDonut.jsx
import * as React from 'react';
import { Box, Paper, Typography, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { PieChart, pieArcLabelClasses } from '@mui/x-charts/PieChart';

export default function ProjectStatusDonut({ counts }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const size = isMobile ? { width: 260, height: 200 } : { width: 400, height: 240 };

  const safeCounts = counts ?? { enCours: 150, terminee: 300, annulee: 50 };

  const data = [
    { id: 0, label: 'En cours', value: safeCounts.enCours ?? 0 },
    { id: 1, label: 'Terminée', value: safeCounts.terminee ?? 0 },
    { id: 2, label: 'Annulée', value: safeCounts.annulee ?? 0 },
  ];

  const total = data.reduce((s, d) => s + d.value, 0);

  const colors = [
    theme.palette.info.main,
    theme.palette.success.main,
    theme.palette.error.main,
  ];

  const valueFormatter = (item) => `${item.value}`;

  return (
    <Paper
      sx={{
        p: { xs: 1.5, md: 2 },
        borderRadius: 3,
        boxShadow: { xs: 1, md: 3 },
        height: '100%',
        m: { xs: 0, md: 2 },
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 1,
        minWidth: { xs: 260, md: 0 },
      }}
    >
      <Typography fontWeight={700}>📊 Répartition des statuts</Typography>

      <Box sx={{ position: 'relative', ...size }}>
        <PieChart
          colors={colors}
          series={[
            {
              data,
              innerRadius: '65%',
              outerRadius: '100%',
              arcLabelMinAngle: 35,
              arcLabelRadius: '60%',
              valueFormatter,
              paddingAngle: 2,
              cornerRadius: 4,
            },
          ]}
          sx={{
            [`& .${pieArcLabelClasses.root}`]: { fontWeight: 'bold' },
          }}
          {...size}
          slotProps={{
            legend: isMobile
              ? { hidden: true }
              : {
                  position: { vertical: 'bottom', horizontal: 'middle' },
                  direction: 'row',
                },
          }}
        />

        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
            fontWeight: 800,
            fontSize: 22,
          }}
        >
          {total}
        </Box>
      </Box>
    </Paper>
  );
}
