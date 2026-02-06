import { useState, useEffect } from 'react';
import {
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Switch,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
} from '@mui/material';
import { Delete, Add } from '@mui/icons-material';
import { usersApi, User } from '../services/api';

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [open, setOpen] = useState(false);
  const [telegramId, setTelegramId] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  const fetchUsers = async () => {
    try {
      const { data } = await usersApi.getAll();
      setUsers(data);
    } catch {
      setError('Failed to fetch users');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggle = async (user: User) => {
    try {
      await usersApi.update(user._id, !user.isAllowed);
      fetchUsers();
    } catch {
      setError('Failed to update user');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    try {
      await usersApi.delete(id);
      fetchUsers();
    } catch {
      setError('Failed to delete user');
    }
  };

  const handleCreate = async () => {
    try {
      await usersApi.create({ telegramId, username });
      setOpen(false);
      setTelegramId('');
      setUsername('');
      fetchUsers();
    } catch {
      setError('Failed to create user');
    }
  };

  return (
    <>
      <Typography variant="h4" gutterBottom>
        Users
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      <Button
        variant="contained"
        startIcon={<Add />}
        onClick={() => setOpen(true)}
        sx={{ mb: 2 }}
      >
        Add User
      </Button>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Telegram ID</TableCell>
              <TableCell>Username</TableCell>
              <TableCell>Allowed</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user._id}>
                <TableCell>{user.telegramId}</TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell>
                  <Switch
                    checked={user.isAllowed}
                    onChange={() => handleToggle(user)}
                  />
                </TableCell>
                <TableCell>
                  {new Date(user.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <IconButton color="error" onClick={() => handleDelete(user._id)}>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Add User</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Telegram ID"
            margin="normal"
            value={telegramId}
            onChange={(e) => setTelegramId(e.target.value)}
          />
          <TextField
            fullWidth
            label="Username"
            margin="normal"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate}>
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
