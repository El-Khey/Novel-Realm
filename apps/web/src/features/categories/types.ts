import type { Novel } from "@/features/novels/types";

/** Une étagère personnelle avec ses romans — miroir de CategoryDetailResponse. */
export interface Category {
    id: number;
    name: string;
    novels: Novel[];
}
