type ButtonProps = {
    onClick: () => void;
    disabled?: boolean;
    children: React.ReactNode;
};

export default function Button({ onClick, disabled = false, children }: ButtonProps) {
    return (
        <button onClick={onClick} disabled={disabled}>
            {children}
        </button>
    );
}