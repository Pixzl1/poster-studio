import type { AlbumData, AlbumSearchResult } from '@/types/music';

export interface MusicProvider {
  readonly name: string;
  searchAlbums(query: string): Promise<AlbumSearchResult[]>;
  getAlbum(id: string): Promise<AlbumData>;
  getTracks(id: string): Promise<AlbumData['tracks']>;
}
