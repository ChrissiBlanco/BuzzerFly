type Props = {
  disabled: boolean;
  buzzedName: string | null;
  onBuzz: () => void;
};

export default function BuzzerButton({ disabled, buzzedName, onBuzz }: Props) {
  return (
    <div className="flex flex-col items-center gap-4">
      <button
        type="button"
        onClick={onBuzz}
        disabled={disabled}
        className="w-52 h-52 rounded-full text-3xl font-bold transition disabled:opacity-50 disabled:cursor-not-allowed bg-buzz-red hover:bg-buzz-red-light active:scale-95 disabled:hover:bg-buzz-red disabled:active:scale-100 text-buzz-yellow shadow-playful-lg border-4 border-buzz-yellow/30"
      >
        BUZZ
      </button>
      {buzzedName && (
        <p className="text-buzz-yellow font-semibold text-lg">First: {buzzedName}</p>
      )}
    </div>
  );
}
