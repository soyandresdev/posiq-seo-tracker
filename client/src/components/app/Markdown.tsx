import { Fragment, type ReactNode } from "react";
import CopyButton from "./CopyButton";

/** Tiny markdown renderer: fenced code, inline code, bold, bullet and numbered lists, paragraphs. */
export default function Markdown({ text }: { text: string }) {
    const parts = text.split(/```(\w*)\n?([\s\S]*?)```/g);
    const out: ReactNode[] = [];
    for (let i = 0; i < parts.length; i += 3) {
        const prose = parts[i];
        if (prose?.trim()) out.push(<Prose key={`p${i}`} text={prose} />);
        const code = parts[i + 2];
        if (code !== undefined) {
            const trimmed = code.replace(/\n$/, "");
            out.push(
                <div key={`c${i}`} className="relative my-2 rounded-xl bg-[#0f0f23] text-[#e8e8f3] p-3 pr-20 text-xs font-mono overflow-x-auto">
                    <CopyButton text={trimmed} className="absolute top-2 right-2 bg-white/10! border-white/10! text-white/80!" />
                    <pre className="whitespace-pre-wrap break-words">{trimmed}</pre>
                </div>
            );
        }
    }
    return <>{out}</>;
}

function Inline({ text }: { text: string }) {
    const tokens = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
    return (
        <>
            {tokens.map((t, i) => {
                if (t.startsWith("**") && t.endsWith("**")) return <strong key={i}>{t.slice(2, -2)}</strong>;
                if (t.startsWith("`") && t.endsWith("`")) return <code key={i} className="rounded bg-muted px-1 py-0.5 text-[0.85em] font-mono">{t.slice(1, -1)}</code>;
                return <Fragment key={i}>{t}</Fragment>;
            })}
        </>
    );
}

function Prose({ text }: { text: string }) {
    const blocks = text.trim().split(/\n{2,}/);
    return (
        <>
            {blocks.map((b, i) => {
                const lines = b.split("\n");
                if (lines.every((l) => /^\s*[-*•]\s+/.test(l))) {
                    return (
                        <ul key={i} className="my-2 list-disc pl-5 space-y-1">
                            {lines.map((l, j) => (
                                <li key={j}>
                                    <Inline text={l.replace(/^\s*[-*•]\s+/, "")} />
                                </li>
                            ))}
                        </ul>
                    );
                }
                if (lines.every((l) => /^\s*\d+[.)]\s+/.test(l))) {
                    return (
                        <ol key={i} className="my-2 list-decimal pl-5 space-y-1">
                            {lines.map((l, j) => (
                                <li key={j}>
                                    <Inline text={l.replace(/^\s*\d+[.)]\s+/, "")} />
                                </li>
                            ))}
                        </ol>
                    );
                }
                const heading = b.match(/^#{1,3}\s+(.*)$/);
                if (heading) return <p key={i} className="mt-3 mb-1 font-semibold"><Inline text={heading[1] ?? ""} /></p>;
                return (
                    <p key={i} className="my-2">
                        {lines.map((l, j) => (
                            <Fragment key={j}>
                                <Inline text={l} />
                                {j < lines.length - 1 && <br />}
                            </Fragment>
                        ))}
                    </p>
                );
            })}
        </>
    );
}
