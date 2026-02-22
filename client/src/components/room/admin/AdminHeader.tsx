type Props = {
  roomName: string | null;
  slug: string;
  shareUrl: string;
  isEditMode: boolean;
  onToggleEditMode: () => void;
};

export default function AdminHeader({
  roomName,
  slug,
  shareUrl,
  isEditMode,
  onToggleEditMode,
}: Props) {
  return (
    <>
      <a
        href="/"
        className="inline-block text-buzz-yellow hover:text-buzz-yellow-light underline underline-offset-2 mb-4"
      >
        ←
      </a>
      <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold mb-1 text-buzz-yellow">
            {roomName ? `${roomName} (${slug})` : `Room (${slug})`}
          </h1>
          <p className="text-yellow-200/80 text-sm">
            Share link:{" "}
            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(shareUrl)}
              className="text-buzz-yellow hover:text-buzz-yellow-light underline underline-offset-2"
            >
              {shareUrl}
            </button>{" "}
            (click to copy)
          </p>
        </div>
        <button
          type="button"
          onClick={onToggleEditMode}
          className="px-4 py-2 rounded-playful font-semibold bg-buzz-yellow hover:bg-buzz-yellow-light text-buzz-black shadow-playful active:scale-[0.98]"
        >
          {isEditMode ? "Done editing" : "Edit"}
        </button>
      </div>
    </>
  );
}
