import { useLayoutEffect, useRef } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Loading from "./components/Loading";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Analyze from "./pages/Analyze";
import Report from "./pages/Report";
import History from "./pages/History";
import RankTracker from "./pages/RankTracker";
import RankDetail from "./pages/RankDetail";
import { useApp } from "./context/AppContext";
import { gsap, prefersReducedMotion } from "./lib/gsap";

export default function App() {
    const { user, loading } = useApp();
    const { pathname } = useLocation();
    const page = useRef<HTMLDivElement>(null);

    const bare = ["/login", "/register"].includes(pathname);

    // Route change: scroll to top and a short crossfade with a directional hint
    useLayoutEffect(() => {
        window.scrollTo(0, 0);
        if (!page.current) return;
        gsap.fromTo(page.current, { autoAlpha: 0, y: prefersReducedMotion() ? 0 : 8 }, { autoAlpha: 1, y: 0, duration: 0.35, ease: "expo.out", overwrite: true });
    }, [pathname]);

    if (loading) return <Loading />;

    return (
        <>
            <Toaster
                position="bottom-center"
                toastOptions={{
                    duration: 3500,
                    style: { background: "var(--card)", color: "var(--foreground)", border: "1px solid var(--border)", borderRadius: 999, fontSize: 14, padding: "10px 16px" },
                    success: { iconTheme: { primary: "var(--accent)", secondary: "var(--accent-foreground)" } },
                    error: { iconTheme: { primary: "var(--danger)", secondary: "var(--background)" } },
                }}
            />
            {!bare && <Navbar />}
            <div ref={page}>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login state="login" />} />
                    <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <Login state="register" />} />
                    <Route element={<ProtectedRoute />}>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/analyze" element={<Analyze />} />
                        <Route path="/report/:id" element={<Report />} />
                        <Route path="/history" element={<History />} />
                        <Route path="/rank-tracker" element={<RankTracker />} />
                        <Route path="/rank/:id" element={<RankDetail />} />
                    </Route>
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </div>
        </>
    );
}
