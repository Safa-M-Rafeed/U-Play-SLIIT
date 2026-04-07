import { useState } from "react";
import { useAuth } from "../context/AuthContext";

function CreateTeam({ addTeam }) {
  const { user } = useAuth();

  const [teamName, setTeamName] = useState("");
  const [logo, setLogo] = useState(null);
  const [sport, setSport] = useState("Football");
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const getCaptainName = () => {
    return user?.fullName || user?.name || user?.username || user?.email || "Captain";
  };

  const getCaptainId = () => {
    return user?.id || user?._id || user?.email || user?.username || "";
  };

  const handleCreateTeam = async () => {
    const trimmedName = teamName.trim();

    if (!trimmedName || !logo) {
      alert("Please enter team name and upload a logo");
      return;
    }

    if (trimmedName.length < 3 || trimmedName.length > 50) {
      alert("Team name must be between 3 and 50 characters");
      return;
    }

    const allowedFormats = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    if (!allowedFormats.includes(logo.type)) {
      alert("Only PNG, JPG, JPEG, WEBP formats allowed");
      return;
    }

    const maxSize = 2 * 1024 * 1024;
    if (logo.size > maxSize) {
      alert("Logo size must be less than 2MB");
      return;
    }

    const captainId = getCaptainId();
    if (!captainId) {
      alert("Captain identity not found. Please log in again.");
      return;
    }

    const reader = new FileReader();

    reader.onload = async () => {
      try {
        setLoading(true);

        const payload = {
          teamName: trimmedName,
          sport,
          logo: reader.result,
          captain: getCaptainName(),
          captainId,
          players: [],
          registrations: [],
          chemistryScore: 0
        };

        const response = await fetch("http://localhost:5000/api/teams", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to create team");
        }

        addTeam(data.team);

        setTeamName("");
        setLogo(null);
        setSport("Football");
        setShowSuccess(true);

        setTimeout(() => {
          setShowSuccess(false);
        }, 2500);
      } catch (error) {
        alert(error.message);
      } finally {
        setLoading(false);
      }
    };

    reader.onerror = () => {
      alert("Failed to read logo file");
    };

    reader.readAsDataURL(logo);
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <div style={styles.topBadge}>Captain Team Setup</div>

        <h2 style={styles.heading}>Let&apos;s create your Team...!</h2>

        <p style={styles.subText}>
          Create your team profile with a unique team name and logo.
        </p>

        {showSuccess && (
          <div style={styles.successBox}>
            <span style={styles.successIcon}>✅</span>
            <span>Team created successfully</span>
          </div>
        )}

        <div style={styles.formGroup}>
          <label style={styles.label}>Team Name</label>
          <input
            type="text"
            placeholder="Enter team name"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            style={styles.input}
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Sport</label>
          <select
            value={sport}
            onChange={(e) => setSport(e.target.value)}
            style={styles.input}
          >
            <option value="Football">Football</option>
            <option value="Cricket">Cricket</option>
            <option value="Basketball">Basketball</option>
            <option value="Esports">Esports</option>
          </select>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Upload Team Logo</label>
          <input
            type="file"
            accept=".png,.jpg,.jpeg,.webp"
            onChange={(e) => setLogo(e.target.files[0])}
            style={styles.input}
          />
        </div>

        <button
          style={styles.createBtn}
          onClick={handleCreateTeam}
          disabled={loading}
        >
          {loading ? "Creating..." : "Create Team"}
        </button>
      </div>
    </div>
  );
}

const styles = {
  wrapper: { width: "100%", display: "flex", justifyContent: "center", marginTop: "20px" },
  card: {
    width: "100%",
    maxWidth: "520px",
    background: "rgba(15,23,42,0.75)",
    border: "1px solid rgba(148,163,184,0.15)",
    borderRadius: "24px",
    padding: "30px",
    boxShadow: "0 12px 30px rgba(0,0,0,0.25)"
  },
  topBadge: {
    display: "inline-block",
    padding: "6px 12px",
    borderRadius: "999px",
    background: "rgba(59,130,246,0.12)",
    color: "#60a5fa",
    fontSize: "12px",
    fontWeight: "600",
    marginBottom: "16px"
  },
  heading: { textAlign: "left", color: "white", marginBottom: "8px", fontSize: "30px", fontWeight: "700" },
  subText: { color: "#94a3b8", marginBottom: "24px", fontSize: "14px" },
  successBox: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    background: "rgba(34,197,94,0.12)",
    color: "#86efac",
    border: "1px solid rgba(34,197,94,0.2)",
    borderRadius: "14px",
    padding: "12px 14px",
    marginBottom: "18px",
    fontWeight: "600"
  },
  successIcon: { fontSize: "18px" },
  formGroup: { marginBottom: "18px" },
  label: { display: "block", marginBottom: "8px", color: "#cbd5e1", fontSize: "14px", fontWeight: "500" },
  input: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: "14px",
    border: "1px solid rgba(148,163,184,0.18)",
    background: "rgba(255,255,255,0.04)",
    color: "white",
    boxSizing: "border-box",
    outline: "none"
  },
  createBtn: {
    width: "100%",
    padding: "13px 16px",
    borderRadius: "14px",
    border: "none",
    background: "linear-gradient(90deg, #3b82f6, #8b5cf6)",
    color: "white",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "700",
    marginTop: "10px"
  }
};

export default CreateTeam;