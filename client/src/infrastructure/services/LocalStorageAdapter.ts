import type { IStorage } from "../../domain/repositories";

const ADMIN_TOKENS_KEY = "buzzer_admin_tokens";
const ROOM_JOINS_KEY = "buzzer_room_joins";

function getAdminTokens(): Record<string, string> {
  try {
    const raw = localStorage.getItem(ADMIN_TOKENS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function getJoins(): Record<string, { name: string }> {
  try {
    const raw = localStorage.getItem(ROOM_JOINS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export const localStorageAdapter: IStorage = {
  getAdminToken(roomId: string): string | null {
    return getAdminTokens()[roomId] ?? null;
  },

  setAdminToken(roomId: string, token: string): void {
    const tokens = getAdminTokens();
    if (!tokens[roomId]) {
      tokens[roomId] = token;
      localStorage.setItem(ADMIN_TOKENS_KEY, JSON.stringify(tokens));
    }
  },

  getJoin(slug: string): { name: string } | null {
    return getJoins()[slug] ?? null;
  },

  setJoin(slug: string, name: string): void {
    const joins = getJoins();
    joins[slug] = { name };
    localStorage.setItem(ROOM_JOINS_KEY, JSON.stringify(joins));
  },
};
