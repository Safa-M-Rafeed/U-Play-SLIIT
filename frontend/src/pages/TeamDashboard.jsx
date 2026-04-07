import { useState } from "react";

function TeamDashboard({ teams, onSelectTeam, onUpdateTeam, onDeleteTeam }) {
  const [editingTeamId, setEditingTeamId] = useState(null);
  const [editedTeamName, setEditedTeamName] = useState("");
  const [newLogo, setNewLogo] = useState(null);
  const [previewLogo, setPreviewLogo] = useState(null);

  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState(null);

  const handleEditClick = (team) => {
    setEditingTeamId(team.id);
    setEditedTeamName(team.teamName);
    setPreviewLogo(team.logo);
  };

  const handleCancelEdit = () => {
    setEditingTeamId(null);
    setEditedTeamName("");
    setNewLogo(null);
    setPreviewLogo(null);
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedFormats = [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/webp"
    ];

    if (!allowedFormats.includes(file.type)) {
      alert("Only PNG, JPG, JPEG, WEBP allowed");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setPreviewLogo(reader.result);
      setNewLogo(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveEdit = (team) => {
    const trimmedName = editedTeamName.trim();

    if (!trimmedName) {
      alert("Team name required");
      return;
    }

    if (trimmedName.length < 3 || trimmedName.length > 50) {
      alert("Team name must be between 3 and 50 characters");
      return;
    }

    const duplicate = teams.some(
      (t) =>
        t.id !== team.id &&
        t.teamName.toLowerCase() === trimmedName.toLowerCase()
    );

    if (duplicate) {
      alert("Team name must be unique");
      return;
    }

    const updatedTeam = {
      ...team,
      teamName: trimmedName,
      logo: newLogo || team.logo
    };

    onUpdateTeam(updatedTeam, true);
    alert("Team updated successfully ✅");
    handleCancelEdit();
  };

  const handleDeleteClick = (team) => {
    const hasRegistrations =
      team.registrations && team.registrations.length > 0;

    if (hasRegistrations) {
      alert("Registered team cannot be deleted. Contact admin.");
      return;
    }

    setTeamToDelete(team);
    setShowDeletePopup(true);
  };

  const handleConfirmDelete = () => {
    if (!teamToDelete) return;

    onDeleteTeam(teamToDelete.id);
    setShowDeletePopup(false);
    setTeamToDelete(null);
    alert("Team deleted successfully ✅");
  };

  const handleCancelDelete = () => {
    setShowDeletePopup(false);
    setTeamToDelete(null);
  };

  return (
    <div style={styles.wrapper}>
      <h2 style={styles.heading}>My Team</h2>

      {teams.length === 0 ? (
        <div style={styles.emptyBox}>
          <p style={styles.emptyTitle}>No team created yet.</p>
          <p style={styles.emptyText}>
            Create your team to manage logo, player roster, and team details.
          </p>
        </div>
      ) : (
        <div style={styles.grid}>
          {teams.map((team) => (
            <div key={team.id} style={styles.card}>
              <div
                style={styles.cardTop}
                onClick={() => editingTeamId !== team.id && onSelectTeam(team)}
              >
                <div style={styles.logoWrapper}>
                  <img
                    src={
                      editingTeamId === team.id
                        ? previewLogo || team.logo
                        : team.logo
                    }
                    alt=""
                    style={styles.logo}
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "flex";
                    }}
                  />
                  <div style={styles.logoFallback}>No Logo</div>
                </div>

                {editingTeamId === team.id ? (
                  <input
                    type="text"
                    value={editedTeamName}
                    onChange={(e) => setEditedTeamName(e.target.value)}
                    style={styles.input}
                  />
                ) : (
                  <h3 style={styles.teamName}>{team.teamName}</h3>
                )}

                <p style={styles.metaText}>
                  Captain: {team.captain || "Captain"}
                </p>

                <p style={styles.metaText}>
                  Players: {team.players?.length || 0}
                </p>
              </div>

              <div style={styles.actionRow}>
                {editingTeamId === team.id ? (
                  <>
                    <input
                      type="file"
                      onChange={handleLogoChange}
                      style={styles.fileInput}
                    />
                    <button
                      style={styles.saveBtn}
                      onClick={() => handleSaveEdit(team)}
                    >
                      Save
                    </button>
                    <button
                      style={styles.cancelBtn}
                      onClick={handleCancelEdit}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      style={styles.editBtn}
                      onClick={() => handleEditClick(team)}
                    >
                      Edit
                    </button>
                    <button
                      style={styles.viewBtn}
                      onClick={() => onSelectTeam(team)}
                    >
                      View
                    </button>
                    <button
                      style={styles.deleteBtn}
                      onClick={() => handleDeleteClick(team)}
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showDeletePopup && (
        <div style={styles.popupOverlay}>
          <div style={styles.popupBox}>
            <p style={styles.popupText}>
              Are you sure you want to delete this team?
            </p>
            <div style={styles.popupActionRow}>
              <button
                style={styles.deleteConfirmBtn}
                onClick={handleConfirmDelete}
              >
                Yes, Delete
              </button>
              <button style={styles.cancelBtn} onClick={handleCancelDelete}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  wrapper: {
    width: "100%",
    marginTop: "10px"
  },
  heading: {
    color: "white",
    fontSize: "28px",
    fontWeight: "700",
    marginBottom: "20px"
  },
  emptyBox: {
    background: "rgba(15,23,42,0.7)",
    border: "1px solid rgba(148,163,184,0.14)",
    borderRadius: "20px",
    padding: "34px",
    textAlign: "center",
    boxShadow: "0 10px 30px rgba(0,0,0,0.18)"
  },
  emptyTitle: {
    color: "white",
    fontSize: "20px",
    fontWeight: "600",
    margin: "0 0 10px 0"
  },
  emptyText: {
    color: "#94a3b8",
    margin: 0,
    fontSize: "14px"
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "20px"
  },
  card: {
    background: "rgba(15,23,42,0.75)",
    border: "1px solid rgba(148,163,184,0.14)",
    borderRadius: "22px",
    padding: "24px",
    boxShadow: "0 10px 28px rgba(0,0,0,0.18)"
  },
  cardTop: {
    cursor: "pointer",
    textAlign: "center"
  },
  logoWrapper: {
    width: "110px",
    height: "110px",
    margin: "0 auto 16px auto",
    position: "relative"
  },
  logo: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    borderRadius: "18px",
    display: "block"
  },
  logoFallback: {
    width: "100%",
    height: "100%",
    borderRadius: "18px",
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
    fontSize: "22px",
    fontWeight: "700",
    margin: "0 0 10px 0"
  },
  metaText: {
    color: "#94a3b8",
    fontSize: "14px",
    margin: "4px 0"
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    marginBottom: "10px",
    boxSizing: "border-box",
    borderRadius: "10px",
    border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(255,255,255,0.06)",
    color: "white",
    textAlign: "center"
  },
  fileInput: {
    color: "#cbd5e1",
    fontSize: "13px"
  },
  actionRow: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: "10px",
    marginTop: "18px"
  },
  editBtn: {
    padding: "8px 16px",
    backgroundColor: "#f39c12",
    color: "white",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer"
  },
  viewBtn: {
    padding: "8px 16px",
    backgroundColor: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer"
  },
  saveBtn: {
    padding: "8px 16px",
    backgroundColor: "#22c55e",
    color: "white",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer"
  },
  cancelBtn: {
    padding: "8px 16px",
    backgroundColor: "#9ca3af",
    color: "white",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer"
  },
  deleteBtn: {
    padding: "8px 16px",
    backgroundColor: "#dc2626",
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
  deleteConfirmBtn: {
    padding: "10px 20px",
    backgroundColor: "#dc2626",
    color: "white",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer"
  }
};

export default TeamDashboard;