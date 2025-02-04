import React from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Card,
  CardContent,
} from '@mui/material';
import {
  Warning,
  Error as ErrorIcon,
  Info,
  CheckCircle,
  Refresh,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { Alert } from '../../types';

interface AlertsOverviewProps {
  alerts: Alert[];
  onRefresh?: () => void;
}

const AlertsOverview: React.FC<AlertsOverviewProps> = ({
  alerts,
  onRefresh,
}) => {
  const theme = useTheme();

  const getAlertIcon = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return <ErrorIcon sx={{ color: theme.palette.error.main }} />;
      case 'warning':
        return <Warning sx={{ color: theme.palette.warning.main }} />;
      case 'info':
        return <Info sx={{ color: theme.palette.info.main }} />;
      case 'success':
        return <CheckCircle sx={{ color: theme.palette.success.main }} />;
      default:
        return <Info sx={{ color: theme.palette.grey[500] }} />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return 'error';
      case 'warning':
        return 'warning';
      case 'info':
        return 'info';
      case 'success':
        return 'success';
      default:
        return 'default';
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  const groupAlertsBySeverity = () => {
    const groups = alerts.reduce((acc, alert) => {
      const severity = alert.severity.toLowerCase();
      if (!acc[severity]) {
        acc[severity] = 0;
      }
      acc[severity]++;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(groups).map(([severity, count]) => ({
      severity,
      count,
    }));
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Active Alerts
          </Typography>
          {onRefresh && (
            <Tooltip title="Refresh">
              <IconButton onClick={onRefresh} size="small">
                <Refresh />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
          {groupAlertsBySeverity().map(({ severity, count }) => (
            <Chip
              key={severity}
              label={`${severity}: ${count}`}
              color={getSeverityColor(severity)}
              size="small"
            />
          ))}
        </Box>

        {alerts.length === 0 ? (
          <Typography color="textSecondary" align="center" sx={{ py: 4 }}>
            No active alerts
          </Typography>
        ) : (
          <List>
            {alerts.map((alert) => (
              <ListItem
                key={alert.id}
                sx={{
                  bgcolor: `${theme.palette[getSeverityColor(alert.severity)].main}10`,
                  borderRadius: 1,
                  mb: 1,
                }}
              >
                <ListItemIcon>
                  {getAlertIcon(alert.severity)}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2">
                        {alert.title}
                      </Typography>
                      <Chip
                        label={alert.severity}
                        color={getSeverityColor(alert.severity)}
                        size="small"
                      />
                    </Box>
                  }
                  secondary={
                    <>
                      <Typography variant="caption" display="block">
                        {alert.message}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {formatTime(alert.timestamp)}
                      </Typography>
                    </>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );
};

export default AlertsOverview;