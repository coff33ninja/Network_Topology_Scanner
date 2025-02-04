import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Grid,
  Typography,
  Box,
} from '@mui/material';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store';
import { addDevice, updateDevice } from '../../store/slices/deviceSlice';
import { Device, DeviceFormData } from '../../types';

interface DeviceDialogProps {
  open: boolean;
  device: Device | null;
  onClose: () => void;
}

const deviceTypes = [
  { value: 'router', label: 'Router' },
  { value: 'switch', label: 'Switch' },
  { value: 'server', label: 'Server' },
  { value: 'workstation', label: 'Workstation' },
  { value: 'printer', label: 'Printer' },
  { value: 'other', label: 'Other' },
];

const DeviceDialog: React.FC<DeviceDialogProps> = ({ open, device, onClose }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [formData, setFormData] = useState<DeviceFormData>({
    hostname: '',
    ip_address: '',
    mac_address: '',
    device_type: '',
    location_id: 0,
  });
  const [errors, setErrors] = useState<Partial<DeviceFormData>>({});

  useEffect(() => {
    if (device) {
      setFormData({
        hostname: device.hostname,
        ip_address: device.ip_address,
        mac_address: device.mac_address,
        device_type: device.device_type,
        location_id: device.location_id,
      });
    } else {
      setFormData({
        hostname: '',
        ip_address: '',
        mac_address: '',
        device_type: '',
        location_id: 0,
      });
    }
    setErrors({});
  }, [device]);

  const validateForm = (): boolean => {
    const newErrors: Partial<DeviceFormData> = {};

    if (!formData.hostname) {
      newErrors.hostname = 'Hostname is required';
    }

    if (!formData.ip_address) {
      newErrors.ip_address = 'IP address is required';
    } else if (!/^(\d{1,3}\.){3}\d{1,3}$/.test(formData.ip_address)) {
      newErrors.ip_address = 'Invalid IP address format';
    }

    if (!formData.mac_address) {
      newErrors.mac_address = 'MAC address is required';
    } else if (!/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/.test(formData.mac_address)) {
      newErrors.mac_address = 'Invalid MAC address format';
    }

    if (!formData.device_type) {
      newErrors.device_type = 'Device type is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      if (device) {
        await dispatch(updateDevice({ id: device.id, data: formData }));
      } else {
        await dispatch(addDevice(formData));
      }
      onClose();
    } catch (error) {
      console.error('Error saving device:', error);
    }
  };

  const handleChange = (field: keyof DeviceFormData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData({
      ...formData,
      [field]: event.target.value,
    });
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: undefined,
      });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {device ? 'Edit Device' : 'Add New Device'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Hostname"
                value={formData.hostname}
                onChange={handleChange('hostname')}
                error={!!errors.hostname}
                helperText={errors.hostname}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="IP Address"
                value={formData.ip_address}
                onChange={handleChange('ip_address')}
                error={!!errors.ip_address}
                helperText={errors.ip_address}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="MAC Address"
                value={formData.mac_address}
                onChange={handleChange('mac_address')}
                error={!!errors.mac_address}
                helperText={errors.mac_address}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Device Type"
                value={formData.device_type}
                onChange={handleChange('device_type')}
                error={!!errors.device_type}
                helperText={errors.device_type}
              >
                {deviceTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="caption" color="textSecondary">
                * Required fields
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          {device ? 'Save Changes' : 'Add Device'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeviceDialog;