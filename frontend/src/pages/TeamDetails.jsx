import { useEffect, useState } from "react";

function TeamDetails({ team, onBack, onUpdateTeam }) {
  const [loading, setLoading] = useState(false);
  const [selectedPlayerIndex, setSelectedPlayerIndex] = useState(0);

  const [playerData, setPlayerData] = useState({
    name: "",
    studentId: "",
    jerseyNumber: "",
    position: ""
  });

  useEffect(() => {
    if (team?.players?.length > 0) {
      const firstPlayer = team.players[0];
      setSelectedPlayerIndex(0);
      setPlayerData({
        name: firstPlayer.name || "",
        studentId: firstPlayer.studentId || "",
        jerseyNumber: firstPlayer.jerseyNumber || "",
        position: firstPlayer.position || ""
      });
    }
  }, [team]);

  const handlePlayerChange = (index) => {
    const selectedPlayer = team.players[index];
    setSelectedPlayerIndex(index);
    setPlayerData({
      name: selectedPlayer.name || "",
      studentId: selectedPlayer.studentId || "",
      jerseyNumber: selectedPlayer.jerseyNumber || "",
      position: selectedPlayer.position || ""
    });
  };

  const handleUpdatePlayer = async () => {
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
        `http://localhost:5000/api/teams/${team._id || team.id}/players/${selectedPlayerIndex}`,
        {
          method: "PUT",
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
        throw new Error(data.message || "Failed to update player");
      }

      await onUpdateTeam(data.team, true);
      alert("Player updated successfully ✅");
      onBack();
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!team?.players?.length) {
    return (
      <div style={styles.page}>
        <div style={styles.topBar}>
          <button onClick={onBack} style={styles.backBtn}>
            ← Back
          </button>
        </div>

        <div style={styles.container}>
          <h2 style={styles.heading}>Edit Player Details</h2>
          <p style={styles.subText}>No players available to edit.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.topBar}>
        <button onClick={onBack} style={styles.backBtn}>
          ← Back
        </button>
      </div>

      <div style={styles.container}>
        <h2 style={styles.heading}>Edit Player Details</h2>
        <p style={styles.subText}>
          Select a player and update the details below.
        </p>

        <div style={styles.formBox}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Select Player</label>
            <select
              value={selectedPlayerIndex}
              onChange={(e) => handlePlayerChange(Number(e.target.value))}
              style={styles.selectInput}
            >
              {team.players.map((player, index) => (
                <option key={index} value={index} style={styles.option}>
                  {player.name} - #{player.jerseyNumber}
                </option>
              ))}
            </select>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Player Name</label>
            <input
              type="text"
              placeholder="Player Name"
              value={playerData.name}
              onChange={(e) =>
                setPlayerData({ ...playerData, name: e.target.value })
              }
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Student ID</label>
            <input
              type="text"
              placeholder="Student ID"
              value={playerData.studentId}
              onChange={(e) =>
                setPlayerData({ ...playerData, studentId: e.target.value })
              }
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Jersey Number</label>
            <input
              type="number"
              placeholder="Jersey Number"
              value={playerData.jerseyNumber}
              onChange={(e) =>
                setPlayerData({ ...playerData, jerseyNumber: e.target.value })
              }
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Position</label>
            <input
              type="text"
              placeholder="Position"
              value={playerData.position}
              onChange={(e) =>
                setPlayerData({ ...playerData, position: e.target.value })
              }
              style={styles.input}
            />
          </div>

          <div style={styles.formActionRow}>
            <button
              style={styles.updateBtn}
              onClick={handleUpdatePlayer}
              disabled={loading}
            >
              {loading ? "Updating..." : "Update"}
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
    padding: "10px 18px",
    cursor: "pointer",
    background: "linear-gradient(90deg, #1e293b, #334155)",
    color: "#ffffff",
    border: "1px solid rgba(255,255,255,0.16)",
    borderRadius: "10px",
    fontWeight: "600",
    fontSize: "14px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.2)"
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
    maxWidth: "460px",
    margin: "0 auto",
    padding: "20px",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "16px",
    background: "rgba(255,255,255,0.05)",
    boxShadow: "0 8px 18px rgba(0,0,0,0.14)"
  },
  formGroup: {
    marginBottom: "14px"
  },
  label: {
    display: "block",
    marginBottom: "8px",
    color: "#e2e8f0",
    fontSize: "14px",
    fontWeight: "600"
  },
  input: {
    display: "block",
    width: "100%",
    padding: "10px 12px",
    boxSizing: "border-box",
    borderRadius: "10px",
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(15,23,42,0.9)",
    color: "#ffffff",
    fontSize: "14px"
  },
  selectInput: {
    display: "block",
    width: "100%",
    padding: "10px 12px",
    boxSizing: "border-box",
    borderRadius: "10px",
    border: "1px solid rgba(255,255,255,0.12)",
    background: "#0f172a",
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: "500"
  },
  option: {
    backgroundColor: "#0f172a",
    color: "#ffffff"
  },
  formActionRow: {
    marginTop: "18px",
    display: "flex",
    justifyContent: "center",
    gap: "10px"
  },
  updateBtn: {
    padding: "10px 20px",
    backgroundColor: "#22c55e",
    color: "white",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "600"
  },
  cancelBtn: {
    padding: "10px 20px",
    backgroundColor: "#9ca3af",
    color: "white",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "600"
  }
};

export default TeamDetails;