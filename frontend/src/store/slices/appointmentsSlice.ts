import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Appointment, AppointmentStatusType, ApiResponse } from '../../types';
import { apiService } from '../../services/api';

interface AppointmentsState {
  appointments: Appointment[];
  currentAppointment: Appointment | null;
  loading: boolean;
  error: string | null;
}

const initialState: AppointmentsState = {
  appointments: [],
  currentAppointment: null,
  loading: false,
  error: null,
};

export const fetchAppointments = createAsyncThunk(
  'appointments/fetchAppointments',
  async (_, { rejectWithValue }) => {
    try {
      const response: ApiResponse<Appointment[]> = await apiService.get('/appointments');
      if (response.success && response.data) {
        return response.data;
      }
      return rejectWithValue(response.error || 'Failed to fetch appointments');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch appointments');
    }
  }
);

export const fetchAppointmentById = createAsyncThunk(
  'appointments/fetchAppointmentById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response: ApiResponse<Appointment> = await apiService.get(`/appointments/${id}`);
      if (response.success && response.data) {
        return response.data;
      }
      return rejectWithValue(response.error || 'Failed to fetch appointment');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch appointment');
    }
  }
);

export const createAppointment = createAsyncThunk(
  'appointments/createAppointment',
  async (appointmentData: {
    itemId: string;
    startTime: string;
    endTime: string;
    location?: string;
    notes?: string;
  }, { rejectWithValue }) => {
    try {
      const response: ApiResponse<Appointment> = await apiService.post('/appointments', appointmentData);
      if (response.success && response.data) {
        return response.data;
      }
      return rejectWithValue(response.error || 'Failed to create appointment');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create appointment');
    }
  }
);

export const updateAppointment = createAsyncThunk(
  'appointments/updateAppointment',
  async ({ id, updates }: { id: string; updates: any }, { rejectWithValue }) => {
    try {
      const response: ApiResponse<Appointment> = await apiService.put(`/appointments/${id}`, updates);
      if (response.success && response.data) {
        return response.data;
      }
      return rejectWithValue(response.error || 'Failed to update appointment');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update appointment');
    }
  }
);

export const cancelAppointment = createAsyncThunk(
  'appointments/cancelAppointment',
  async (id: string, { rejectWithValue }) => {
    try {
      const response: ApiResponse<any> = await apiService.delete(`/appointments/${id}`);
      if (response.success) {
        return id;
      }
      return rejectWithValue(response.error || 'Failed to cancel appointment');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to cancel appointment');
    }
  }
);

const appointmentsSlice = createSlice({
  name: 'appointments',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAppointments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAppointments.fulfilled, (state, action) => {
        state.loading = false;
        state.appointments = action.payload;
        state.error = null;
      })
      .addCase(fetchAppointments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchAppointmentById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAppointmentById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentAppointment = action.payload;
        state.error = null;
      })
      .addCase(fetchAppointmentById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createAppointment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAppointment.fulfilled, (state, action) => {
        state.loading = false;
        state.appointments.push(action.payload);
        state.error = null;
      })
      .addCase(createAppointment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateAppointment.fulfilled, (state, action) => {
        const index = state.appointments.findIndex(apt => apt.id === action.payload.id);
        if (index !== -1) {
          state.appointments[index] = action.payload;
        }
        if (state.currentAppointment && state.currentAppointment.id === action.payload.id) {
          state.currentAppointment = action.payload;
        }
      })
      .addCase(cancelAppointment.fulfilled, (state, action) => {
        const appointmentId = action.payload;
        const index = state.appointments.findIndex(apt => apt.id === appointmentId);
        if (index !== -1) {
          state.appointments[index] = { ...state.appointments[index], status: 'CANCELLED' as AppointmentStatusType };
        }
        if (state.currentAppointment && state.currentAppointment.id === appointmentId) {
          state.currentAppointment = { ...state.currentAppointment, status: 'CANCELLED' as AppointmentStatusType };
        }
      });
  },
});

export const { clearError } = appointmentsSlice.actions;
export default appointmentsSlice.reducer;