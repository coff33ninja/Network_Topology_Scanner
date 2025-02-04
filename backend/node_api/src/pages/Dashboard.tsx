import React, { useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  CircularProgress,
} from '@mui/material';
import {
  DeviceHub,
  Warning,
  Speed,
  NetworkCheck,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { fetchDashboardData } from '../store/slices/dashboardSlice';
import { AppDispatch, RootState } from '../store';
import { startScan } from '../store/slices/scanSlice';

const DashboardCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}> = ({ title, value, icon, color }) => (
  <Card>
    <CardContent>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography color="textSecondary" gutterBottom>
            {title}
          </Typography>
          <Typography variant="h4">{value}</Typography>
        </Box>
        <Box
          sx={{
            backgroundColor: `${color}20`,
            borderRadius: '50%',
            p: 1,
            display: 'flex',
          }}
        >
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const Dashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { data, loading, error } = useSelector(
    (state: RootState) => state.dashboard
  );

  useEffect(() => {
    dispatch(fetchDashboardData());
    const interval = setInterval(() => {
      dispatch(fetchDashboardData());
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [dispatch]);

  const handleStartScan = () => {
    dispatch(startScan({ type: 'full' }));
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Dashboard</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={handleStartScan}
          startIcon={<NetworkCheck />}
        >
          Start Network Scan
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardCard
            title="Total Devices"
            value={data.deviceCount}
            icon={<DeviceHub />}
            color="#3498db"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardCard
            title="Active Alerts"
            value={data.alertCount}
            icon={<Warning />}
            color="#e74c3c"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardCard
            title="Average Speed"
            value={`${data.averageSpeed} Mbps`}
            icon={<Speed />}
            color="#2ecc71"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardCard
            title="Network Load"
            value={`${data.networkLoad}%`}
            icon={<NetworkCheck />}
            color="#f1c40f"
          />
        </Grid>

        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Network Activity
              </Typography>
              <LineChart
                width={800}
                height={300}
                data={data.networkActivity}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#3498db"
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Alerts
              </Typography>
              {data.recentAlerts.map((alert, index) => (
                <Box
                  key={index}
                  sx={{
                    p: 1,
                    mb: 1,
                    backgroundColor: `${alert.severity}10`,
                    borderLeft: `4px solid ${alert.severity}`,
                    borderRadius: 1,
                  }}
                >
                  <Typography variant="subtitle2">{alert.title}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    {alert.timestamp}
                  </Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;