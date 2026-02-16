import { useAuth } from "../context/AuthContext";

export default function Ranking() {
  const { user } = useAuth();

  const fakePlayers = [
    { name: "Player1", balance: 12000 },
    { name: "Player2", balance: 9000 },
    { name: "Player3", balance: 5000 },
    { name: user?.email || "Tú", balance: user?.balance || 0 }
  ];

  const sorted = fakePlayers.sort((a,b) => b.balance - a.balance);

  return (
    <div className="container">
      <h1>Ranking</h1>
      <ol>
        {sorted.map((p,i) => (
          <li key={i}>{p.name}: {p.balance} €</li>
        ))}
      </ol>
    </div>
  );
}