import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import SetupPage from './pages/SetupPage';
import DashboardPage from './pages/DashboardPage';
import ContactsPage from './pages/ContactsPage';
import PersonalityPage from './pages/PersonalityPage';
import ApiKeySetup from './pages/ApiKeySetup';
import HowToUsePage from './pages/HowToUsePage';
import TestChat from './pages/TestChat';
import { Layout } from './components/Layout';
import { WhatsAppProvider } from './context/WhatsAppContext';

import { Toaster } from 'sonner';


function App() {
  return (
    <BrowserRouter>
      <WhatsAppProvider>
        <Toaster
          richColors
          expand={false}
          position="top-right"
          theme="dark"
          closeButton
          toastOptions={{
            style: {
              background: '#0a0a0a',
              border: '1px solid #262626',
              color: '#fff',
              borderRadius: '12px',
              fontFamily: 'Inter, sans-serif'
            },
            className: 'border-emerald-500/20'
          }}
        />
        <Layout>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/setup" element={<SetupPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/contacts" element={<ContactsPage />} />
            <Route path="/personality/:contactId" element={<PersonalityPage />} />
            <Route path="/api-setup" element={<ApiKeySetup />} />
            <Route path="/how-to-use" element={<HowToUsePage />} />
            <Route path="/test-chat" element={<TestChat />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Layout>
      </WhatsAppProvider>
    </BrowserRouter>
  );
}

export default App;
