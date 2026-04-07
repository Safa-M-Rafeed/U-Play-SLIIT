function PublicTeamDetails({ team, onBack }) {
  const captainName =
    team?.captain ||
    team?.captainName ||
    team?.createdByName ||
    "Captain";

  const registrationStatus =
    team?.registrationStatus || "Not Registered";

  const players = team?.players || [];

  const calculateChemistry = () => {
    const playerCount = players.length;
    let score = 0;

    score += Math.min(playerCount * 10, 50);

    const uniqueJerseys = new Set(players.map((p) => p.jerseyNumber));
    if (uniqueJerseys.size === playerCount && playerCount > 0) {
      score += 20;
    }

    const positions = new Set(players.map((p) => p.position));
    score += Math.min(positions.size * 10, 30);

    return Math.min(score, 100);
  };

  const chemistryScore = calculateChemistry();

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
              src={team?.logo}
              alt=""
              style={styles.logo}
              onError={(e) => {
                e.target.style.display = "none";
                e.target.nextSibling.style.display = "flex";
              }}
            />
            <div style={styles.logoFallback}>No Logo</div>
          </div>

          <h2 style={styles.teamTitle}>{team?.teamName || "Team"}</h2>

          <p style={styles.metaText}>
            <strong>Captain:</strong> {captainName}
          </p>

          <p style={styles.metaText}>
            <strong>Players:</strong> {players.length}
          </p>

          <p style={{ ...styles.metaText, color: getChemistryColor(), fontWeight: "700" }}>
            <strong>Chemistry Score:</strong> {chemistryScore}%
          </p>

          <p style={styles.metaText}>
            <strong>Registration Status:</strong> {registrationStatus}
          </p>
        </div>

        <h3 style={styles.playerTitle}>Player List</h3>

        {players.length > 0 ? (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Name</th>
                  <th style={styles.th}>Student ID</th>
                  <th style={styles.th}>Jersey Number</th>
                  <th style={styles.th}>Position</th>
                </tr>
              </thead>
              <tbody>
                {players.map((player, index) => (
                  <tr key={index}>
                    <td style={styles.td}>{player.name}</td>
                    <td style={styles.td}>{player.studentId}</td>
                    <td style={styles.td}>{player.jerseyNumber}</td>
                    <td style={styles.td}>{player.position}</td>
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
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
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
  }
};

export default PublicTeamDetails;