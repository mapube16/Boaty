import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { InvitePage } from './pages/InvitePage';
import { AdminDashboard } from './pages/AdminDashboard';
import { ProviderDashboard } from './pages/ProviderDashboard';
import { OperatorDashboard } from './pages/OperatorDashboard';
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
    return (
        <div className="min-h-screen bg-white text-navy-dark">
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/invite" element={<InvitePage />} />
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
            </Routes>
        </div>
    );
}

export default App;
