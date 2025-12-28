import { Routes, Route } from 'react-router-dom';
import BondDashboard from './pages/BondDashboard';
import BondFormPage from './pages/BondFormPage';

const BondRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<BondDashboard />} />
      <Route path="/new" element={<BondFormPage />} />
      <Route path="/edit/:id" element={<BondFormPage />} />
    </Routes>
  );
};

export default BondRoutes;
