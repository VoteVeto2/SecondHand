import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Container, Typography, Paper, Box } from '@mui/material';
import { store } from './store';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

function HomePage() {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
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
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            🎯 Features:
          </Typography>
          <ul>
            <li>Real-time availability management</li>
            <li>Automated appointment booking</li>
            <li>Email notifications</li>
            <li>Mobile-responsive design</li>
            <li>University SSO integration</li>
          </ul>
        </Box>
      </Paper>
    </Container>
  );
}

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Routes>
            <Route path="*" element={<HomePage />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </Provider>
  );
}

export default App;