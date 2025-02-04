import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { deviceApi } from '../../services/api';
import { Device, DeviceFilter } from '../../types/device';

interface DeviceState {
  devices: Device[];
  selectedDevice: Device | null;
  loading: boolean;
  error: string | null;
  filters: DeviceFilter;
}

const initialState: DeviceState = {
  devices: [],
  selectedDevice: null,
  loading: false,
  error: null,
  filters: {
    type: 'all',
    status: 'all',
    location: 'all',
  },
};

export const fetchDevices = createAsyncThunk(
  'devices/fetchDevices',
  async (filters: DeviceFilter) => {
    const response = await deviceApi.getDevices(filters);
    return response.data;
  }
);

export const addDevice = createAsyncThunk(
  'devices/addDevice',
  async (device: Partial<Device>) => {
    const response = await deviceApi.addDevice(device);
    return response.data;
  }
);

export const updateDevice = createAsyncThunk(
  'devices/updateDevice',
  async ({ id, data }: { id: number; data: Partial<Device> }) => {
    const response = await deviceApi.updateDevice(id, data);
    return response.data;
  }
);

export const deleteDevice = createAsyncThunk(
  'devices/deleteDevice',
  async (id: number) => {
    await deviceApi.deleteDevice(id);
    return id;
  }
);

export const wakeDevice = createAsyncThunk(
  'devices/wakeDevice',
  async (id: number) => {
    const response = await deviceApi.wakeDevice(id);
    return response.data;
  }
);

const deviceSlice = createSlice({
  name: 'devices',
  initialState,
  reducers: {
    setSelectedDevice: (state, action) => {
      state.selectedDevice = action.payload;
    },
    setFilters: (state, action) => {
      state.filters = action.payload;
    },
    clearSelectedDevice: (state) => {
      state.selectedDevice = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch devices
      .addCase(fetchDevices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDevices.fulfilled, (state, action) => {
        state.loading = false;
        state.devices = action.payload;
      })
      .addCase(fetchDevices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch devices';
      })
      // Add device
      .addCase(addDevice.fulfilled, (state, action) => {
        state.devices.push(action.payload);
      })
      // Update device
      .addCase(updateDevice.fulfilled, (state, action) => {
        const index = state.devices.findIndex(
          (device) => device.id === action.payload.id
        );
        if (index !== -1) {
          state.devices[index] = action.payload;
        }
      })
      // Delete device
      .addCase(deleteDevice.fulfilled, (state, action) => {
        state.devices = state.devices.filter(
          (device) => device.id !== action.payload
        );
      })
      // Wake device
      .addCase(wakeDevice.fulfilled, (state, action) => {
        const device = state.devices.find(
          (device) => device.id === action.payload.id
        );
        if (device) {
          device.status = 'waking';
        }
      });
  },
});

export const { setSelectedDevice, setFilters, clearSelectedDevice } =
  deviceSlice.actions;

export default deviceSlice.reducer;