import React from 'react';
import { Routes, Route } from 'react-router-dom';
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
                <Route path="/registro" element={<LeadFormPage />} />
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
