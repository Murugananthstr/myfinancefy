import { Typography, Container, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const BondFormPage = () => {
    const navigate = useNavigate();
    return (
        <Container maxWidth="md" sx={{ mt: 4 }}>
            <Button startIcon={<ArrowBackIcon/>} onClick={() => navigate('/bonds')} sx={{ mb: 2 }}>
                Back to Dashboard
            </Button>
            <Typography variant="h4">Add New Bond</Typography>
            <Typography color="text.secondary">Form coming soon...</Typography>
        </Container>
    );
}
export default BondFormPage;
