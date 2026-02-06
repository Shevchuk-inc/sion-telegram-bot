import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  MenuItem,
  Switch,
  FormControlLabel,
  CircularProgress,
  Alert,
  Breadcrumbs,
  Link,
} from '@mui/material';
import { Add, Delete, Edit, ArrowBack } from '@mui/icons-material';
import { domainsApi } from '../services/api';
import type { Domain, DNSRecord, DNSRecordType, CreateDNSRecordPayload } from '../types';

const DNS_TYPES: DNSRecordType[] = ['A', 'AAAA', 'CNAME', 'MX', 'TXT', 'NS', 'SRV', 'CAA'];

export default function DomainDNS() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [domain, setDomain] = useState<Domain | null>(null);
  const [records, setRecords] = useState<DNSRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editRecord, setEditRecord] = useState<DNSRecord | null>(null);
  const [saving, setSaving] = useState(false);
  
  const [form, setForm] = useState<CreateDNSRecordPayload>({
    type: 'A',
    name: '',
    content: '',
    ttl: 3600,
    proxied: false,
  });

  const fetchData = useCallback(async () => {
    if (!id) return;
    try {
      const { data } = await domainsApi.getById(id);
      setDomain(data.domain);
      setRecords(data.dnsRecords);
    } catch {
      setError('Не вдалося завантажити дані');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [id]);

  const resetForm = () => {
    setForm({ type: 'A', name: '', content: '', ttl: 3600, proxied: false });
    setEditRecord(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setOpenDialog(true);
  };

  const handleOpenEdit = (record: DNSRecord) => {
    setEditRecord(record);
    setForm({
      type: record.type,
      name: record.name,
      content: record.content,
      ttl: record.ttl,
      proxied: record.proxied,
    });
    setOpenDialog(true);
  };

  const handleSave = async () => {
    if (!id) return;
    setSaving(true);
    setError('');
    try {
      if (editRecord) {
        await domainsApi.updateDNS(id, editRecord.id, form);
      } else {
        await domainsApi.createDNS(id, form);
      }
      setOpenDialog(false);
      resetForm();
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Помилка збереження');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (recordId: string) => {
    if (!id || !confirm('Видалити DNS запис?')) return;
    
    try {
      await domainsApi.deleteDNS(id, recordId);
      fetchData();
    } catch {
      setError('Не вдалося видалити запис');
    }
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
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link
          component="button"
          underline="hover"
          onClick={() => navigate('/domains')}
          sx={{ display: 'flex', alignItems: 'center' }}
        >
          <ArrowBack sx={{ mr: 0.5, fontSize: 16 }} />
          Домени
        </Link>
        <Typography color="text.primary">{domain?.name}</Typography>
      </Breadcrumbs>

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">DNS записи: {domain?.name}</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleOpenCreate}
        >
          Додати запис
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
              <TableCell>Тип</TableCell>
              <TableCell>Ім'я</TableCell>
              <TableCell>Значення</TableCell>
              <TableCell>TTL</TableCell>
              <TableCell>Proxied</TableCell>
              <TableCell align="right">Дії</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {records.map((record) => (
              <TableRow key={record.id}>
                <TableCell>
                  <Typography
                    component="span"
                    sx={{
                      bgcolor: 'primary.main',
                      color: 'white',
                      px: 1,
                      py: 0.5,
                      borderRadius: 1,
                      fontSize: 12,
                    }}
                  >
                    {record.type}
                  </Typography>
                </TableCell>
                <TableCell>{record.name}</TableCell>
                <TableCell sx={{ maxWidth: 300, wordBreak: 'break-all' }}>
                  {record.content}
                </TableCell>
                <TableCell>{record.ttl === 1 ? 'Auto' : record.ttl}</TableCell>
                <TableCell>{record.proxied ? '✓' : '✗'}</TableCell>
                <TableCell align="right">
                  <IconButton
                    color="primary"
                    onClick={() => handleOpenEdit(record)}
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleDelete(record.id)}
                  >
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {records.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  Немає DNS записів
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editRecord ? 'Редагувати запис' : 'Додати DNS запис'}
        </DialogTitle>
        <DialogContent>
          <TextField
            select
            margin="dense"
            label="Тип"
            fullWidth
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value as DNSRecordType })}
            disabled={saving}
          >
            {DNS_TYPES.map((type) => (
              <MenuItem key={type} value={type}>{type}</MenuItem>
            ))}
          </TextField>
          <TextField
            margin="dense"
            label="Ім'я"
            fullWidth
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="@ або subdomain"
            disabled={saving}
          />
          <TextField
            margin="dense"
            label="Значення"
            fullWidth
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            placeholder="IP адреса або значення"
            disabled={saving}
          />
          <TextField
            margin="dense"
            label="TTL (секунди)"
            type="number"
            fullWidth
            value={form.ttl}
            onChange={(e) => setForm({ ...form, ttl: parseInt(e.target.value) || 3600 })}
            disabled={saving}
          />
          <FormControlLabel
            control={
              <Switch
                checked={form.proxied}
                onChange={(e) => setForm({ ...form, proxied: e.target.checked })}
                disabled={saving}
              />
            }
            label="Proxied (Cloudflare CDN)"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} disabled={saving}>
            Скасувати
          </Button>
          <Button onClick={handleSave} variant="contained" disabled={saving}>
            {saving ? <CircularProgress size={24} /> : 'Зберегти'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
