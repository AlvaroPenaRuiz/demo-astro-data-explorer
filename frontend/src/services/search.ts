import type { SearchResponse } from "../types/search";

export const search = async (ra: number, dec: number, radius: number) => {
    const results: SearchResponse = await fetch(`/api/search/?ra=${encodeURIComponent(ra)}&dec=${encodeURIComponent(dec)}&radius=${encodeURIComponent(radius)}`)
        .then(response => response.json())
        .then(data => {
            return data;
        });
    return results;
}
