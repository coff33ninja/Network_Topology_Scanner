import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Badge,
  Popover,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Button,
  Divider,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  CheckCircle as SuccessIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { fetchAlerts, acknowledgeAlert, deleteAlert, markAllAsRead } from '../../store/slices/alertSlice';
import { Alert } from '../../types';

const AlertCenter: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { alerts, unreadCount } = useSelector((state: RootState) => state.alerts);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  useEffect(() => {
    dispatch(fetchAlerts());
    const interval = setInterval(() => {
      dispatch(fetchAlerts());
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [dispatch]);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleAcknowledge = (alertId: number) => {
    dispatch(acknowledgeAlert(alertId));
  };

  const handleDelete = (alertId: number) => {
    dispatch(deleteAlert(alertId));
  };

  const handleMarkAllRead = () => {
    dispatch(markAllAsRead());
  };

  const getAlertIcon = (severity: string) => {
    switch (severity) {
      case 'error':
        return <ErrorIcon color="error" />;
      case 'warning':
        return <WarningIcon color="warning" />;
      case 'success':
        return <SuccessIcon color="success" />;
      default:
        return <InfoIcon color="info" />;
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
    <>
      <IconButton onClick={handleClick}>
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <Card sx={{ width: 400, maxHeight: 500 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography variant="h6" sx={{ flex: 1 }}>
                Notifications
              </Typography>
              <Button size="small" onClick={handleMarkAllRead}>
                Mark all as read
              </Button>
            </Box>
            <Divider />
            <List sx={{ maxHeight: 400, overflow: 'auto' }}>
              {alerts.length === 0 ? (
                <ListItem>
                  <ListItemText primary="No notifications" />
                </ListItem>
              ) : (
                alerts.map((alert) => (
                  <ListItem
                    key={alert.id}
                    sx={{
                      bgcolor: alert.acknowledged ? 'transparent' : 'action.hover',
                    }}
                    secondaryAction={
                      <IconButton
                        edge="end"
                        size="small"
                        onClick={() => handleDelete(alert.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    }
                  >
                    <ListItemIcon>{getAlertIcon(alert.severity)}</ListItemIcon>
                    <ListItemText
                      primary={alert.title}
                      secondary={
                        <>
                          {alert.message}
                          <Typography
                            variant="caption"
                            display="block"
                            color="textSecondary"
                          >
                            {formatTime(alert.timestamp)}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                ))
              )}
            </List>
          </CardContent>
        </Card>
      </Popover>
    </>
  );
};

export default AlertCenter;