import { configureStore } from '@reduxjs/toolkit';
import deviceReducer from './slices/deviceSlice';
import networkReducer from './slices/networkSlice';
import scanReducer from './slices/scanSlice';
import dashboardReducer from './slices/dashboardSlice';
import locationReducer from './slices/locationSlice';
import alertReducer from './slices/alertSlice';

export const store = configureStore({
  reducer: {
    devices: deviceReducer,
    network: networkReducer,
    scan: scanReducer,
    dashboard: dashboardReducer,
    locations: locationReducer,
    alerts: alertReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
      thunk: true,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;