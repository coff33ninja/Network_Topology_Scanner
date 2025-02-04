import React, { useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  useTheme,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { fetchDashboardData } from '../../store/slices/dashboardSlice';
import NetworkStatusCard from './NetworkStatusCard';
import DeviceStatusChart from './DeviceStatusChart';
import RecentActivityList from './RecentActivityList';
import TopDevicesTable from './TopDevicesTable';
import AlertsOverview from './AlertsOverview';
import NetworkLoadChart from './NetworkLoadChart';
import LoadingOverlay from '../common/LoadingOverlay';

const Dashboard: React.FC = () => {
  const theme = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const { data, loading, error } = useSelector((state: RootState) => state.dashboard);

  useEffect(() => {
    dispatch(fetchDashboardData());
    
    // Refresh dashboard data every 30 seconds
    const interval = setInterval(() => {
      dispatch(fetchDashboardData());
    }, 30000);

    return () => clearInterval(interval);
  }, [dispatch]);

  if (loading && !data) {
    return <LoadingOverlay message="Loading dashboard..." />;
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">
          Error loading dashboard: {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* Network Status Overview */}
        <Grid item xs={12} md={3}>
          <NetworkStatusCard
            totalDevices={data?.deviceCount || 0}
            onlineDevices={data?.deviceCount || 0}
            alertCount={data?.alertCount || 0}
            averageSpeed={data?.averageSpeed || 0}
          />
        </Grid>

        {/* Network Load Chart */}
        <Grid item xs={12} md={9}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <NetworkLoadChart data={data?.networkActivity || []} />
          </Paper>
        </Grid>

        {/* Device Status Distribution */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <DeviceStatusChart data={data?.deviceStatusDistribution || []} />
          </Paper>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <RecentActivityList activities={data?.recentActivities || []} />
          </Paper>
        </Grid>

        {/* Top Devices */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <TopDevicesTable devices={data?.topDevices || []} />
          </Paper>
        </Grid>

        {/* Alerts Overview */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <AlertsOverview alerts={data?.recentAlerts || []} />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;