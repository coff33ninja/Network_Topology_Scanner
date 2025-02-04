import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Alert, ApiResponse } from '../../types';
import api from '../../services/api';

interface AlertState {
  alerts: Alert[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
}

const initialState: AlertState = {
  alerts: [],
  unreadCount: 0,
  loading: false,
  error: null,
};

export const fetchAlerts = createAsyncThunk(
  'alerts/fetchAlerts',
  async () => {
    const response = await api.get<ApiResponse<Alert[]>>('/alerts');
    return response.data.data;
  }
);

export const acknowledgeAlert = createAsyncThunk(
  'alerts/acknowledgeAlert',
  async (alertId: number) => {
    const response = await api.post<ApiResponse<Alert>>(
      `/alerts/${alertId}/acknowledge`
    );
    return response.data.data;
  }
);

export const deleteAlert = createAsyncThunk(
  'alerts/deleteAlert',
  async (alertId: number) => {
    await api.delete(`/alerts/${alertId}`);
    return alertId;
  }
);

const alertSlice = createSlice({
  name: 'alerts',
  initialState,
  reducers: {
    addAlert: (state, action) => {
      state.alerts.unshift(action.payload);
      if (!action.payload.acknowledged) {
        state.unreadCount += 1;
      }
    },
    clearAlerts: (state) => {
      state.alerts = [];
      state.unreadCount = 0;
    },
    markAllAsRead: (state) => {
      state.alerts = state.alerts.map(alert => ({
        ...alert,
        acknowledged: true
      }));
      state.unreadCount = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAlerts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAlerts.fulfilled, (state, action) => {
        state.loading = false;
        state.alerts = action.payload;
        state.unreadCount = action.payload.filter(
          alert => !alert.acknowledged
        ).length;
      })
      .addCase(fetchAlerts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch alerts';
      })
      .addCase(acknowledgeAlert.fulfilled, (state, action) => {
        const index = state.alerts.findIndex(
          alert => alert.id === action.payload.id
        );
        if (index !== -1) {
          state.alerts[index] = action.payload;
          if (state.unreadCount > 0) {
            state.unreadCount -= 1;
          }
        }
      })
      .addCase(deleteAlert.fulfilled, (state, action) => {
        const deletedAlert = state.alerts.find(
          alert => alert.id === action.payload
        );
        state.alerts = state.alerts.filter(
          alert => alert.id !== action.payload
        );
        if (deletedAlert && !deletedAlert.acknowledged) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      });
  },
});

export const { addAlert, clearAlerts, markAllAsRead } = alertSlice.actions;

export default alertSlice.reducer;