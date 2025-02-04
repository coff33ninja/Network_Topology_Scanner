import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  MenuItem,
} from '@mui/material';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store';
import { addLocation, updateLocation } from '../../store/slices/locationSlice';
import { Location, LocationFormData } from '../../types';

interface LocationDialogProps {
  open: boolean;
  location: Location | null;
  onClose: () => void;
}

const LocationDialog: React.FC<LocationDialogProps> = ({
  open,
  location,
  onClose,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [formData, setFormData] = useState<LocationFormData>({
    name: '',
    description: '',
    network_range: '',
  });
  const [errors, setErrors] = useState<Partial<LocationFormData>>({});

  useEffect(() => {
    if (location) {
      setFormData({
        name: location.name,
        description: location.description || '',
        network_range: location.network_range,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        network_range: '',
      });
    }
    setErrors({});
  }, [location]);

  const validateForm = (): boolean => {
    const newErrors: Partial<LocationFormData> = {};

    if (!formData.name) {
      newErrors.name = 'Name is required';
    }

    if (!formData.network_range) {
      newErrors.network_range = 'Network range is required';
    } else if (!/^(\d{1,3}\.){3}\d{1,3}\/\d{1,2}$/.test(formData.network_range)) {
      newErrors.network_range = 'Invalid network range format (e.g., 192.168.1.0/24)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      if (location) {
        await dispatch(updateLocation({ id: location.id, data: formData }));
      } else {
        await dispatch(addLocation(formData));
      }
      onClose();
    } catch (error) {
      console.error('Error saving location:', error);
    }
  };

  const handleChange = (field: keyof LocationFormData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData({
      ...formData,
      [field]: event.target.value,
    });
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
        {location ? 'Edit Location' : 'Add New Location'}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Location Name"
              value={formData.name}
              onChange={handleChange('name')}
              error={!!errors.name}
              helperText={errors.name}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Network Range"
              value={formData.network_range}
              onChange={handleChange('network_range')}
              error={!!errors.network_range}
              helperText={errors.network_range || 'Example: 192.168.1.0/24'}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={handleChange('description')}
              multiline
              rows={3}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          {location ? 'Save Changes' : 'Add Location'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LocationDialog;