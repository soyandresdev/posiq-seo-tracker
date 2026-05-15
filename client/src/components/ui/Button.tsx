import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { Link } from "react-router-dom";

type Variant = "primary" | "dark" | "secondary" | "ghost" | "link";
type Size = "sm" | "md" | "lg";

type BaseProps = { variant?: Variant; size?: Size; icon?: ReactNode; iconPosition?: "left" | "right"; loading?: boolean; children: ReactNode; className?: string };
type ButtonProps = BaseProps & ButtonHTMLAttributes<HTMLButtonElement> & { to?: undefined };
type LinkProps = BaseProps & { to: string; onClick?: () => void; target?: string };

const base = "group/btn inline-flex items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap select-none pressable disabled:opacity-50 disabled:pointer-events-none transition-[background-color,color,box-shadow,border-color] duration-200";

const variants: Record<Variant, string> = {
    primary: "bg-primary text-white shadow-primary hover:bg-primary-dark",
    dark: "bg-ink text-white hover:bg-[#25254a]",
    secondary: "bg-card text-foreground border border-border shadow-card hover:border-lavender-deep hover:bg-lavender/40",
    ghost: "text-foreground hover:bg-muted",
    link: "text-primary-dark px-0! h-auto! underline-offset-4 hover:underline",
};

const sizes: Record<Size, string> = { sm: "h-9 px-4 text-[13px]", md: "h-11 px-5 text-sm", lg: "h-12 px-6 text-[15px]" };

function Inner({ icon, iconPosition, loading, children }: Pick<BaseProps, "icon" | "iconPosition" | "loading" | "children">) {
    const Icon = icon ? <span className={`inline-flex transition-transform duration-300 ease-out-expo ${iconPosition === "left" ? "group-hover/btn:-translate-x-0.5" : "group-hover/btn:translate-x-0.5"}`}>{icon}</span> : null;
    return (
        <>
            {loading && <span className="size-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" aria-hidden />}
            {iconPosition === "left" && Icon}
            <span>{children}</span>
            {iconPosition !== "left" && Icon}
        </>
    );
}

const Button = forwardRef<HTMLButtonElement, ButtonProps | LinkProps>(function Button(props, ref) {
    const { variant = "primary", size = "md", icon, iconPosition = "right", loading, className = "", children } = props;
    const cls = `${base} ${variants[variant]} ${sizes[size]} ${className}`;
    if ("to" in props && props.to !== undefined) {
        const { to, onClick, target } = props;
        return (
            <Link to={to} onClick={onClick} target={target} className={cls}>
                <Inner icon={icon} iconPosition={iconPosition} loading={loading}>
                    {children}
                </Inner>
            </Link>
        );
    }
    const { variant: _v, size: _s, icon: _i, iconPosition: _ip, loading: _l, className: _c, children: _ch, ...rest } = props as ButtonProps;
    void _v; void _s; void _i; void _ip; void _l; void _c; void _ch;
    return (
        <button ref={ref} className={cls} disabled={loading || rest.disabled} {...rest}>
            <Inner icon={icon} iconPosition={iconPosition} loading={loading}>
                {children}
            </Inner>
        </button>
    );
});

export default Button;
