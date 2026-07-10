type AuthDividerProps = {
    label?: string;
};

/** Séparateur horizontal avec un libellé centré (« ou »). */
export default function AuthDivider({ label = "ou" }: AuthDividerProps) {
    return (
        <div className="flex w-full items-center gap-3">
            <span className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">{label}</span>
            <span className="h-px flex-1 bg-border" />
        </div>
    );
}
