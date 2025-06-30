import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Button,
  Grid,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Avatar,
  Divider,
  Stack,
  Paper
} from '@mui/material';
import {
  CalendarToday,
  AccessTime,
  LocationOn,
  Person,
  AttachMoney,
  Category,
  Info,
  ArrowBack,
  Schedule
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchItemById } from '../store/slices/itemsSlice';
import { createAppointment } from '../store/slices/appointmentsSlice';

const ItemDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentItem, loading, error } = useAppSelector((state) => state.items);
  const { user } = useAppSelector((state) => state.auth);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [appointmentData, setAppointmentData] = useState({
    startTime: '',
    endTime: '',
    location: '',
    notes: ''
  });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      dispatch(fetchItemById(id));
    }
  }, [dispatch, id]);

  const handleBookAppointment = () => {
    setBookingDialogOpen(true);
    setBookingError(null);
  };

  const handleCloseBookingDialog = () => {
    setBookingDialogOpen(false);
    setAppointmentData({
      startTime: '',
      endTime: '',
      location: '',
      notes: ''
    });
    setBookingError(null);
  };

  const handleSubmitAppointment = async () => {
    if (!appointmentData.startTime || !appointmentData.endTime || !id) {
      setBookingError('Please select both start and end times');
      return;
    }

    const startTime = new Date(appointmentData.startTime);
    const endTime = new Date(appointmentData.endTime);

    if (endTime <= startTime) {
      setBookingError('End time must be after start time');
      return;
    }

    if (startTime <= new Date()) {
      setBookingError('Appointment cannot be scheduled in the past');
      return;
    }

    setBookingLoading(true);
    setBookingError(null);

    try {
      await dispatch(createAppointment({
        itemId: id,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        location: appointmentData.location,
        notes: appointmentData.notes
      })).unwrap();

      handleCloseBookingDialog();
      navigate('/appointments');
    } catch (error: any) {
      setBookingError(error || 'Failed to book appointment');
    } finally {
      setBookingLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'success';
      case 'RESERVED':
        return 'warning';
      case 'SOLD':
        return 'error';
      case 'PENDING_PICKUP':
        return 'info';
      default:
        return 'default';
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const isOwner = user && currentItem && user.id === currentItem.seller.id;
  const canBookAppointment = user && currentItem && 
    user.id !== currentItem.seller.id && 
    currentItem.status === 'AVAILABLE';

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/items')}>
          Back to Items
        </Button>
      </Box>
    );
  }

  if (!currentItem) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning" sx={{ mb: 3 }}>
          Item not found
        </Alert>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/items')}>
          Back to Items
        </Button>
      </Box>
    );
  }

  const images = currentItem.images ? JSON.parse(currentItem.images) : [];
  const tags = currentItem.tags ? JSON.parse(currentItem.tags) : [];

  return (
    <Box sx={{ p: 3 }}>
      <Button 
        startIcon={<ArrowBack />} 
        onClick={() => navigate('/items')}
        sx={{ mb: 3 }}
      >
        Back to Items
      </Button>

      <Grid container spacing={4}>
        {/* Images Section */}
        <Grid item xs={12} md={6}>
          <Card>
            {images.length > 0 ? (
              <CardMedia
                component="img"
                height="400"
                image={images[0]}
                alt={currentItem.title}
                sx={{ objectFit: 'cover' }}
              />
            ) : (
              <Box
                sx={{
                  height: 400,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'grey.100'
                }}
              >
                <Typography variant="h6" color="text.secondary">
                  No Image Available
                </Typography>
              </Box>
            )}
          </Card>
        </Grid>

        {/* Item Details Section */}
        <Grid item xs={12} md={6}>
          <Stack spacing={3}>
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Typography variant="h4" component="h1">
                  {currentItem.title}
                </Typography>
                <Chip
                  label={currentItem.status}
                  color={getStatusColor(currentItem.status) as any}
                  size="medium"
                />
              </Box>

              <Typography variant="h5" color="primary" sx={{ mb: 2 }}>
                {formatPrice(currentItem.price)}
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Category sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body1" color="text.secondary">
                  {currentItem.category}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Info sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body1" color="text.secondary">
                  Condition: {currentItem.condition}
                </Typography>
              </Box>

              {currentItem.location && (
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <LocationOn sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body1" color="text.secondary">
                    {currentItem.location}
                  </Typography>
                </Box>
              )}
            </Box>

            <Divider />

            {/* Seller Information */}
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Seller Information
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ width: 40, height: 40, mr: 2 }}>
                  {currentItem.seller.firstName[0]}
                </Avatar>
                <Box>
                  <Typography variant="body1" fontWeight="medium">
                    {currentItem.seller.firstName} {currentItem.seller.lastName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    @{currentItem.seller.username}
                  </Typography>
                  {currentItem.seller.university && (
                    <Typography variant="body2" color="text.secondary">
                      {currentItem.seller.university}
                    </Typography>
                  )}
                </Box>
              </Box>
            </Paper>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              {canBookAppointment && (
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<Schedule />}
                  onClick={handleBookAppointment}
                  sx={{ flexGrow: 1 }}
                >
                  Book Appointment
                </Button>
              )}
              {isOwner && (
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate(`/items/${currentItem.id}/edit`)}
                  sx={{ flexGrow: 1 }}
                >
                  Edit Item
                </Button>
              )}
            </Box>
          </Stack>
        </Grid>

        {/* Description Section */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Description
              </Typography>
              <Typography variant="body1" paragraph>
                {currentItem.description}
              </Typography>

              {tags.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Tags:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {tags.map((tag: string, index: number) => (
                      <Chip key={index} label={tag} size="small" variant="outlined" />
                    ))}
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Appointment Booking Dialog */}
      <Dialog open={bookingDialogOpen} onClose={handleCloseBookingDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Book Appointment for "{currentItem.title}"</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            {bookingError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {bookingError}
              </Alert>
            )}

            <TextField
              fullWidth
              label="Start Time"
              type="datetime-local"
              value={appointmentData.startTime}
              onChange={(e) => setAppointmentData({ ...appointmentData, startTime: e.target.value })}
              margin="normal"
              InputLabelProps={{
                shrink: true,
              }}
              inputProps={{
                min: new Date().toISOString().slice(0, 16)
              }}
            />

            <TextField
              fullWidth
              label="End Time"
              type="datetime-local"
              value={appointmentData.endTime}
              onChange={(e) => setAppointmentData({ ...appointmentData, endTime: e.target.value })}
              margin="normal"
              InputLabelProps={{
                shrink: true,
              }}
              inputProps={{
                min: appointmentData.startTime || new Date().toISOString().slice(0, 16)
              }}
            />

            <TextField
              fullWidth
              label="Meeting Location"
              value={appointmentData.location}
              onChange={(e) => setAppointmentData({ ...appointmentData, location: e.target.value })}
              margin="normal"
              placeholder="e.g., Campus Library, Coffee Shop..."
            />

            <TextField
              fullWidth
              label="Notes (Optional)"
              value={appointmentData.notes}
              onChange={(e) => setAppointmentData({ ...appointmentData, notes: e.target.value })}
              margin="normal"
              multiline
              rows={3}
              placeholder="Any additional notes or questions..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseBookingDialog} disabled={bookingLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmitAppointment} 
            variant="contained" 
            disabled={bookingLoading}
            startIcon={bookingLoading ? <CircularProgress size={20} /> : <Schedule />}
          >
            Book Appointment
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ItemDetailPage;