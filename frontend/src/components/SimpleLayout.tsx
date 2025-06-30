import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  Container
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { logoutUser } from '../store/slices/authSlice';

interface LayoutProps {
  children: React.ReactNode;
}

const SimpleLayout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/login');
  };

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, cursor: 'pointer' }}
            onClick={() => handleNavigation('/')}
          >
            SecondHand Marketplace
          </Typography>

          <Button color="inherit" onClick={() => handleNavigation('/items')}>
            Browse Items
          </Button>

          {isAuthenticated && (
            <>
              <Button color="inherit" onClick={() => handleNavigation('/sell')}>
                Sell Item
              </Button>

              <Button color="inherit" onClick={() => handleNavigation('/appointments')}>
                Appointments
              </Button>

              <Button color="inherit" onClick={() => handleNavigation('/profile')}>
                Profile
              </Button>

              <Button color="inherit" onClick={handleLogout}>
                Logout
              </Button>
            </>
          )}

          {!isAuthenticated && (
            <>
              <Button color="inherit" onClick={() => handleNavigation('/login')}>
                Login
              </Button>
              <Button color="inherit" onClick={() => handleNavigation('/register')}>
                Register
              </Button>
            </>
          )}
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {children}
      </Container>
    </Box>
  );
};

export default SimpleLayout;