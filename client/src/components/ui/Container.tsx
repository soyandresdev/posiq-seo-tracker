import type { ElementType, HTMLAttributes, ReactNode } from "react";

type Props = HTMLAttributes<HTMLElement> & {
    as?: ElementType;
    children: ReactNode;
    /** "wide" for full editorial layouts, "narrow" for prose and forms. */
    size?: "wide" | "default" | "narrow";
};

const sizes = {
    wide: "max-w-[1440px]",
    default: "max-w-[1200px]",
    narrow: "max-w-[720px]",
};

export default function Container({ as: Tag = "div", size = "default", className = "", children, ...rest }: Props) {
    return (
        <Tag className={`mx-auto w-full px-5 sm:px-8 ${sizes[size]} ${className}`} {...rest}>
            {children}
        </Tag>
    );
}
