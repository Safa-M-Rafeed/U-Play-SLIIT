import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

function RegisterTournamentPage({ team: selectedTeamProp }) {
  const { user } = useAuth();
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [selectedTournament, setSelectedTournament] = useState("");
  const [loading, setLoading] = useState(false);

  const tournaments = [
    "Football Championship",
    "Cricket League",
    "Esports Tournament",
    "Basketball Cup"
  ];

  const currentCaptainId =
    user?.id || user?._id || user?.email || user?.username || "";

  useEffect(() => {
    if (selectedTeamProp) {
      setSelectedTeam(selectedTeamProp);
      return;
    }

    const fetchCaptainTeam = async () => {
      if (!currentCaptainId) return;

      try {
        const response = await fetch(
          `http://localhost:5000/api/teams/captain/${encodeURIComponent(currentCaptainId)}`
        );

        if (response.status === 404) {
          setSelectedTeam(null);
          return;
        }

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch team");
        }

        setSelectedTeam(data);
      } catch (error) {
        console.error("Error fetching captain team:", error.message);
      }
    };

    fetchCaptainTeam();
  }, [currentCaptainId, selectedTeamProp]);

  const handleRegister = async () => {
    if (!selectedTeam) {
      alert("No team found");
      return;
    }

    if (!selectedTournament) {
      alert("Please select a tournament");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("http://localhost:5000/api/registrations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          teamId: selectedTeam._id || selectedTeam.id,
          tournament: selectedTournament
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to register team");
      }

      setSelectedTeam(data.team);
      setSelectedTournament("");

      alert("✅ Team registered successfully! Status: Pending");
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status) => {
    if (status === "Approved") {
      return {
        backgroundColor: "rgba(34,197,94,0.15)",
        color: "#86efac",
        border: "1px solid rgba(34,197,94,0.25)"
      };
    }

    if (status === "Rejected") {
      return {
        backgroundColor: "rgba(239,68,68,0.15)",
        color: "#fca5a5",
        border: "1px solid rgba(239,68,68,0.25)"
      };
    }

    return {
      backgroundColor: "rgba(250,204,21,0.15)",
      color: "#fde68a",
      border: "1px solid rgba(250,204,21,0.25)"
    };
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <h2 style={styles.heading}>Register Tournament</h2>

        {selectedTeam ? (
          <>
            <div style={styles.teamBox}>
              <div style={styles.logoWrapper}>
                <img
                  src={selectedTeam.logo}
                  alt=""
                  style={styles.logo}
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.nextSibling.style.display = "flex";
                  }}
                />
                <div style={styles.logoFallback}>No Logo</div>
              </div>

              <h3 style={styles.teamName}>{selectedTeam.teamName}</h3>
              <p style={styles.meta}>Captain: {selectedTeam.captain}</p>
              <p style={styles.meta}>
                Players: {selectedTeam.players?.length || 0}
              </p>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Select Tournament</label>
              <select
                value={selectedTournament}
                onChange={(e) => setSelectedTournament(e.target.value)}
                style={styles.select}
              >
                <option value="" style={styles.option}>
                  -- Select Tournament --
                </option>
                {tournaments.map((t, i) => (
                  <option key={i} value={t} style={styles.option}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <button style={styles.button} onClick={handleRegister} disabled={loading}>
              {loading ? "Registering..." : "Register Team"}
            </button>

            <div style={styles.section}>
              <h3 style={styles.subHeading}>My Registered Tournaments</h3>

              {selectedTeam.registrations && selectedTeam.registrations.length > 0 ? (
                <div style={styles.list}>
                  {selectedTeam.registrations.map((item, index) => (
                    <div key={index} style={styles.listItem}>
                      <div>
                        <p style={styles.tournamentName}>{item.tournament}</p>
                      </div>

                      <span
                        style={{
                          ...styles.statusBadge,
                          ...getStatusStyle(item.status)
                        }}
                      >
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={styles.emptyText}>No tournaments registered yet.</p>
              )}
            </div>
          </>
        ) : (
          <p style={styles.emptyText}>
            No team available. Please create a team first.
          </p>
        )}
      </div>
    </div>
  );
}

const styles = {
  wrapper: { display: "flex", justifyContent: "center", marginTop: "20px" },
  card: {
    width: "100%",
    maxWidth: "720px",
    background: "rgba(15,23,42,0.75)",
    border: "1px solid rgba(148,163,184,0.14)",
    borderRadius: "20px",
    padding: "30px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.2)"
  },
  heading: {
    textAlign: "center",
    color: "white",
    marginBottom: "24px",
    fontSize: "28px",
    fontWeight: "700"
  },
  teamBox: { textAlign: "center", marginBottom: "24px" },
  logoWrapper: { width: "100px", height: "100px", margin: "0 auto 12px auto", position: "relative" },
  logo: {
    width: "100%",
    height: "100%",
    borderRadius: "16px",
    objectFit: "cover",
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
  teamName: { color: "white", marginTop: "10px", fontSize: "24px", fontWeight: "700" },
  meta: { color: "#cbd5e1", margin: "5px 0" },
  formGroup: { marginBottom: "18px" },
  label: { color: "#cbd5e1", display: "block", marginBottom: "8px", fontWeight: "500" },
  select: {
    width: "100%",
    padding: "12px",
    borderRadius: "12px",
    background: "#0f172a",
    color: "white",
    border: "1px solid rgba(255,255,255,0.15)",
    outline: "none"
  },
  option: { backgroundColor: "#0f172a", color: "white" },
  button: {
    width: "100%",
    padding: "12px",
    borderRadius: "12px",
    background: "linear-gradient(90deg, #22c55e, #16a34a)",
    color: "white",
    border: "none",
    cursor: "pointer",
    fontWeight: "600",
    marginBottom: "28px"
  },
  section: { marginTop: "10px" },
  subHeading: { color: "white", fontSize: "22px", fontWeight: "700", marginBottom: "16px" },
  list: { display: "flex", flexDirection: "column", gap: "14px" },
  listItem: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "14px",
    padding: "16px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px"
  },
  tournamentName: { color: "white", margin: 0, fontSize: "16px", fontWeight: "600" },
  statusBadge: {
    padding: "8px 14px",
    borderRadius: "999px",
    fontSize: "13px",
    fontWeight: "700",
    minWidth: "90px",
    textAlign: "center"
  },
  emptyText: { color: "#cbd5e1", textAlign: "center", marginTop: "10px" }
};

export default RegisterTournamentPage;