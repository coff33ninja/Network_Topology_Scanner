import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Divider,
  Tooltip,
  IconButton,
} from '@mui/material';
import {
  DeviceHub,
  Speed,
  Warning,
  Refresh,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

interface NetworkStatusCardProps {
  totalDevices: number;
  onlineDevices: number;
  alertCount: number;
  averageSpeed: number;
  onRefresh?: () => void;
}

const NetworkStatusCard: React.FC<NetworkStatusCardProps> = ({
  totalDevices,
  onlineDevices,
  alertCount,
  averageSpeed,
  onRefresh,
}) => {
  const theme = useTheme();

  const formatSpeed = (speed: number): string => {
    if (speed >= 1000) {
      return `${(speed / 1000).toFixed(1)} Gbps`;
    }
    return `${speed.toFixed(1)} Mbps`;
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Network Status
          </Typography>
          {onRefresh && (
            <Tooltip title="Refresh">
              <IconButton onClick={onRefresh} size="small">
                <Refresh />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Box sx={{ textAlign: 'center', p: 1 }}>
              <DeviceHub
                sx={{
                  fontSize: 40,
                  color: theme.palette.primary.main,
                  mb: 1,
                }}
              />
              <Typography variant="h4">
                {onlineDevices}/{totalDevices}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Devices Online
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={6}>
            <Box sx={{ textAlign: 'center', p: 1 }}>
              <Warning
                sx={{
                  fontSize: 40,
                  color: alertCount > 0 ? theme.palette.warning.main : theme.palette.success.main,
                  mb: 1,
                }}
              />
              <Typography variant="h4">
                {alertCount}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Active Alerts
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 1 }} />
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ textAlign: 'center', p: 1 }}>
              <Speed
                sx={{
                  fontSize: 40,
                  color: theme.palette.info.main,
                  mb: 1,
                }}
              />
              <Typography variant="h4">
                {formatSpeed(averageSpeed)}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Average Network Speed
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default NetworkStatusCard;