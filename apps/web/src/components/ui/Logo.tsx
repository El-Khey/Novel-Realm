import { cn } from "@/lib/utils";

type LogoIconProps = {
    className?: string;
};

export function LogoIcon({ className }: LogoIconProps) {
    return (
        <svg
            viewBox="0 0 88 72"
            className={cn("h-8 w-8", className)}
            role="img"
            aria-label="NovelRealm"
            fill="none"
        >
            <path
                d="M8 14 L40 8 Q44 7 44 12 L44 56 Q44 60 40 60 L8 64 Q4 65 4 60 L4 18 Q4 15 8 14 Z"
                className="fill-card stroke-border"
                strokeWidth="1.5"
            />
            <path
                d="M80 14 L48 8 Q44 7 44 12 L44 56 Q44 60 48 60 L80 64 Q84 65 84 60 L84 18 Q84 15 80 14 Z"
                className="fill-card stroke-border"
                strokeWidth="1.5"
            />
            <line x1="44" y1="11" x2="44" y2="60" className="stroke-primary" strokeWidth="3" strokeLinecap="round" />
            <g className="stroke-muted-foreground" strokeWidth="2" strokeLinecap="round">
                <line x1="14" y1="24" x2="36" y2="20" />
                <line x1="14" y1="33" x2="36" y2="29" />
                <line x1="14" y1="42" x2="32" y2="38.5" />
                <line x1="52" y1="20" x2="74" y2="24" />
                <line x1="52" y1="29" x2="74" y2="33" />
                <line x1="56" y1="38.5" x2="74" y2="42" />
            </g>
        </svg>
    );
}

type LogoProps = {
    className?: string;
    iconClassName?: string;
};

export function Logo({ className, iconClassName }: LogoProps) {
    return (
        <div className={cn("flex items-center gap-2.5", className)}>
            <LogoIcon className={iconClassName} />
            <span className="text-xl font-semibold tracking-tight text-foreground">
                Novel<span className="text-primary">Realm</span>
            </span>
        </div>
    );
}