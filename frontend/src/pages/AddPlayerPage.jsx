import { useState } from "react";

function AddPlayerPage({ team, onBack, onUpdateTeam }) {
  const [playerData, setPlayerData] = useState({
    name: "",
    studentId: "",
    jerseyNumber: "",
    position: ""
  });

  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    setPlayerData({
      ...playerData,
      [e.target.name]: e.target.value
    });
  };

  const handleAddPlayer = async () => {
    if (
      !playerData.name.trim() ||
      !playerData.studentId.trim() ||
      !playerData.jerseyNumber ||
      !playerData.position.trim()
    ) {
      alert("Please fill all player fields");
      return;
    }

    const jersey = Number(playerData.jerseyNumber);

    if (jersey < 1 || jersey > 99) {
      alert("Jersey number must be between 1 and 99");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `http://localhost:5000/api/teams/${team._id || team.id}/players`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            ...playerData,
            jerseyNumber: jersey
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to add player");
      }

      await onUpdateTeam(data.team);
      alert("Player added successfully ✅");
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.topBar}>
        <button onClick={onBack} style={styles.backBtn}>
          ← Back
        </button>
      </div>

      <div style={styles.container}>
        <h2 style={styles.heading}>Add Player</h2>
        <p style={styles.subText}>
          Add a new player to <strong>{team.teamName}</strong>
        </p>

        <div style={styles.formBox}>
          <input
            type="text"
            name="name"
            placeholder="Player Name"
            value={playerData.name}
            onChange={handleInputChange}
            style={styles.input}
          />

          <input
            type="text"
            name="studentId"
            placeholder="Student ID"
            value={playerData.studentId}
            onChange={handleInputChange}
            style={styles.input}
          />

          <input
            type="number"
            name="jerseyNumber"
            placeholder="Jersey Number"
            value={playerData.jerseyNumber}
            onChange={handleInputChange}
            style={styles.input}
          />

          <input
            type="text"
            name="position"
            placeholder="Position"
            value={playerData.position}
            onChange={handleInputChange}
            style={styles.input}
          />

          <div style={styles.actionRow}>
            <button style={styles.addBtn} onClick={handleAddPlayer} disabled={loading}>
              {loading ? "Adding..." : "Add"}
            </button>
            <button style={styles.cancelBtn} onClick={onBack}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    width: "100%",
    minHeight: "100%",
    padding: "10px 0"
  },
  topBar: {
    width: "100%",
    display: "flex",
    justifyContent: "flex-start",
    marginBottom: "14px"
  },
  backBtn: {
    padding: "8px 16px",
    cursor: "pointer",
    backgroundColor: "#f0f0f0",
    border: "1px solid #ccc",
    borderRadius: "8px"
  },
  container: {
    background: "rgba(15,23,42,0.75)",
    border: "1px solid rgba(148,163,184,0.14)",
    borderRadius: "20px",
    padding: "24px",
    boxShadow: "0 12px 30px rgba(0,0,0,0.18)"
  },
  heading: {
    color: "white",
    fontSize: "28px",
    fontWeight: "700",
    marginBottom: "8px",
    textAlign: "center"
  },
  subText: {
    color: "#cbd5e1",
    textAlign: "center",
    marginBottom: "20px"
  },
  formBox: {
    maxWidth: "420px",
    margin: "0 auto",
    padding: "20px",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "16px",
    background: "rgba(255,255,255,0.05)",
    boxShadow: "0 8px 18px rgba(0,0,0,0.14)"
  },
  input: {
    display: "block",
    width: "100%",
    padding: "10px 12px",
    margin: "8px 0",
    boxSizing: "border-box",
    borderRadius: "10px",
    border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(255,255,255,0.06)",
    color: "white"
  },
  actionRow: {
    marginTop: "12px",
    display: "flex",
    justifyContent: "center",
    gap: "10px"
  },
  addBtn: {
    padding: "10px 20px",
    backgroundColor: "#22c55e",
    color: "white",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer"
  },
  cancelBtn: {
    padding: "10px 20px",
    backgroundColor: "#9ca3af",
    color: "white",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer"
  }
};

export default AddPlayerPage;