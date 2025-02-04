import React, { useMemo } from 'react';
import { Box, Tooltip, Typography } from '@mui/material';
import {
  Router,
  Storage,
  Computer,
  DeviceHub,
  Print,
  Smartphone,
  QuestionMark,
} from '@mui/icons-material';

interface NetworkNodeProps {
  type: string;
  status: string;
  hostname: string;
  ipAddress: string;
  metrics?: {
    cpu: number;
    memory: number;
    traffic: number;
  };
  size?: number;
  selected?: boolean;
  showLabel?: boolean;
  showMetrics?: boolean;
}

const NetworkNode: React.FC<NetworkNodeProps> = ({
  type,
  status,
  hostname,
  ipAddress,
  metrics,
  size = 40,
  selected = false,
  showLabel = true,
  showMetrics = false,
}) => {
  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType.toLowerCase()) {
      case 'router':
        return Router;
      case 'server':
        return Storage;
      case 'workstation':
        return Computer;
      case 'switch':
        return DeviceHub;
      case 'printer':
        return Print;
      case 'mobile':
        return Smartphone;
      default:
        return QuestionMark;
    }
  };

  const getStatusColor = (deviceStatus: string) => {
    switch (deviceStatus.toLowerCase()) {
      case 'online':
        return '#4caf50';
      case 'offline':
        return '#f44336';
      case 'warning':
        return '#ff9800';
      default:
        return '#9e9e9e';
    }
  };

  const Icon = useMemo(() => getDeviceIcon(type), [type]);
  const statusColor = useMemo(() => getStatusColor(status), [status]);

  const tooltipContent = (
    <Box sx={{ p: 1 }}>
      <Typography variant="subtitle2">{hostname}</Typography>
      <Typography variant="body2" color="textSecondary">
        {ipAddress}
      </Typography>
      {metrics && (
        <Box sx={{ mt: 1 }}>
          <Typography variant="body2">
            CPU: {metrics.cpu}%
          </Typography>
          <Typography variant="body2">
            Memory: {metrics.memory}%
          </Typography>
          <Typography variant="body2">
            Traffic: {metrics.traffic} Mbps
          </Typography>
        </Box>
      )}
    </Box>
  );

  return (
    <Tooltip title={tooltipContent} arrow>
      <Box
        sx={{
          position: 'relative',
          display: 'inline-flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Box
          sx={{
            width: size,
            height: size,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'background.paper',
            border: 2,
            borderColor: selected ? 'primary.main' : 'transparent',
            boxShadow: selected ? 4 : 1,
            position: 'relative',
            '&::after': {
              content: '""',
              position: 'absolute',
              top: -2,
              right: -2,
              width: 12,
              height: 12,
              bgcolor: statusColor,
              borderRadius: '50%',
              border: '2px solid white',
            },
          }}
        >
          <Icon sx={{ fontSize: size * 0.6 }} />
        </Box>
        
        {showLabel && (
          <Typography
            variant="caption"
            sx={{
              mt: 0.5,
              maxWidth: size * 3,
              textAlign: 'center',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {hostname}
          </Typography>
        )}

        {showMetrics && metrics && (
          <Box
            sx={{
              mt: 0.5,
              display: 'flex',
              gap: 0.5,
              fontSize: '0.75rem',
            }}
          >
            <Typography variant="caption">
              {metrics.cpu}%
            </Typography>
            <Typography variant="caption">
              {metrics.memory}%
            </Typography>
          </Box>
        )}
      </Box>
    </Tooltip>
  );
};

export default NetworkNode;