import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';

export default function StateCard({ data }) {
  return (
    <Card variant="outlined" sx={{ minWidth: 150, background: '#f5f5f5' }}>
      <CardContent>
        <Typography variant="subtitle1">{data.title}</Typography>
        <Typography variant="body2">{data.description}</Typography>
      </CardContent>
    </Card>
  );
}
