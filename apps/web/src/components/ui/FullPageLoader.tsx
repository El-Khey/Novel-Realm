/** Loader plein écran, utilisé pendant la vérification de la session. */

export default function FullPageLoader() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background">
            <div
                role="status"
                aria-label="Chargement"
                className="size-8 animate-spin rounded-full border-2 border-muted border-t-primary"
            />
        </div>
    );
}
