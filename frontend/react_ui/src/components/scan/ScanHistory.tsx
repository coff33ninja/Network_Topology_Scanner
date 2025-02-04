import React, { useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { fetchScanHistory } from '../../store/slices/scanSlice';
import ScanResultDialog from './ScanResultDialog';
import { useState } from 'react';
import { ScanResult } from '../../types';

const ScanHistory: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { scanHistory, loading } = useSelector((state: RootState) => state.scan);
  const [selectedScan, setSelectedScan] = useState<ScanResult | null>(null);

  useEffect(() => {
    dispatch(fetchScanHistory());
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(fetchScanHistory());
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'running':
        return 'info';
      case 'failed':
        return 'error';
      case 'cancelled':
        return 'warning';
      default:
        return 'default';
    }
  };

  const formatDuration = (start: string, end?: string) => {
    if (!end) return 'N/A';
    const duration = new Date(end).getTime() - new Date(start).getTime();
    const minutes = Math.floor(duration / 60000);
    const seconds = Math.floor((duration % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ flex: 1 }}>
            Scan History
          </Typography>
          <Tooltip title="Refresh">
            <IconButton onClick={handleRefresh} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Start Time</TableCell>
                <TableCell>Duration</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Devices Found</TableCell>
                <TableCell>Details</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {scanHistory.map((scan) => (
                <TableRow key={scan.id}>
                  <TableCell>
                    {new Date(scan.start_time).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {formatDuration(scan.start_time, scan.end_time)}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={scan.type}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={scan.status}
                      size="small"
                      color={getStatusColor(scan.status)}
                    />
                  </TableCell>
                  <TableCell>{scan.devices_found}</TableCell>
                  <TableCell>
                    <Tooltip title="View Details">
                      <IconButton
                        size="small"
                        onClick={() => setSelectedScan(scan)}
                      >
                        <InfoIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <ScanResultDialog
          open={!!selectedScan}
          scan={selectedScan}
          onClose={() => setSelectedScan(null)}
        />
      </CardContent>
    </Card>
  );
};

export default ScanHistory;