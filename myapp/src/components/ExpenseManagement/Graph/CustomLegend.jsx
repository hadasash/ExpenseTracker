import React from 'react';
import { Box, Typography } from '@mui/material';

const CustomLegend = ({ payload, isRTL, t }) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      gap: 1,
      marginRight: isRTL ? '0' : '16px',
    }}
  >
    {payload.map((entry, index) => (
      <Box
        key={`item-${index}`}
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <Box
          sx={{
            width: 12,
            height: 12,
            backgroundColor: entry.color,
            borderRadius: '50%',
          }}
        />
        <Typography variant="body2" color="textPrimary">
          {t(`categoryDetails.categories.${entry.value}`)}
        </Typography>
      </Box>
    ))}
  </Box>
);

export default CustomLegend;
