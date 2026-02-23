import React from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Benefits } from './components/Benefits';
import { HowItWorks } from './components/HowItWorks';
import { ProviderForm } from './components/ProviderForm';
import { AdminPortal } from './components/AdminPortal';
import { Footer } from './components/Footer';

function App() {
    return (
        <div className="min-h-screen bg-white text-navy-dark">
            <Navbar />
            <Hero />
            <Benefits />
            <HowItWorks />
            <ProviderForm />
            <AdminPortal />
            <Footer />
        </div>
    );
}

export default App;
