export interface Track {
  id: string;
  position: number;
  title: string;
  durationMs: number | null;
}

export interface AlbumSearchResult {
  id: string;
  releaseGroupId?: string;
  title: string;
  artist: string;
  year: number | null;
  country: string | null;
  status: string | null;
  primaryType: string | null;
  secondaryTypes: string[];
  disambiguation: string;
  trackCount: number | null;
  score?: number;
}

export interface AlbumData extends AlbumSearchResult {
  releaseDate: string | null;
  barcode: string | null;
  tracks: Track[];
  isExplicit: boolean;
}
