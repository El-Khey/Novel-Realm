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

/** Chapitre (version liste, sans contenu) — miroir de ChapterResponse côté API */
export interface Chapter {
    id: number;
    novelId: number;
    chapterNumber: number;
    title: string;
}

/** Chapitre (version détail, avec contenu) — miroir de ChapterDetailResponse */
export interface ChapterDetail {
    id: number;
    novelId: number;
    chapterNumber: number;
    title: string;
    content: string;
    createdAt: string;
}
