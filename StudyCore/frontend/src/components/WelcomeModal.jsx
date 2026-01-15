import { useAuth } from "../store/authStore";

export default function WelcomeModal({ onClose }) {
  const user = useAuth((s) => s.user);

  if (!user) return null;

  const greeting =
    user.gender === "female"
      ? `Добро пожаловать, ученица ${user.name}`
      : `Добро пожаловать, ученик${user.name}`;

  return (
    <div style={overlay}>
      <div style={modal}>
        <button onClick={onClose} style={closeBtn}>×</button>
        <h2>{greeting}</h2>
        <p>Роль: {user.role}</p>
      </div>
    </div>
  );
}

const overlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center"
};

const modal = {
  background: "#fff",
  padding: "20px",
  borderRadius: "10px",
  minWidth: "300px",
  position: "relative"
};

const closeBtn = {
  position: "absolute",
  right: "10px",
  top: "10px",
  border: "none",
  background: "transparent",
  fontSize: "20px",
  cursor: "pointer"
};
