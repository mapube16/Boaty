import React from 'react';
import { Routes, Route } from 'react-router-dom';

class ErrorBoundary extends React.Component {
    constructor(props) { super(props); this.state = { error: null }; }
    static getDerivedStateFromError(error) { return { error }; }
    render() {
        if (this.state.error) {
            return <pre style={{color:'red',padding:'2rem',whiteSpace:'pre-wrap'}}>{String(this.state.error)}</pre>;
        }
        return this.props.children;
    }
}
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { InvitePage } from './pages/InvitePage';
import { AdminDashboard } from './pages/AdminDashboard';
import { ProviderDashboard } from './pages/ProviderDashboard';
import { OperatorDashboard } from './pages/OperatorDashboard';
import { ClientDashboard } from './pages/ClientDashboard';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LeadFormPage } from './pages/LeadFormPage';

function App() {
    return (
        <div className="min-h-screen bg-white text-navy-dark">
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/invite" element={<InvitePage />} />
                <Route path="/registro" element={<ErrorBoundary><LeadFormPage /></ErrorBoundary>} />
                <Route
                    path="/admin"
                    element={
                        <ProtectedRoute roles={['STAFF']}>
                            <AdminDashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute roles={['ADMIN']}>
                            <ProviderDashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/operador"
                    element={
                        <ProtectedRoute roles={['OPERATOR']}>
                            <OperatorDashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/cliente"
                    element={
                        <ProtectedRoute roles={['CLIENT']}>
                            <ClientDashboard />
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </div>
    );
}

export default App;
