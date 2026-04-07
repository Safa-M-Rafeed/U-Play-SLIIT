import { useState } from "react";

function TeamDetails({ team, onBack, onUpdateTeam }) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [showRemovePopup, setShowRemovePopup] = useState(false);
  const [removeIndex, setRemoveIndex] = useState(null);
  const [loading, setLoading] = useState(false);

  const [playerData, setPlayerData] = useState({
    name: "",
    studentId: "",
    jerseyNumber: "",
    position: ""
  });

  const calculateChemistry = () => {
    const playerCount = team.players.length;
    let score = 0;

    score += Math.min(playerCount * 10, 50);

    const uniqueJerseys = new Set(team.players.map((p) => p.jerseyNumber));
    if (uniqueJerseys.size === playerCount) {
      score += 20;
    }

    const positions = new Set(team.players.map((p) => p.position));
    score += Math.min(positions.size * 10, 30);

    return Math.min(score, 100);
  };

  const chemistryScore = calculateChemistry();

  const handleEditClick = (index) => {
    const selectedPlayer = team.players[index];

    setPlayerData({
      name: selectedPlayer.name,
      studentId: selectedPlayer.studentId,
      jerseyNumber: selectedPlayer.jerseyNumber,
      position: selectedPlayer.position
    });

    setEditIndex(index);
    setIsEditMode(true);
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setEditIndex(null);
    setPlayerData({
      name: "",
      studentId: "",
      jerseyNumber: "",
      position: ""
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
        `http://localhost:5000/api/teams/${team._id || team.id}/players/${editIndex}`,
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
      handleCancelEdit();
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveClick = (index) => {
    setRemoveIndex(index);
    setShowRemovePopup(true);
  };

  const handleConfirmRemove = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `http://localhost:5000/api/teams/${team._id || team.id}/players/${removeIndex}`,
        {
          method: "DELETE"
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to remove player");
      }

      await onUpdateTeam(data.team, true);
      setShowRemovePopup(false);
      setRemoveIndex(null);
      alert("Player removed successfully ✅");
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRemove = () => {
    setShowRemovePopup(false);
    setRemoveIndex(null);
  };

  const getChemistryColor = () => {
    if (chemistryScore > 75) return "#22c55e";
    if (chemistryScore > 50) return "#eab308";
    return "#ef4444";
  };

  return (
    <div style={styles.page}>
      <div style={styles.topBar}>
        <button onClick={onBack} style={styles.backBtn}>
          ← Back
        </button>
      </div>

      <div style={styles.container}>
        <div style={styles.teamHeader}>
          <div style={styles.logoWrapper}>
            <img
              src={team.logo}
              alt=""
              style={styles.logo}
              onError={(e) => {
                e.target.style.display = "none";
                e.target.nextSibling.style.display = "flex";
              }}
            />
            <div style={styles.logoFallback}>No Logo</div>
          </div>

          <h2 style={styles.teamTitle}>{team.teamName}</h2>

          <p style={styles.metaText}>
            <strong>Captain:</strong> {team.captain || "Captain"}
          </p>

          <p style={styles.metaText}>
            <strong>Players:</strong> {team.players?.length || 0}
          </p>

          <p style={{ ...styles.metaText, color: getChemistryColor(), fontWeight: "700" }}>
            <strong>Chemistry Score:</strong> {chemistryScore}%
          </p>
        </div>

        {isEditMode && (
          <div style={styles.formBox}>
            <h3 style={styles.formTitle}>Edit Player</h3>

            <input
              type="text"
              placeholder="Player Name"
              value={playerData.name}
              onChange={(e) =>
                setPlayerData({ ...playerData, name: e.target.value })
              }
              style={styles.input}
            />

            <input
              type="text"
              placeholder="Student ID"
              value={playerData.studentId}
              onChange={(e) =>
                setPlayerData({ ...playerData, studentId: e.target.value })
              }
              style={styles.input}
            />

            <input
              type="number"
              placeholder="Jersey Number"
              value={playerData.jerseyNumber}
              onChange={(e) =>
                setPlayerData({ ...playerData, jerseyNumber: e.target.value })
              }
              style={styles.input}
            />

            <input
              type="text"
              placeholder="Position"
              value={playerData.position}
              onChange={(e) =>
                setPlayerData({ ...playerData, position: e.target.value })
              }
              style={styles.input}
            />

            <div style={styles.formActionRow}>
              <button style={styles.updateBtn} onClick={handleUpdatePlayer} disabled={loading}>
                {loading ? "Updating..." : "Update"}
              </button>
              <button style={styles.cancelBtn} onClick={handleCancelEdit}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {showRemovePopup && (
          <div style={styles.popupOverlay}>
            <div style={styles.popupBox}>
              <p style={styles.popupText}>
                Are you sure you want to remove this player?
              </p>
              <div style={styles.popupActionRow}>
                <button
                  style={styles.removeConfirmBtn}
                  onClick={handleConfirmRemove}
                  disabled={loading}
                >
                  {loading ? "Removing..." : "Yes, Remove"}
                </button>
                <button style={styles.cancelBtn} onClick={handleCancelRemove}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <h3 style={styles.playerTitle}>Player List</h3>

        {team.players && team.players.length > 0 ? (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Name</th>
                  <th style={styles.th}>Student ID</th>
                  <th style={styles.th}>Jersey Number</th>
                  <th style={styles.th}>Position</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {team.players.map((player, index) => (
                  <tr key={index}>
                    <td style={styles.td}>{player.name}</td>
                    <td style={styles.td}>{player.studentId}</td>
                    <td style={styles.td}>{player.jerseyNumber}</td>
                    <td style={styles.td}>{player.position}</td>
                    <td style={styles.td}>
                      <button
                        style={styles.editBtn}
                        onClick={() => handleEditClick(index)}
                      >
                        Edit
                      </button>
                      <button
                        style={styles.removeBtn}
                        onClick={() => handleRemoveClick(index)}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={styles.noPlayersText}>No players added yet.</p>
        )}
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
  teamHeader: {
    textAlign: "center",
    marginBottom: "22px"
  },
  logoWrapper: {
    width: "120px",
    height: "120px",
    margin: "0 auto 12px auto",
    position: "relative"
  },
  logo: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    borderRadius: "16px",
    display: "block"
  },
  logoFallback: {
    width: "100%",
    height: "100%",
    borderRadius: "16px",
    background: "rgba(255,255,255,0.08)",
    color: "#cbd5e1",
    display: "none",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
    border: "1px dashed rgba(255,255,255,0.15)"
  },
  teamTitle: {
    color: "white",
    fontSize: "30px",
    fontWeight: "700",
    marginBottom: "10px"
  },
  metaText: {
    color: "#cbd5e1",
    margin: "6px 0"
  },
  playerTitle: {
    marginTop: "20px",
    marginBottom: "14px",
    color: "white",
    fontSize: "24px",
    fontWeight: "700"
  },
  tableWrapper: {
    overflowX: "auto"
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    background: "rgba(255,255,255,0.03)",
    borderRadius: "14px",
    overflow: "hidden"
  },
  th: {
    border: "1px solid rgba(255,255,255,0.08)",
    padding: "12px",
    backgroundColor: "rgba(255,255,255,0.08)",
    color: "white",
    fontWeight: "600"
  },
  td: {
    border: "1px solid rgba(255,255,255,0.08)",
    padding: "12px",
    color: "#e2e8f0",
    textAlign: "center"
  },
  noPlayersText: {
    textAlign: "center",
    color: "#cbd5e1",
    marginTop: "18px"
  },
  editBtn: {
    marginRight: "8px",
    padding: "6px 12px",
    backgroundColor: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer"
  },
  removeBtn: {
    padding: "6px 12px",
    backgroundColor: "#dc2626",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer"
  },
  formBox: {
    maxWidth: "420px",
    margin: "0 auto 24px auto",
    padding: "20px",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "16px",
    background: "rgba(255,255,255,0.05)",
    boxShadow: "0 8px 18px rgba(0,0,0,0.14)"
  },
  formTitle: {
    color: "white",
    marginBottom: "14px",
    textAlign: "center"
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
  formActionRow: {
    marginTop: "12px",
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
    cursor: "pointer"
  },
  cancelBtn: {
    padding: "10px 20px",
    backgroundColor: "#9ca3af",
    color: "white",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer"
  },
  popupOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000
  },
  popupBox: {
    backgroundColor: "white",
    padding: "25px",
    borderRadius: "14px",
    width: "360px",
    boxShadow: "0 10px 24px rgba(0,0,0,0.25)",
    textAlign: "center"
  },
  popupText: {
    marginBottom: "16px",
    color: "#111827",
    fontWeight: "500"
  },
  popupActionRow: {
    display: "flex",
    justifyContent: "center",
    gap: "10px"
  },
  removeConfirmBtn: {
    padding: "10px 20px",
    backgroundColor: "#dc2626",
    color: "white",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer"
  }
};

export default TeamDetails;