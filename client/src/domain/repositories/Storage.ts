export interface IStorage {
  getAdminToken(roomId: string): string | null;
  setAdminToken(roomId: string, token: string): void;
  getJoin(slug: string): { name: string } | null;
  setJoin(slug: string, name: string): void;
}
