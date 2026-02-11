import React from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ProblemSolution } from './components/ProblemSolution';
import { Destinations } from './components/Destinations';
import { HowItWorks } from './components/HowItWorks';
import { ForOwners } from './components/ForOwners';
import { Footer } from './components/Footer';

function App() {
    return (
        <div className="min-h-screen bg-primary text-slate selection:bg-accent selection:text-primary">
            <Navbar />
            <Hero />
            <ProblemSolution />
            <Destinations />
            <HowItWorks />
            <ForOwners />
            <Footer />
        </div>
    );
}

export default App;
