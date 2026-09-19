import { Link } from "react-router-dom";

export default function Logo({ className = "" }: { className?: string }) {
    return (
        <Link to="/" className={`inline-flex items-center gap-2 ${className}`} aria-label="Posiq home">
            <span className="size-7 rounded-lg bg-primary grid place-items-center shadow-primary">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                    <path d="M2 10.5 6 6l2.5 2.5L12 4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M9 4h3v3" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </span>
            <span className="font-heavy text-[17px] tracking-tight">Posiq</span>
        </Link>
    );
}
