import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function CaptainTournamentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [tournament, setTournament] = useState(null);
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(false);

  const currentCaptainId =
    user?.id || user?._id || user?.email || user?.username || "";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tournamentResponse, teamResponse] = await Promise.all([
          fetch(`http://localhost:5000/api/tournaments/${id}`),
          fetch(
            `http://localhost:5000/api/teams/captain/${encodeURIComponent(currentCaptainId)}`
          )
        ]);

        const tournamentData = await tournamentResponse.json();

        if (!tournamentResponse.ok) {
          throw new Error(tournamentData.message || "Failed to fetch tournament");
        }

        setTournament(tournamentData);

        if (teamResponse.ok) {
          const teamData = await teamResponse.json();
          setTeam(teamData);
        }
      } catch (error) {
        console.error(error.message);
      }
    };

    if (id && currentCaptainId) {
      fetchData();
    }
  }, [id, currentCaptainId]);

  const handleRegisterTeam = async () => {
    if (!team?._id || !tournament?._id) {
      alert("Team or tournament details missing");
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
          teamId: team._id,
          tournamentId: tournament._id
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to register");
      }

      alert("Registration submitted successfully ✅ Status: Pending");
      navigate("/captain/status");
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!tournament) {
    return (
      <div style={{ padding: "40px", color: "white" }}>
        Loading tournament details...
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.topBar}>
        <button style={styles.backBtn} onClick={() => navigate("/captain/tournaments")}>
          ← Back to tournaments
        </button>
      </div>

      <div style={styles.container}>
        <div style={styles.headerRow}>
          <div>
            <h1 style={styles.title}>{tournament.name}</h1>
            <p style={styles.subText}>
              {tournament.sport} • {tournament.status}
            </p>
          </div>

          <button style={styles.registerBtn} onClick={handleRegisterTeam} disabled={loading}>
            {loading ? "Registering..." : "Register Team"}
          </button>
        </div>

        <div style={styles.grid}>
          <div style={styles.infoCard}>
            <p style={styles.label}>Start date</p>
            <p style={styles.value}>
              {tournament.date ? new Date(tournament.date).toLocaleDateString() : "TBD"}
            </p>
          </div>

          <div style={styles.infoCard}>
            <p style={styles.label}>Tournament status</p>
            <p style={styles.value}>{tournament.status}</p>
          </div>

          <div style={styles.infoCard}>
            <p style={styles.label}>Teams registered</p>
            <p style={styles.value}>
              {tournament.registeredTeams || 0} / {tournament.totalTeams || 0}
            </p>
          </div>

          <div style={styles.infoCard}>
            <p style={styles.label}>Format</p>
            <p style={styles.value}>Group Stage + Playoffs</p>
          </div>
        </div>

        <div style={styles.descriptionCard}>
          <h3 style={styles.sectionTitle}>Rules & Description</h3>
          <p style={styles.desc}>
            Tournament registration request will be sent to admin. After admin approval,
            the tournament will appear under Register Tournament.
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#08111f",
    padding: "24px"
  },
  topBar: {
    marginBottom: "20px"
  },
  backBtn: {
    padding: "10px 18px",
    background: "rgba(255,255,255,0.08)",
    color: "#fff",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "10px",
    cursor: "pointer"
  },
  container: {
    maxWidth: "1100px",
    margin: "0 auto",
    color: "white"
  },
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    marginBottom: "24px",
    flexWrap: "wrap"
  },
  title: {
    fontSize: "42px",
    fontWeight: "800",
    margin: 0
  },
  subText: {
    color: "#94a3b8",
    marginTop: "10px"
  },
  registerBtn: {
    padding: "14px 24px",
    background: "linear-gradient(90deg, #22c55e, #16a34a)",
    color: "white",
    border: "none",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: "700"
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "16px",
    marginBottom: "20px"
  },
  infoCard: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "16px",
    padding: "20px"
  },
  label: {
    color: "#94a3b8",
    fontSize: "14px",
    marginBottom: "8px"
  },
  value: {
    color: "white",
    fontSize: "20px",
    fontWeight: "700",
    margin: 0
  },
  descriptionCard: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "16px",
    padding: "20px"
  },
  sectionTitle: {
    marginBottom: "12px"
  },
  desc: {
    color: "#cbd5e1",
    lineHeight: 1.6
  }
};

export default CaptainTournamentDetails;