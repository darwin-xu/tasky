import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';

export default function TaskNode({ data }) {
  return (
    <Card variant="outlined" sx={{ minWidth: 150 }}>
      <CardContent>
        <Typography variant="subtitle1">{data.title}</Typography>
      </CardContent>
    </Card>
  );
}

