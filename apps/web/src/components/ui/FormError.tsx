type FormErrorProps = {
    message: string | null;
};

export default function FormError({ message }: FormErrorProps) {
    if (!message) return null;
    return <p style={{ color: "red" }}>{message}</p>;
}