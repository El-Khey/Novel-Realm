/** Chapitre favori (marque-page) tel que renvoyé par /api/favorites. */
export interface ChapterFavorite {
    chapterId: number;
    novelId: number;
    chapterNumber: number;
    title: string;
    favoritedAt: string;
}
