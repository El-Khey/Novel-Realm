/** Novel tels qu'ils sont retournés par l'API */
export interface Novel {
    id: number;
    title: string;
    author: string;
    description: string;
    coverImageUrl: string | null;
    status: "ONGOING" | "COMPLETED";
    createdAt: string;
}