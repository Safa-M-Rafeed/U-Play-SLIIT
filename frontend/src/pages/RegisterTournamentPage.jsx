import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

function RegisterTournamentPage({ team: selectedTeamProp }) {
  const { user } = useAuth();
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [registrations, setRegistrations] = useState([]);

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

  useEffect(() => {
    const fetchRegistrations = async () => {
      if (!currentCaptainId) return;

      try {
        const response = await fetch(
          `http://localhost:5000/api/registrations/captain/${encodeURIComponent(currentCaptainId)}`
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch registrations");
        }

        setRegistrations(data);
      } catch (error) {
        console.error("Error fetching registrations:", error.message);
      }
    };

    fetchRegistrations();
  }, [currentCaptainId]);

  const approvedRegistrations = registrations.filter(
    (item) => item.status === "Approved"
  );

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <h2 style={styles.heading}>Approved Tournament Entries</h2>

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

            <div style={styles.section}>
              <h3 style={styles.subHeading}>Approved Tournaments</h3>

              {approvedRegistrations.length > 0 ? (
                <div style={styles.list}>
                  {approvedRegistrations.map((item) => (
                    <div key={item._id} style={styles.listItem}>
                      <div>
                        <p style={styles.tournamentName}>{item.tournamentName}</p>
                        <p style={styles.dateText}>
                          Approved on: {new Date(item.approvedAt || item.updatedAt || item.createdAt).toLocaleString()}
                        </p>
                      </div>

                      <span style={styles.approvedBadge}>Approved</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={styles.emptyText}>
                  No approved tournaments yet. Wait for admin approval.
                </p>
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
    maxWidth: "760px",
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
  dateText: { color: "#94a3b8", fontSize: "13px", marginTop: "6px" },
  approvedBadge: {
    padding: "8px 14px",
    borderRadius: "999px",
    fontSize: "13px",
    fontWeight: "700",
    minWidth: "90px",
    textAlign: "center",
    backgroundColor: "rgba(34,197,94,0.15)",
    color: "#86efac",
    border: "1px solid rgba(34,197,94,0.25)"
  },
  emptyText: { color: "#cbd5e1", textAlign: "center", marginTop: "10px" }
};

export default RegisterTournamentPage;