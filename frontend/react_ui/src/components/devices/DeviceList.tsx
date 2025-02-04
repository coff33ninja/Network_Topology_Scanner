import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Tooltip,
  TablePagination,
  TextField,
  MenuItem,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  PowerSettingsNew as PowerIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { fetchDevices, deleteDevice, wakeDevice } from '../../store/slices/deviceSlice';
import DeviceDialog from './DeviceDialog';
import { Device, DeviceFilter } from '../../types';
import DeleteConfirmDialog from '../common/DeleteConfirmDialog';

const DeviceList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { devices, loading } = useSelector((state: RootState) => state.devices);
  
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<DeviceFilter>({
    type: 'all',
    status: 'all',
    location: 'all',
  });
  
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deviceToDelete, setDeviceToDelete] = useState<Device | null>(null);

  useEffect(() => {
    dispatch(fetchDevices(filters));
  }, [dispatch, filters]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleEditDevice = (device: Device) => {
    setSelectedDevice(device);
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (device: Device) => {
    setDeviceToDelete(device);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (deviceToDelete) {
      await dispatch(deleteDevice(deviceToDelete.id));
      setDeleteDialogOpen(false);
      setDeviceToDelete(null);
    }
  };

  const handleWakeDevice = async (deviceId: number) => {
    await dispatch(wakeDevice(deviceId));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'success';
      case 'offline':
        return 'error';
      case 'waking':
        return 'warning';
      default:
        return 'default';
    }
  };

  const filteredDevices = devices.filter((device) => {
    const matchesSearch = device.hostname.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         device.ip_address.includes(searchTerm) ||
                         device.mac_address.includes(searchTerm);
    
    const matchesType = filters.type === 'all' || device.device_type === filters.type;
    const matchesStatus = filters.status === 'all' || device.status === filters.status;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <Box>
      <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
        <TextField
          size="small"
          placeholder="Search devices..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon color="action" />,
          }}
          sx={{ width: 300 }}
        />
        
        <TextField
          select
          size="small"
          label="Type"
          value={filters.type}
          onChange={(e) => setFilters({ ...filters, type: e.target.value })}
          sx={{ width: 150 }}
        >
          <MenuItem value="all">All Types</MenuItem>
          <MenuItem value="router">Router</MenuItem>
          <MenuItem value="switch">Switch</MenuItem>
          <MenuItem value="server">Server</MenuItem>
          <MenuItem value="workstation">Workstation</MenuItem>
        </TextField>

        <TextField
          select
          size="small"
          label="Status"
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          sx={{ width: 150 }}
        >
          <MenuItem value="all">All Status</MenuItem>
          <MenuItem value="online">Online</MenuItem>
          <MenuItem value="offline">Offline</MenuItem>
          <MenuItem value="waking">Waking</MenuItem>
        </TextField>
      </Box>

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Hostname</TableCell>
                <TableCell>IP Address</TableCell>
                <TableCell>MAC Address</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Last Seen</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredDevices
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((device) => (
                  <TableRow key={device.id}>
                    <TableCell>{device.hostname}</TableCell>
                    <TableCell>{device.ip_address}</TableCell>
                    <TableCell>{device.mac_address}</TableCell>
                    <TableCell>
                      <Chip
                        label={device.device_type}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={device.status}
                        size="small"
                        color={getStatusColor(device.status)}
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(device.last_seen).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          onClick={() => handleEditDevice(device)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Wake on LAN">
                        <IconButton
                          size="small"
                          onClick={() => handleWakeDevice(device.id)}
                          disabled={device.status === 'online'}
                        >
                          <PowerIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteClick(device)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredDevices.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Card>

      <DeviceDialog
        open={isDialogOpen}
        device={selectedDevice}
        onClose={() => {
          setIsDialogOpen(false);
          setSelectedDevice(null);
        }}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        title="Delete Device"
        content={`Are you sure you want to delete ${deviceToDelete?.hostname}?`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteDialogOpen(false)}
      />
    </Box>
  );
};

export default DeviceList;