import { ArrowRight } from "lucide-react";
import { Button, Container, Reveal } from "../ui";

export default function CTA() {
    return (
        <section className="py-20 md:py-28">
            <Container className="text-center">
                <Reveal className="max-w-2xl mx-auto">
                    <span className="inline-flex items-center gap-2 rounded-full bg-card border border-border shadow-card px-3 py-1 text-xs font-semibold text-muted-foreground">
                        <span className="size-1.5 rounded-full bg-primary" /> Get started
                    </span>
                    <h2 className="mt-5 font-display text-display-lg text-balance">
                        Unlock the power of <span className="text-primary">daily rank tracking</span>
                    </h2>
                    <p className="mt-4 text-muted-foreground text-pretty">Your first report takes thirty seconds. Your first position check happens tomorrow at six.</p>
                    <div className="mt-8">
                        <Button to="/register" variant="dark" size="lg" icon={<ArrowRight size={16} />}>
                            Analyze your site free
                        </Button>
                    </div>
                </Reveal>
            </Container>
        </section>
    );
}
