import BuzzerButton from "../../BuzzerButton";

type Props = {
  connected: boolean;
  questionText: string | null;
  isRevealed: boolean;
  activeRoundName: string | null;
  buzzedName: string | null;
  onBuzz: () => void;
};

export default function ParticipantView({
  connected,
  questionText,
  isRevealed,
  activeRoundName,
  buzzedName,
  onBuzz,
}: Props) {
  return (
    <div className="min-h-screen bg-buzz-black text-white flex flex-col items-center justify-center p-6">
      <a
        href="/"
        className="absolute top-6 left-6 text-buzz-yellow hover:text-buzz-yellow-light"
      >
        ←
      </a>
      {!connected && <p className="text-buzz-yellow text-sm mb-4">Connecting…</p>}
      <div className="text-center max-w-lg">
        {isRevealed && questionText ? (
          <>
            <p className="text-xl mb-6 text-yellow-100">{questionText}</p>
            <BuzzerButton
              disabled={!connected || !!buzzedName}
              buzzedName={buzzedName}
              onBuzz={onBuzz}
            />
          </>
        ) : (
          <>
            <p className="text-2xl font-semibold text-buzz-yellow mb-2">{activeRoundName ?? "—"}</p>
            <p className="text-yellow-200/70 text-sm mb-6">Waiting for question to be revealed</p>
            <BuzzerButton disabled={true} buzzedName={null} onBuzz={() => {}} />
          </>
        )}
      </div>
    </div>
  );
}
