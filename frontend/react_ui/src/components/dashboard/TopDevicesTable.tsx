import React, { useState } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  LinearProgress,
} from '@mui/material';
import {
  NetworkCheck,
  Speed,
  Warning,
  Info,
  Refresh,
} from '@mui/icons-material';
import { Device } from '../../types';

interface TopDevicesTableProps {
  devices: Device[];
  onRefresh?: () => void;
}

type SortField = 'hostname' | 'traffic' | 'cpu' | 'memory';

interface SortState {
  field: SortField;
  direction: 'asc' | 'desc';
}

const TopDevicesTable: React.FC<TopDevicesTableProps> = ({
  devices,
  onRefresh,
}) => {
  const [sort, setSort] = useState<SortState>({
    field: 'traffic',
    direction: 'desc',
  });

  const handleSort = (field: SortField) => {
    setSort((prev) => ({
      field,
      direction: prev.field === field && prev.direction === 'desc' ? 'asc' : 'desc',
    }));
  };

  const sortedDevices = [...devices].sort((a, b) => {
    const factor = sort.direction === 'asc' ? 1 : -1;
    
    switch (sort.field) {
      case 'hostname':
        return factor * a.hostname.localeCompare(b.hostname);
      case 'traffic':
        return factor * (a.networkUsage.total - b.networkUsage.total);
      case 'cpu':
        return factor * (a.cpuUsage - b.cpuUsage);
      case 'memory':
        return factor * (a.memoryUsage - b.memoryUsage);
      default:
        return 0;
    }
  });

  const formatTraffic = (bytes: number): string => {
    if (bytes >= 1e9) return `${(bytes / 1e9).toFixed(2)} GB`;
    if (bytes >= 1e6) return `${(bytes / 1e6).toFixed(2)} MB`;
    if (bytes >= 1e3) return `${(bytes / 1e3).toFixed(2)} KB`;
    return `${bytes} B`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'success';
      case 'warning':
        return 'warning';
      case 'error':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Top Devices by Usage
        </Typography>
        {onRefresh && (
          <Tooltip title="Refresh">
            <IconButton onClick={onRefresh} size="small">
              <Refresh />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={sort.field === 'hostname'}
                  direction={sort.direction}
                  onClick={() => handleSort('hostname')}
                >
                  Device
                </TableSortLabel>
              </TableCell>
              <TableCell align="right">
                <TableSortLabel
                  active={sort.field === 'traffic'}
                  direction={sort.direction}
                  onClick={() => handleSort('traffic')}
                >
                  Traffic
                </TableSortLabel>
              </TableCell>
              <TableCell align="right">
                <TableSortLabel
                  active={sort.field === 'cpu'}
                  direction={sort.direction}
                  onClick={() => handleSort('cpu')}
                >
                  CPU
                </TableSortLabel>
              </TableCell>
              <TableCell align="right">
                <TableSortLabel
                  active={sort.field === 'memory'}
                  direction={sort.direction}
                  onClick={() => handleSort('memory')}
                >
                  Memory
                </TableSortLabel>
              </TableCell>
              <TableCell align="right">Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedDevices.map((device) => (
              <TableRow key={device.id}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <NetworkCheck sx={{ mr: 1, color: 'primary.main' }} />
                    <Box>
                      <Typography variant="body2">
                        {device.hostname}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {device.ip_address}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell align="right">
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                    <Speed sx={{ mr: 1, color: 'info.main' }} />
                    <Typography variant="body2">
                      {formatTraffic(device.networkUsage.total)}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell align="right">
                  <Box>
                    <Typography variant="body2">
                      {device.cpuUsage}%
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={device.cpuUsage}
                      sx={{ height: 4, borderRadius: 2 }}
                    />
                  </Box>
                </TableCell>
                <TableCell align="right">
                  <Box>
                    <Typography variant="body2">
                      {device.memoryUsage}%
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={device.memoryUsage}
                      sx={{ height: 4, borderRadius: 2 }}
                    />
                  </Box>
                </TableCell>
                <TableCell align="right">
                  <Chip
                    size="small"
                    label={device.status}
                    color={getStatusColor(device.status)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default TopDevicesTable;