import React from 'react';
import { Navbar } from '../components/Navbar';
import { Hero } from '../components/Hero';
import { Benefits } from '../components/Benefits';
import { HowItWorks } from '../components/HowItWorks';
import { ProviderForm } from '../components/ProviderForm';
import { Footer } from '../components/Footer';

export const LandingPage = () => {
    return (
        <>
            <Navbar />
            <Hero />
            <Benefits />
            <HowItWorks />
            <ProviderForm />
            <Footer />
        </>
    );
};
