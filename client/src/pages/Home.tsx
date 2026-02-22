import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ensureUser,
  createRoom,
  getMyRooms,
  type Room,
} from "../api/rooms";
import JoinRoomForm from "../components/home/JoinRoomForm";
import MyRoomsList from "../components/home/MyRoomsList";

export default function Home() {
  const navigate = useNavigate();
  const [creating, setCreating] = useState(false);
  const [joiningSlug, setJoiningSlug] = useState("");
  const [myRooms, setMyRooms] = useState<Room[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getMyRooms()
      .then(({ rooms }) => setMyRooms(rooms))
      .catch(() => setMyRooms([]));
  }, []);

  async function handleCreateRoom() {
    setError(null);
    setCreating(true);
    try {
      await ensureUser();
      const { slug, adminToken, roomId } = await createRoom();
      try {
        const raw = localStorage.getItem("buzzer_admin_tokens");
        const tokens: Record<string, string> = raw ? JSON.parse(raw) : {};
        tokens[roomId] = adminToken;
        localStorage.setItem("buzzer_admin_tokens", JSON.stringify(tokens));
      } catch (_) {}
      navigate(`/room/${slug}?admin=1`, { state: { adminToken } });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create room");
    } finally {
      setCreating(false);
    }
  }

  function handleJoin() {
    const slug = joiningSlug.trim();
    if (!slug) {
      setError("Enter a room link or code");
      return;
    }
    setError(null);
    navigate(`/room/${slug}`);
  }

  function handleSelectRoom(room: Room) {
    try {
      const raw = localStorage.getItem("buzzer_admin_tokens");
      const tokens: Record<string, string> = raw ? JSON.parse(raw) : {};
      const adminToken = tokens[room.id];
      navigate(`/room/${room.slug}?admin=1`, {
        state: adminToken ? { adminToken } : undefined,
      });
    } catch {
      navigate(`/room/${room.slug}?admin=1`);
    }
  }

  return (
    <div className="min-h-screen bg-buzz-black text-white flex flex-col items-center justify-center p-6">
      <h1 className="text-4xl font-bold mb-8 text-buzz-yellow drop-shadow-sm">Buzzer</h1>
      <div className="flex flex-col gap-4 w-full max-w-sm">
        <button
          onClick={handleCreateRoom}
          disabled={creating}
          className="px-5 py-3.5 bg-buzz-red hover:bg-buzz-red-light active:scale-[0.98] disabled:opacity-50 rounded-playful font-semibold text-white shadow-playful transition"
        >
          {creating ? "Creating…" : "Create room"}
        </button>
        <JoinRoomForm
          joiningSlug={joiningSlug}
          onJoiningSlugChange={setJoiningSlug}
          onJoin={handleJoin}
          error={error}
        />
      </div>
      <MyRoomsList rooms={myRooms} onSelectRoom={handleSelectRoom} />
    </div>
  );
}
