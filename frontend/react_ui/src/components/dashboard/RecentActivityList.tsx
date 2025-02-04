import React from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Typography,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  DeviceHub,
  Warning,
  CheckCircle,
  Info,
  NetworkCheck,
  Storage,
  Refresh,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { Activity } from '../../types';

interface RecentActivityListProps {
  activities: Activity[];
  onRefresh?: () => void;
}

const RecentActivityList: React.FC<RecentActivityListProps> = ({
  activities,
  onRefresh,
}) => {
  const theme = useTheme();

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'device_added':
        return <DeviceHub sx={{ color: theme.palette.success.main }} />;
      case 'device_removed':
        return <DeviceHub sx={{ color: theme.palette.error.main }} />;
      case 'alert':
        return <Warning sx={{ color: theme.palette.warning.main }} />;
      case 'scan_completed':
        return <NetworkCheck sx={{ color: theme.palette.info.main }} />;
      case 'system':
        return <Storage sx={{ color: theme.palette.primary.main }} />;
      default:
        return <Info sx={{ color: theme.palette.grey[500] }} />;
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

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Recent Activity
        </Typography>
        {onRefresh && (
          <Tooltip title="Refresh">
            <IconButton onClick={onRefresh} size="small">
              <Refresh />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {activities.length === 0 ? (
        <Typography color="textSecondary" align="center" sx={{ py: 4 }}>
          No recent activity
        </Typography>
      ) : (
        <List>
          {activities.map((activity, index) => (
            <React.Fragment key={activity.id}>
              <ListItem>
                <ListItemIcon>
                  {getActivityIcon(activity.type)}
                </ListItemIcon>
                <ListItemText
                  primary={activity.message}
                  secondary={formatTime(activity.timestamp)}
                  primaryTypographyProps={{
                    variant: 'body2',
                    color: 'textPrimary',
                  }}
                  secondaryTypographyProps={{
                    variant: 'caption',
                    color: 'textSecondary',
                  }}
                />
                {activity.status && (
                  <Box sx={{ ml: 2 }}>
                    <Tooltip title={activity.status}>
                      <CheckCircle
                        sx={{
                          color: activity.status === 'success'
                            ? theme.palette.success.main
                            : theme.palette.error.main,
                        }}
                      />
                    </Tooltip>
                  </Box>
                )}
              </ListItem>
              {index < activities.length - 1 && <Divider variant="inset" component="li" />}
            </React.Fragment>
          ))}
        </List>
      )}
    </Box>
  );
};

export default RecentActivityList;