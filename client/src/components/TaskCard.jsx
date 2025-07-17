import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';

export default function TaskCard({ data }) {
  return (
    <Card variant="outlined" sx={{ minWidth: 200 }}>
      <CardContent>
        <Typography variant="h6">{data.title}</Typography>
        <Typography variant="body2">{data.description}</Typography>
      </CardContent>
    </Card>
  );
}
