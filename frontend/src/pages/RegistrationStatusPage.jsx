import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

function RegistrationStatusPage() {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [team, setTeam] = useState(null);

  const currentCaptainId =
    user?.id || user?._id || user?.email || user?.username || "";

  useEffect(() => {
    const fetchData = async () => {
      if (!currentCaptainId) return;

      try {
        const [teamResponse, registrationResponse] = await Promise.all([
          fetch(
            `http://localhost:5000/api/teams/captain/${encodeURIComponent(currentCaptainId)}`
          ),
          fetch(
            `http://localhost:5000/api/registrations/captain/${encodeURIComponent(currentCaptainId)}`
          )
        ]);

        if (teamResponse.status !== 404) {
          const teamData = await teamResponse.json();
          if (teamResponse.ok) {
            setTeam(teamData);
          }
        }

        const registrationData = await registrationResponse.json();
        if (registrationResponse.ok) {
          setRegistrations(registrationData);
        }
      } catch (error) {
        console.error("Error fetching registration status:", error.message);
      }
    };

    fetchData();
  }, [currentCaptainId]);

  const handleReRegister = async (registrationId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/registrations/${registrationId}/reregister`,
        {
          method: "PUT"
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to re-register");
      }

      const refreshed = await fetch(
        `http://localhost:5000/api/registrations/captain/${encodeURIComponent(currentCaptainId)}`
      );
      const refreshedData = await refreshed.json();

      if (refreshed.ok) {
        setRegistrations(refreshedData);
      }

      alert("Tournament re-registration submitted successfully ✅");
    } catch (error) {
      alert(error.message);
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
        <h2 style={styles.heading}>Registration Status</h2>

        {team ? (
          <>
            <div style={styles.teamBox}>
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

              <h3 style={styles.teamName}>{team.teamName}</h3>
              <p style={styles.meta}>Captain: {team.captain}</p>
              <p style={styles.meta}>
                Players: {team.players?.length || 0}
              </p>
            </div>

            <div style={styles.section}>
              <h3 style={styles.subHeading}>My Tournament Requests</h3>

              {registrations.length > 0 ? (
                <div style={styles.list}>
                  {registrations.map((item) => (
                    <div key={item._id} style={styles.listItem}>
                      <div style={styles.leftBlock}>
                        <p style={styles.tournamentName}>
                          {item.tournamentName}
                        </p>

                        <p style={styles.dateText}>
                          Submitted: {new Date(item.createdAt).toLocaleString()}
                        </p>

                        {item.status === "Approved" && item.approvedAt ? (
                          <p style={styles.approvedText}>
                            Approved: {new Date(item.approvedAt).toLocaleString()}
                          </p>
                        ) : null}

                        {item.status === "Rejected" && item.rejectionReason ? (
                          <p style={styles.reasonText}>
                            Reason: {item.rejectionReason}
                          </p>
                        ) : null}
                      </div>

                      <div style={styles.rightBlock}>
                        <span
                          style={{
                            ...styles.statusBadge,
                            ...getStatusStyle(item.status)
                          }}
                        >
                          {item.status}
                        </span>

                        {item.status === "Rejected" && (
                          <button
                            style={styles.reRegisterBtn}
                            onClick={() => handleReRegister(item._id)}
                          >
                            Re-register
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={styles.emptyText}>No registrations found yet.</p>
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
  leftBlock: { flex: 1 },
  rightBlock: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: "10px"
  },
  tournamentName: { color: "white", margin: 0, fontSize: "16px", fontWeight: "600" },
  dateText: { color: "#94a3b8", marginTop: "6px", fontSize: "13px" },
  approvedText: { color: "#86efac", marginTop: "6px", fontSize: "13px" },
  reasonText: { color: "#fca5a5", marginTop: "6px", fontSize: "13px" },
  statusBadge: {
    padding: "8px 14px",
    borderRadius: "999px",
    fontSize: "13px",
    fontWeight: "700",
    minWidth: "90px",
    textAlign: "center"
  },
  reRegisterBtn: {
    padding: "8px 14px",
    borderRadius: "10px",
    backgroundColor: "#2563eb",
    color: "white",
    border: "none",
    cursor: "pointer",
    fontWeight: "600"
  },
  emptyText: { color: "#cbd5e1", textAlign: "center", marginTop: "10px" }
};

export default RegistrationStatusPage;