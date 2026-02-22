type Props = {
  message: string;
};

export default function RoomError({ message }: Props) {
  return (
    <div className="min-h-screen bg-buzz-black text-white flex flex-col items-center justify-center gap-4">
      <p className="text-buzz-red-light">{message}</p>
      <a
        href="/"
        className="text-buzz-yellow hover:text-buzz-yellow-light underline underline-offset-2"
      >
        ← Back to overview
      </a>
    </div>
  );
}
