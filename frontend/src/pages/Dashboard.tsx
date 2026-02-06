import { Typography, Card, CardContent, Grid } from '@mui/material';

export default function Dashboard() {
  return (
    <>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Telegram Bot
              </Typography>
              <Typography variant="h5">Active</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                API Status
              </Typography>
              <Typography variant="h5">Online</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Cloudflare
              </Typography>
              <Typography variant="h5">Connected</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </>
  );
}
