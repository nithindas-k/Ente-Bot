import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import SetupPage from './pages/SetupPage';
import DashboardPage from './pages/DashboardPage';
import ContactsPage from './pages/ContactsPage';
import PersonalityPage from './pages/PersonalityPage';
import ApiKeySetup from './pages/ApiKeySetup';
import HowToUsePage from './pages/HowToUsePage';
import { Layout } from './components/Layout';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/setup" element={<SetupPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/contacts" element={<ContactsPage />} />
          <Route path="/personality/:contactId" element={<PersonalityPage />} />
          <Route path="/api-setup" element={<ApiKeySetup />} />
          <Route path="/how-to-use" element={<HowToUsePage />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
