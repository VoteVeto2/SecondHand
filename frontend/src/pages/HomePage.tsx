import React from 'react';
import { Typography, Box, Paper } from '@mui/material';

const HomePage: React.FC = () => {
  return (
    <Box>
      <Typography variant="h3" component="h1" gutterBottom>
        Welcome to SecondHand Marketplace
      </Typography>
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Student Second-Hand Marketplace Platform
        </Typography>
        <Typography variant="body1">
          A comprehensive web-based marketplace that accelerates second-hand goods exchange 
          among students by providing real-time availability tracking and seamless appointment 
          booking functionality.
        </Typography>
      </Paper>
    </Box>
  );
};

export default HomePage;