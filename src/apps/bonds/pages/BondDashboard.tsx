import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Button,
  Container
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AddIcon from '@mui/icons-material/Add';

const BondDashboard = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }} gutterBottom>
            Bond Market
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your fixed income portfolio and track maturity.
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => navigate('/bonds/new')}
          sx={{ bgcolor: '#0f766e', '&:hover': { bgcolor: '#0d6efd' } }} // Teal color for Bonds
        >
          Add New Bond
        </Button>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { title: 'Total Invested', value: '$0.00', icon: <AccountBalanceIcon />, color: '#0f766e', bg: '#ccfbf1' },
          { title: 'Avg Yield', value: '0.0%', icon: <TrendingUpIcon />, color: '#ea580c', bg: '#ffedd5' },
        ].map((stat, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
            <Card elevation={0} sx={{ border: '1px solid #e5e7eb' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ p: 1, borderRadius: 2, bgcolor: stat.bg, color: stat.color, mr: 2 }}>
                    {stat.icon}
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {stat.title}
                  </Typography>
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  {stat.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="text.secondary">
            No bonds in portfolio. Start by adding your first bond holding.
        </Typography>
      </Card>
    </Container>
  );
};

export default BondDashboard;
