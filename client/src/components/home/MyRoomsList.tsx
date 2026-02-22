import type { Room } from "../../api/rooms";

type Props = {
  rooms: Room[];
  onSelectRoom: (room: Room) => void;
};

export default function MyRoomsList({ rooms, onSelectRoom }: Props) {
  if (rooms.length === 0) return null;

  return (
    <div className="mt-10 w-full max-w-sm">
      <h2 className="text-lg font-semibold mb-2 text-buzz-yellow">My rooms</h2>
      <ul className="space-y-2">
        {rooms.map((room) => (
          <li key={room.id}>
            <button
              onClick={() => onSelectRoom(room)}
              className="text-buzz-yellow hover:text-buzz-yellow-light underline underline-offset-2"
            >
              {room.name ? `${room.name} (${room.slug})` : room.slug}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
