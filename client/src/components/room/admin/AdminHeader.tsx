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
        className="py-2 bg-transparent text-buzz-yellow rounded-playful font-semibold  text-xl mb-10"
        >
        ←
      </a>
      <div className="flex items-center justify-between gap-4 mb-4 mt-8 flex-wrap">
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
          className="p-2.5 rounded-playful font-semibold bg-buzz-yellow hover:bg-buzz-yellow-light text-buzz-black shadow-playful active:scale-[0.98]"
          title={isEditMode ? "Done editing" : "Edit"}
          aria-label={isEditMode ? "Done editing" : "Edit"}
        >
          {isEditMode ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          )}
        </button>
      </div>
    </>
  );
}
