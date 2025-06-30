import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Box,
  CircularProgress,
  Alert,
  Pagination,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Button,
  Chip,
  SelectChangeEvent,
} from '@mui/material';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchItems, setFilters, setPage, clearFilters } from '../store/slices/itemsSlice';
import { Item, ItemStatusType } from '../types';

const statusColors: { [key in ItemStatusType]: 'success' | 'warning' | 'error' | 'info' } = {
  AVAILABLE: 'success',
  RESERVED: 'warning',
  SOLD: 'error',
  PENDING_PICKUP: 'info',
};

const ItemsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items, loading, error, pagination, filters } = useAppSelector((state) => state.items);
  const [searchTerm, setSearchTerm] = useState(filters.search || '');

  useEffect(() => {
    dispatch(fetchItems({ ...filters, page: pagination.page }));
  }, [dispatch, filters, pagination.page]);

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    dispatch(setPage(value));
  };

  const handleFilterChange = (event: SelectChangeEvent<string>) => {
    const { name, value } = event.target;
    dispatch(setFilters({ [name]: value }));
  };
  
  const handleSearch = () => {
    dispatch(setFilters({ search: searchTerm }));
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    dispatch(clearFilters());
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Browse Items
      </Typography>

      <Box component="form" sx={{ mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Search by keyword"
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </Grid>
          <Grid item xs={12} sm={2}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Category</InputLabel>
              <Select
                name="category"
                value={filters.category || ''}
                onChange={handleFilterChange}
                label="Category"
              >
                <MenuItem value=""><em>All</em></MenuItem>
                <MenuItem value="ELECTRONICS">Electronics</MenuItem>
                <MenuItem value="FURNITURE">Furniture</MenuItem>
                <MenuItem value="BOOKS">Books</MenuItem>
                <MenuItem value="CLOTHING">Clothing</MenuItem>
                <MenuItem value="SPORTS">Sports</MenuItem>
                <MenuItem value="APPLIANCES">Appliances</MenuItem>
                <MenuItem value="DECORATIONS">Decorations</MenuItem>
                <MenuItem value="OTHER">Other</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={2}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Status</InputLabel>
              <Select
                name="status"
                value={filters.status || ''}
                onChange={handleFilterChange}
                label="Status"
              >
                <MenuItem value=""><em>All</em></MenuItem>
                <MenuItem value="AVAILABLE">Available</MenuItem>
                <MenuItem value="RESERVED">Reserved</MenuItem>
                <MenuItem value="SOLD">Sold</MenuItem>
                <MenuItem value="PENDING_PICKUP">Pending Pickup</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={2}>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={handleSearch}
              sx={{ height: '56px' }}
            >
              Search
            </Button>
          </Grid>
          <Grid item xs={12} sm={2}>
            <Button
              fullWidth
              variant="outlined"
              onClick={handleClearFilters}
              sx={{ height: '56px' }}
            >
              Clear
            </Button>
          </Grid>
        </Grid>
      </Box>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {!loading && !error && (
        <>
          <Grid container spacing={4}>
            {items.map((item: Item) => (
              <Grid item key={item.id} xs={12} sm={6} md={4} lg={3}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardMedia
                    component="img"
                    height="140"
                    image={JSON.parse(item.images)[0] || 'https://via.placeholder.com/150'}
                    alt={item.title}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h6" component="h2">
                      <Link to={`/items/${item.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                        {item.title}
                      </Link>
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {item.description.substring(0, 100)}...
                    </Typography>
                    <Typography variant="h6" color="primary" sx={{ mt: 1 }}>
                      ${item.price.toFixed(2)}
                    </Typography>
                    <Chip
                      label={item.status.replace('_', ' ')}
                      color={statusColors[item.status as ItemStatusType]}
                      size="small"
                      sx={{ mt: 1 }}
                    />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Pagination
              count={pagination.totalPages}
              page={pagination.page}
              onChange={handlePageChange}
              color="primary"
              showFirstButton
              showLastButton
            />
          </Box>
        </>
      )}
    </Container>
  );
};

export default ItemsPage;
