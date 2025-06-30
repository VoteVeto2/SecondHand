import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  IconButton,
  Pagination,
  CircularProgress
} from '@mui/material';
import { Search, FilterList } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchItems, setFilters } from '../store/slices/itemsSlice';
import { ItemCategory, ItemStatus } from '../types';

const ItemsListPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { items, loading, error, pagination, filters } = useAppSelector((state) => state.items);

  const [showFilters, setShowFilters] = useState(false);
  const [localFilters, setLocalFilters] = useState({
    search: '',
    category: '',
    status: '',
    priceMin: '',
    priceMax: ''
  });

  useEffect(() => {
    dispatch(fetchItems({ page: 1, limit: 12, ...filters }));
  }, [dispatch, filters]);

  const handleSearch = () => {
    const filters = {
      ...localFilters,
      status: localFilters.status as any,
      priceMin: localFilters.priceMin ? parseFloat(localFilters.priceMin) : undefined,
      priceMax: localFilters.priceMax ? parseFloat(localFilters.priceMax) : undefined
    };
    dispatch(setFilters(filters));
  };

  const handleClearFilters = () => {
    setLocalFilters({
      search: '',
      category: '',
      status: '',
      priceMin: '',
      priceMax: ''
    });
    dispatch(setFilters({}));
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    dispatch(fetchItems({ page, limit: 12, ...filters }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case ItemStatus.AVAILABLE:
        return 'success';
      case ItemStatus.RESERVED:
        return 'warning';
      case ItemStatus.SOLD:
        return 'error';
      case ItemStatus.PENDING_PICKUP:
        return 'info';
      default:
        return 'default';
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  if (loading && items.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Browse Items
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate('/sell')}
          sx={{ display: { xs: 'none', sm: 'block' } }}
        >
          Sell Item
        </Button>
      </Box>

      {/* Search and Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box display="flex" gap={2} alignItems="center" mb={2}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search items..."
            value={localFilters.search}
            onChange={(e) => setLocalFilters({ ...localFilters, search: e.target.value })}
            InputProps={{
              startAdornment: <Search sx={{ mr: 1 }} />
            }}
          />
          <Button
            variant="contained"
            onClick={handleSearch}
            sx={{ minWidth: 100 }}
          >
            Search
          </Button>
          <IconButton
            onClick={() => setShowFilters(!showFilters)}
            color={showFilters ? 'primary' : 'default'}
          >
            <FilterList />
          </IconButton>
        </Box>

        {showFilters && (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={localFilters.category}
                  label="Category"
                  onChange={(e) => setLocalFilters({ ...localFilters, category: e.target.value })}
                >
                  <MenuItem value="">All Categories</MenuItem>
                  {Object.values(ItemCategory).map((category) => (
                    <MenuItem key={category} value={category}>
                      {category.charAt(0) + category.slice(1).toLowerCase()}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={localFilters.status}
                  label="Status"
                  onChange={(e) => setLocalFilters({ ...localFilters, status: e.target.value })}
                >
                  <MenuItem value="">All Statuses</MenuItem>
                  {Object.values(ItemStatus).map((status) => (
                    <MenuItem key={status} value={status}>
                      {status.charAt(0) + status.slice(1).toLowerCase().replace('_', ' ')}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Min Price"
                type="number"
                value={localFilters.priceMin}
                onChange={(e) => setLocalFilters({ ...localFilters, priceMin: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Max Price"
                type="number"
                value={localFilters.priceMax}
                onChange={(e) => setLocalFilters({ ...localFilters, priceMax: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <Box display="flex" gap={2}>
                <Button onClick={handleSearch} variant="contained">
                  Apply Filters
                </Button>
                <Button onClick={handleClearFilters} variant="outlined">
                  Clear Filters
                </Button>
              </Box>
            </Grid>
          </Grid>
        )}
      </Paper>

      {error && (
        <Paper sx={{ p: 2, mb: 3, bgcolor: 'error.light', color: 'error.contrastText' }}>
          <Typography>Error: {error}</Typography>
        </Paper>
      )}

      {/* Items Grid */}
      <Grid container spacing={3}>
        {items.map((item) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={item.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardMedia
                component="div"
                sx={{
                  height: 200,
                  bgcolor: 'grey.200',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  No Image
                </Typography>
              </CardMedia>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box display="flex" justifyContent="space-between" alignItems="start" mb={1}>
                  <Typography variant="h6" component="h2" noWrap>
                    {item.title}
                  </Typography>
                  <Chip
                    label={item.status.toLowerCase().replace('_', ' ')}
                    color={getStatusColor(item.status) as any}
                    size="small"
                  />
                </Box>
                <Typography variant="h5" color="primary" gutterBottom>
                  {formatPrice(item.price)}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {item.description.length > 100 
                    ? `${item.description.substring(0, 100)}...` 
                    : item.description
                  }
                </Typography>
                <Typography variant="caption" display="block">
                  Category: {item.category.toLowerCase()}
                </Typography>
                <Typography variant="caption" display="block">
                  Condition: {item.condition}
                </Typography>
                <Typography variant="caption" display="block">
                  Seller: {item.seller.firstName} {item.seller.lastName}
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  onClick={() => navigate(`/items/${item.id}`)}
                  fullWidth
                >
                  View Details
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {items.length === 0 && !loading && (
        <Paper sx={{ p: 4, textAlign: 'center', mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            No items found
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Try adjusting your search criteria or filters
          </Typography>
          <Button variant="contained" onClick={() => navigate('/sell')} sx={{ mt: 2 }}>
            Be the first to sell an item!
          </Button>
        </Paper>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={4}>
          <Pagination
            count={pagination.totalPages}
            page={pagination.page}
            onChange={handlePageChange}
            color="primary"
            size="large"
          />
        </Box>
      )}
    </Box>
  );
};

export default ItemsListPage;