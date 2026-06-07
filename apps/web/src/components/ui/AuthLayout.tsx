type AuthLayoutProps = {
    title: string;
    children: React.ReactNode;
};

export default function AuthLayout({ title, children }: AuthLayoutProps) {
    return (
        <div style={{ maxWidth: 360, margin: "4rem auto", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <h2>{title}</h2>
            {children}
        </div>
    );
}