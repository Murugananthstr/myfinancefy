import { Typography, Container, Box } from '@mui/material';

interface PlaceholderPageProps {
  title: string;
}

export default function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <Container>
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {title}
        </Typography>
        <Typography variant="body1">
          This is the {title} page. Content coming soon.
        </Typography>
      </Box>
    </Container>
  );
}
