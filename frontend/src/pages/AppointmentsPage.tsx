import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Grid,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  Avatar,
  Divider
} from '@mui/material';
import {
  CalendarToday,
  AccessTime,
  LocationOn,
  Person,
  AttachMoney,
  Cancel,
  CheckCircle,
  Schedule,
  Edit
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchAppointments, updateAppointment, cancelAppointment } from '../store/slices/appointmentsSlice';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`appointments-tabpanel-${index}`}
      aria-labelledby={`appointments-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const AppointmentsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { appointments, loading, error } = useAppSelector((state) => state.appointments);
  const [tabValue, setTabValue] = useState(0);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [editData, setEditData] = useState({
    status: '',
    notes: '',
    location: ''
  });

  useEffect(() => {
    dispatch(fetchAppointments());
  }, [dispatch]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'warning';
      case 'CONFIRMED':
        return 'info';
      case 'COMPLETED':
        return 'success';
      case 'CANCELLED':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Schedule />;
      case 'CONFIRMED':
        return <CheckCircle />;
      case 'COMPLETED':
        return <CheckCircle />;
      case 'CANCELLED':
        return <Cancel />;
      default:
        return <Schedule />;
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  const isUpcoming = (startTime: string) => {
    return new Date(startTime) > new Date();
  };

  const filterAppointments = (appointments: any[], filter: string) => {
    switch (filter) {
      case 'upcoming':
        return appointments.filter(apt => isUpcoming(apt.startTime) && apt.status !== 'CANCELLED');
      case 'past':
        return appointments.filter(apt => !isUpcoming(apt.startTime) || apt.status === 'COMPLETED');
      case 'cancelled':
        return appointments.filter(apt => apt.status === 'CANCELLED');
      default:
        return appointments;
    }
  };

  const handleEditAppointment = (appointment: any) => {
    setSelectedAppointment(appointment);
    setEditData({
      status: appointment.status,
      notes: appointment.notes || '',
      location: appointment.location || ''
    });
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (selectedAppointment) {
      try {
        await dispatch(updateAppointment({
          id: selectedAppointment.id,
          updates: editData
        })).unwrap();
        setEditDialogOpen(false);
        setSelectedAppointment(null);
        dispatch(fetchAppointments());
      } catch (error) {
        console.error('Failed to update appointment:', error);
      }
    }
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        await dispatch(cancelAppointment(appointmentId)).unwrap();
        dispatch(fetchAppointments());
      } catch (error) {
        console.error('Failed to cancel appointment:', error);
      }
    }
  };

  const renderAppointmentCard = (appointment: any) => {
    const startDateTime = formatDateTime(appointment.startTime);
    const endDateTime = formatDateTime(appointment.endTime);
    const isUserSeller = appointment.seller.id === appointment.buyerId; // This needs to be fixed in the logic
    const otherUser = isUserSeller ? appointment.buyer : appointment.seller;

    return (
      <Grid item xs={12} md={6} lg={4} key={appointment.id}>
        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <CardContent sx={{ flexGrow: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Typography variant="h6" component="h3" sx={{ flexGrow: 1, mr: 1 }}>
                {appointment.item.title}
              </Typography>
              <Chip
                icon={getStatusIcon(appointment.status)}
                label={appointment.status}
                color={getStatusColor(appointment.status) as any}
                size="small"
              />
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <AttachMoney sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                ${appointment.item.price}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <CalendarToday sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {startDateTime.date}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <AccessTime sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {startDateTime.time} - {endDateTime.time}
              </Typography>
            </Box>

            {appointment.location && (
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <LocationOn sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  {appointment.location}
                </Typography>
              </Box>
            )}

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Avatar sx={{ width: 32, height: 32, mr: 1 }}>
                {otherUser.firstName[0]}
              </Avatar>
              <Box>
                <Typography variant="body2" fontWeight="medium">
                  {otherUser.firstName} {otherUser.lastName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {isUserSeller ? 'Buyer' : 'Seller'}
                </Typography>
              </Box>
            </Box>

            {appointment.notes && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontStyle: 'italic' }}>
                Notes: {appointment.notes}
              </Typography>
            )}
          </CardContent>

          <CardActions sx={{ p: 2, pt: 0 }}>
            {appointment.status !== 'CANCELLED' && appointment.status !== 'COMPLETED' && (
              <>
                <Button
                  size="small"
                  startIcon={<Edit />}
                  onClick={() => handleEditAppointment(appointment)}
                >
                  Edit
                </Button>
                <Button
                  size="small"
                  color="error"
                  startIcon={<Cancel />}
                  onClick={() => handleCancelAppointment(appointment.id)}
                >
                  Cancel
                </Button>
              </>
            )}
          </CardActions>
        </Card>
      </Grid>
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const upcomingAppointments = filterAppointments(appointments, 'upcoming');
  const pastAppointments = filterAppointments(appointments, 'past');
  const cancelledAppointments = filterAppointments(appointments, 'cancelled');

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        My Appointments
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="appointments tabs">
          <Tab 
            label={`Upcoming (${upcomingAppointments.length})`} 
            id="appointments-tab-0"
            aria-controls="appointments-tabpanel-0"
          />
          <Tab 
            label={`Past (${pastAppointments.length})`} 
            id="appointments-tab-1"
            aria-controls="appointments-tabpanel-1"
          />
          <Tab 
            label={`Cancelled (${cancelledAppointments.length})`} 
            id="appointments-tab-2"
            aria-controls="appointments-tabpanel-2"
          />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          {upcomingAppointments.length === 0 ? (
            <Grid item xs={12}>
              <Typography variant="body1" color="text.secondary" textAlign="center">
                No upcoming appointments scheduled.
              </Typography>
            </Grid>
          ) : (
            upcomingAppointments.map(renderAppointmentCard)
          )}
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Grid container spacing={3}>
          {pastAppointments.length === 0 ? (
            <Grid item xs={12}>
              <Typography variant="body1" color="text.secondary" textAlign="center">
                No past appointments found.
              </Typography>
            </Grid>
          ) : (
            pastAppointments.map(renderAppointmentCard)
          )}
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Grid container spacing={3}>
          {cancelledAppointments.length === 0 ? (
            <Grid item xs={12}>
              <Typography variant="body1" color="text.secondary" textAlign="center">
                No cancelled appointments found.
              </Typography>
            </Grid>
          ) : (
            cancelledAppointments.map(renderAppointmentCard)
          )}
        </Grid>
      </TabPanel>

      {/* Edit Appointment Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Appointment</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Status</InputLabel>
              <Select
                value={editData.status}
                onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                label="Status"
              >
                <MenuItem value="PENDING">Pending</MenuItem>
                <MenuItem value="CONFIRMED">Confirmed</MenuItem>
                <MenuItem value="COMPLETED">Completed</MenuItem>
                <MenuItem value="CANCELLED">Cancelled</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Location"
              value={editData.location}
              onChange={(e) => setEditData({ ...editData, location: e.target.value })}
              margin="normal"
            />

            <TextField
              fullWidth
              label="Notes"
              value={editData.notes}
              onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
              margin="normal"
              multiline
              rows={3}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveEdit} variant="contained">Save Changes</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AppointmentsPage;