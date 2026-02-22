import type { Participant } from "../../../hooks/useSocket";

type Props = {
  participants: Participant[];
  buzzedName: string | null;
};

export default function ParticipantsList({ participants, buzzedName }: Props) {
  return (
    <section>
      <h2 className="text-lg font-semibold mb-2 text-buzz-yellow">
        Participants ({participants.length})
      </h2>
      <ul className="text-yellow-100/90">
        {participants.map((p) => (
          <li key={p.id}>{p.name}</li>
        ))}
      </ul>
      {buzzedName && (
        <p className="mt-2 text-buzz-yellow font-semibold">First buzz: {buzzedName}</p>
      )}
    </section>
  );
}
