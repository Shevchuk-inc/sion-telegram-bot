import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Add, Delete, Visibility } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { domainsApi } from '../services/api';
import type { Domain, DomainStatus } from '../types';

export default function Domains() {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [newDomain, setNewDomain] = useState('');
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();

  const fetchDomains = useCallback(async () => {
    try {
      const { data } = await domainsApi.getAll();
      setDomains(data);
    } catch {
      setError('Не вдалося завантажити домени');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDomains();
  }, []);

  const handleCreate = async () => {
    if (!newDomain.trim()) return;
    
    setCreating(true);
    setError('');
    try {
      await domainsApi.create({ name: newDomain.trim() });
      setOpenDialog(false);
      setNewDomain('');
      fetchDomains();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Помилка створення домену');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Видалити домен з бази? (Cloudflare зона залишиться)')) return;
    
    try {
      await domainsApi.delete(id);
      fetchDomains();
    } catch {
      setError('Не вдалося видалити домен');
    }
  };

  const getStatusColor = (status: DomainStatus): 'success' | 'warning' | 'default' => {
    const colors: Record<DomainStatus, 'success' | 'warning' | 'default'> = {
      active: 'success',
      pending: 'warning',
      initializing: 'warning',
      moved: 'default',
      deleted: 'default',
    };
    return colors[status] || 'default';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Домени</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpenDialog(true)}
        >
          Додати домен
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Домен</TableCell>
              <TableCell>Статус</TableCell>
              <TableCell>NS сервери</TableCell>
              <TableCell>Дата створення</TableCell>
              <TableCell align="right">Дії</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {domains.map((domain) => (
              <TableRow key={domain._id}>
                <TableCell>
                  <Typography fontWeight="bold">{domain.name}</Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={domain.status}
                    color={getStatusColor(domain.status) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {domain.nameServers.map((ns) => (
                    <Typography key={ns} variant="body2" color="text.secondary">
                      {ns}
                    </Typography>
                  ))}
                </TableCell>
                <TableCell>
                  {new Date(domain.createdAt).toLocaleDateString('uk-UA')}
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    color="primary"
                    onClick={() => navigate(`/domains/${domain._id}`)}
                    title="DNS записи"
                  >
                    <Visibility />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleDelete(domain._id)}
                    title="Видалити"
                  >
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {domains.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  Немає доменів
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Додати домен</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Доменне ім'я"
            fullWidth
            value={newDomain}
            onChange={(e) => setNewDomain(e.target.value)}
            placeholder="example.com"
            disabled={creating}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} disabled={creating}>
            Скасувати
          </Button>
          <Button onClick={handleCreate} variant="contained" disabled={creating}>
            {creating ? <CircularProgress size={24} /> : 'Додати'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
