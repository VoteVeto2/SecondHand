import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { store } from './store';
import { useAppDispatch, useAppSelector } from './hooks/redux';
import { getCurrentUser } from './store/slices/authSlice';
import { socketService } from './services/socket';

// Pages
import AuthLoginPage from './pages/AuthLoginPage';
import AuthRegisterPage from './pages/AuthRegisterPage';
import HomePage from './pages/HomePage';
import ItemsListPage from './pages/ItemsListPage';
import CreateItemPage from './pages/CreateItemPage';

// Components
import SimpleLayout from './components/SimpleLayout';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingSpinner from './components/LoadingSpinner';

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

function AppContent() {
  const dispatch = useAppDispatch();
  const { isAuthenticated, loading, token } = useAppSelector((state) => state.auth);

  console.log('AppContent render:', { isAuthenticated, loading, token });

  useEffect(() => {
    if (token && !isAuthenticated) {
      console.log('Fetching current user...');
      dispatch(getCurrentUser());
    }
  }, [dispatch, token, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      socketService.connect();
    } else {
      socketService.disconnect();
    }

    return () => {
      socketService.disconnect();
    };
  }, [isAuthenticated]);

  if (loading && token) {
    console.log('Showing loading spinner...');
    return <LoadingSpinner />;
  }

  console.log('Rendering routes...');
  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
            !isAuthenticated ? <AuthLoginPage /> : <Navigate to="/" replace />
          }
        />
        <Route
          path="/register"
          element={
            !isAuthenticated ? <AuthRegisterPage /> : <Navigate to="/" replace />
          }
        />
        <Route
          path="/"
          element={
            <SimpleLayout>
              <HomePage />
            </SimpleLayout>
          }
        />
        <Route
          path="/items"
          element={
            <SimpleLayout>
              <ItemsListPage />
            </SimpleLayout>
          }
        />
        <Route
          path="/sell"
          element={
            <SimpleLayout>
              <ProtectedRoute>
                <CreateItemPage />
              </ProtectedRoute>
            </SimpleLayout>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

function App() {
  console.log('App component mounting...');
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AppContent />
      </ThemeProvider>
    </Provider>
  );
}

export default App;