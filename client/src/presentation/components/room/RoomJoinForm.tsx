type Props = {
  slug: string;
  isAdmin: boolean;
  participantName: string;
  onParticipantNameChange: (value: string) => void;
  roomNameOnJoin: string;
  onRoomNameOnJoinChange: (value: string) => void;
  onJoin: () => void;
  joining: boolean;
};

export default function RoomJoinForm({
  slug,
  isAdmin,
  participantName,
  onParticipantNameChange,
  roomNameOnJoin,
  onRoomNameOnJoinChange,
  onJoin,
  joining,
}: Props) {
  const canSubmit = participantName.trim().length > 0;

  return (
    <div className="min-h-screen bg-buzz-black text-white flex flex-col items-center justify-center p-6">
      <a
        href="/"
        className="absolute top-6 left-6 text-buzz-yellow hover:text-buzz-yellow-light underline underline-offset-2"
      >
        ←
      </a>
      <h1 className="text-2xl font-bold mb-4 text-buzz-yellow">Join room {slug}</h1>
      {isAdmin && (
        <div className="w-64 mb-4">
          <label className="block text-buzz-yellow/90 text-sm font-medium mb-1">Room name</label>
          <input
            type="text"
            placeholder="Give this room a name"
            value={roomNameOnJoin}
            onChange={(e) => onRoomNameOnJoinChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && canSubmit && onJoin()}
            className="w-full px-4 py-2.5 rounded-playful bg-black/40 border-2 border-buzz-yellow/50 text-white placeholder-yellow-200/50 focus:border-buzz-yellow focus:outline-none"
          />
        </div>
      )}
      <input
        type="text"
        placeholder="Your name"
        value={participantName}
        onChange={(e) => onParticipantNameChange(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && canSubmit && onJoin()}
        className="px-4 py-2.5 rounded-playful bg-black/40 border-2 border-buzz-yellow/50 text-white placeholder-yellow-200/50 w-64 focus:border-buzz-yellow focus:outline-none"
      />
      <button
        onClick={onJoin}
        disabled={!canSubmit || joining}
        className="mt-4 px-5 py-2.5 bg-buzz-red hover:bg-buzz-red-light disabled:opacity-50 rounded-playful font-semibold shadow-playful active:scale-[0.98]"
      >
        {joining ? "Joining…" : "Join"}
      </button>
    </div>
  );
}
