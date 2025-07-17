import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';

export default function StateNode({ data }) {
  return (
    <Card variant="outlined" sx={{ minWidth: 150, backgroundColor: '#f7f7f7' }}>
      <CardContent>
        <Typography variant="subtitle2">{data.description}</Typography>
      </CardContent>
    </Card>
  );
}

