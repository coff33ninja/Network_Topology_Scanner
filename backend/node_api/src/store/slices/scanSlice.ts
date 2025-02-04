import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ScanResult, ScanOptions, ApiResponse } from '../../types';
import api from '../../services/api';

interface ScanState {
  currentScan: ScanResult | null;
  scanHistory: ScanResult[];
  loading: boolean;
  error: string | null;
}

const initialState: ScanState = {
  currentScan: null,
  scanHistory: [],
  loading: false,
  error: null,
};

export const startScan = createAsyncThunk(
  'scan/startScan',
  async (options: ScanOptions) => {
    const response = await api.post<ApiResponse<ScanResult>>('/scan/start', options);
    return response.data.data;
  }
);

export const cancelScan = createAsyncThunk(
  'scan/cancelScan',
  async (scanId: string) => {
    const response = await api.post<ApiResponse<ScanResult>>(`/scan/${scanId}/cancel`);
    return response.data.data;
  }
);

export const fetchScanStatus = createAsyncThunk(
  'scan/fetchStatus',
  async (scanId: string) => {
    const response = await api.get<ApiResponse<ScanResult>>(`/scan/${scanId}/status`);
    return response.data.data;
  }
);

export const fetchScanHistory = createAsyncThunk(
  'scan/fetchHistory',
  async () => {
    const response = await api.get<ApiResponse<ScanResult[]>>('/scan/history');
    return response.data.data;
  }
);

const scanSlice = createSlice({
  name: 'scan',
  initialState,
  reducers: {
    updateScanProgress: (state, action) => {
      if (state.currentScan) {
        state.currentScan = {
          ...state.currentScan,
          ...action.payload,
        };
      }
    },
    clearCurrentScan: (state) => {
      state.currentScan = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(startScan.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(startScan.fulfilled, (state, action) => {
        state.loading = false;
        state.currentScan = action.payload;
        state.scanHistory.unshift(action.payload);
      })
      .addCase(startScan.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to start scan';
      })
      .addCase(cancelScan.fulfilled, (state, action) => {
        if (state.currentScan?.id === action.payload.id) {
          state.currentScan = action.payload;
        }
        const index = state.scanHistory.findIndex(
          scan => scan.id === action.payload.id
        );
        if (index !== -1) {
          state.scanHistory[index] = action.payload;
        }
      })
      .addCase(fetchScanStatus.fulfilled, (state, action) => {
        if (state.currentScan?.id === action.payload.id) {
          state.currentScan = action.payload;
        }
        const index = state.scanHistory.findIndex(
          scan => scan.id === action.payload.id
        );
        if (index !== -1) {
          state.scanHistory[index] = action.payload;
        }
      })
      .addCase(fetchScanHistory.fulfilled, (state, action) => {
        state.scanHistory = action.payload;
      });
  },
});

export const { updateScanProgress, clearCurrentScan } = scanSlice.actions;

export default scanSlice.reducer;