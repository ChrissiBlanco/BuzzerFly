type Props = {
  joiningSlug: string;
  onJoiningSlugChange: (value: string) => void;
  onJoin: () => void;
  error: string | null;
};

export default function JoinRoomForm({
  joiningSlug,
  onJoiningSlugChange,
  onJoin,
  error,
}: Props) {
  const slug = joiningSlug.trim();
  const canJoin = slug.length > 0;

  return (
    <div className="flex flex-col gap-4 w-full max-w-sm">
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Room link or code"
          value={joiningSlug}
          onChange={(e) => onJoiningSlugChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && canJoin && onJoin()}
          className="flex-1 px-3 py-2.5 rounded-playful bg-black/40 border-2 border-buzz-yellow/50 text-white placeholder-yellow-200/50 focus:border-buzz-yellow focus:outline-none"
        />
        <button
          onClick={onJoin}
          className="px-5 py-2.5 bg-buzz-yellow hover:bg-buzz-yellow-light text-buzz-black font-semibold rounded-playful shadow-playful active:scale-[0.98] transition"
        >
          Join
        </button>
      </div>
      {error && <p className="text-buzz-red-light text-sm font-medium">{error}</p>}
    </div>
  );
}
