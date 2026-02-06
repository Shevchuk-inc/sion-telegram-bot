import { useState, useEffect } from 'react';
import { Typography, Card, CardContent, Grid, CircularProgress, Box } from '@mui/material';
import { Dns, People, Cloud } from '@mui/icons-material';
import api from '../services/api';

export default function Dashboard() {
  const [stats, setStats] = useState({ domains: 0, users: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [domainsRes, usersRes] = await Promise.all([
          api.get('/domains'),
          api.get('/users'),
        ]);
        setStats({
          domains: domainsRes.data.length,
          users: usersRes.data.length,
        });
      } catch (err) {
        console.error('Failed to fetch stats');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Dns sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Домени
                  </Typography>
                  <Typography variant="h4">{stats.domains}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: 'success.main', color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <People sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Користувачі
                  </Typography>
                  <Typography variant="h4">{stats.users}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: 'warning.main', color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Cloud sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Cloudflare
                  </Typography>
                  <Typography variant="h4">Connected</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </>
  );
}
