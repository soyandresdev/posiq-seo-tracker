import Hero from "../components/home/Hero";
import LogoStrip from "../components/home/LogoStrip";
import Features from "../components/home/Features";
import Benefits from "../components/home/Benefits";
import HowItWorks from "../components/home/HowItWorks";
import Pricing from "../components/home/Pricing";
import FAQ from "../components/home/FAQ";
import CTA from "../components/home/CTA";
import Footer from "../components/home/Footer";

export default function Home() {
    return (
        <main>
            <Hero />
            <LogoStrip />
            <Features />
            <Benefits />
            <HowItWorks />
            <Pricing />
            <FAQ />
            <CTA />
            <Footer />
        </main>
    );
}
