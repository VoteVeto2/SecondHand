import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert,
  CircularProgress,
  InputAdornment
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { createItem } from '../store/slices/itemsSlice';
import { ItemCategory } from '../types';

const CreateItemPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.items);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    condition: '',
    location: '',
    tags: ''
  });

  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (validationErrors.length > 0) {
      setValidationErrors([]);
    }
  };

  const validateForm = () => {
    const errors: string[] = [];

    if (formData.title.trim().length < 3) {
      errors.push('Title must be at least 3 characters');
    }

    if (formData.description.trim().length < 10) {
      errors.push('Description must be at least 10 characters');
    }

    const price = parseFloat(formData.price);
    if (isNaN(price) || price <= 0) {
      errors.push('Price must be a positive number');
    }

    if (!formData.category) {
      errors.push('Category is required');
    }

    if (formData.condition.trim().length < 3) {
      errors.push('Condition description is required');
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const itemData = new FormData();
    itemData.append('title', formData.title);
    itemData.append('description', formData.description);
    itemData.append('price', formData.price);
    itemData.append('category', formData.category);
    itemData.append('condition', formData.condition);
    itemData.append('location', formData.location);
    
    // Convert tags string to array
    const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
    itemData.append('tags', JSON.stringify(tagsArray));

    const result = await dispatch(createItem(itemData));
    
    if (createItem.fulfilled.match(result)) {
      navigate('/items');
    }
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Sell an Item
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
        List your item for sale in the SecondHand marketplace
      </Typography>

      <Paper sx={{ p: 3 }}>
        {(error || validationErrors.length > 0) && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error || validationErrors.join(', ')}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Item Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                disabled={loading}
                placeholder="e.g., iPhone 13 Pro - Excellent Condition"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                multiline
                rows={4}
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                disabled={loading}
                placeholder="Describe your item in detail. Include any important information about condition, usage, included accessories, etc."
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Price"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleChange}
                disabled={loading}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Category</InputLabel>
                <Select
                  name="category"
                  value={formData.category}
                  label="Category"
                  onChange={(e) => handleChange(e as any)}
                  disabled={loading}
                >
                  {Object.values(ItemCategory).map((category) => (
                    <MenuItem key={category} value={category}>
                      {category.charAt(0) + category.slice(1).toLowerCase()}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Condition"
                name="condition"
                value={formData.condition}
                onChange={handleChange}
                disabled={loading}
                placeholder="e.g., Like New, Good, Fair, Poor"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Location (Optional)"
                name="location"
                value={formData.location}
                onChange={handleChange}
                disabled={loading}
                placeholder="e.g., Dorm Building A, Campus Center"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Tags (Optional)"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                disabled={loading}
                placeholder="e.g., gaming, laptop, textbook, furniture (comma-separated)"
                helperText="Add tags to help buyers find your item. Separate multiple tags with commas."
              />
            </Grid>

            <Grid item xs={12}>
              <Box display="flex" gap={2} justifyContent="flex-end">
                <Button
                  variant="outlined"
                  onClick={() => navigate('/items')}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  size="large"
                >
                  {loading ? <CircularProgress size={24} /> : 'List Item'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Box>
  );
};

export default CreateItemPage;