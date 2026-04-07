import { useState } from "react";
import PublicTeamDetails from "./PublicTeamDetails";

function PublicTeamProfile() {
  const [selectedTeam, setSelectedTeam] = useState(null);
  const teams = JSON.parse(localStorage.getItem("teams")) || [];

  if (selectedTeam) {
    return (
      <PublicTeamDetails
        team={selectedTeam}
        onBack={() => setSelectedTeam(null)}
      />
    );
  }

  return (
    <div style={styles.wrapper}>
      <h2 style={styles.heading}>Team Profiles</h2>

      {teams.length === 0 ? (
        <div style={styles.emptyBox}>
          <p style={styles.emptyText}>No teams available yet.</p>
        </div>
      ) : (
        <div style={styles.grid}>
          {teams.map((team) => (
            <div
              key={team.id}
              style={styles.card}
              onClick={() => setSelectedTeam(team)}
            >
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
                <div style={styles.logoFallback}>
                  No Logo
                </div>
              </div>

              <h3 style={styles.teamName}>{team.teamName}</h3>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  wrapper: {
    width: "100%",
    padding: "20px"
  },
  heading: {
    color: "white",
    fontSize: "28px",
    fontWeight: "700",
    marginBottom: "20px",
    textAlign: "center"
  },
  emptyBox: {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "18px",
    padding: "30px",
    textAlign: "center"
  },
  emptyText: {
    color: "#cbd5e1",
    margin: 0
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "20px"
  },
  card: {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "18px",
    padding: "22px",
    cursor: "pointer",
    textAlign: "center",
    transition: "all 0.2s ease",
    boxShadow: "0 10px 25px rgba(0,0,0,0.15)"
  },
  logoWrapper: {
    width: "100px",
    height: "100px",
    margin: "0 auto 14px auto",
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
  teamName: {
    color: "white",
    fontSize: "20px",
    fontWeight: "600",
    margin: 0
  }
};

export default PublicTeamProfile;