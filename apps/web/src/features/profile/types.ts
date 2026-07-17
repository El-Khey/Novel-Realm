/** Statistiques de lecture résumées, renvoyées par GET /users/me/stats. */
export interface UserStats {
    chaptersRead: number;
    novelsFollowed: number;
    novelsCompleted: number;
    chaptersFavorited: number;
    readingDays: number;
    currentStreak: number;
    longestStreak: number;
}
