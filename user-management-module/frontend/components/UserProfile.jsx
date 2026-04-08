import { useState, useEffect } from "react";
import axios from "axios";

export default function UserProfile() {
  const [profile, setProfile] = useState({ name: "", email: "", role: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    axios.get("/api/users/me").then(res => setProfile(res.data.data));
  }, []);

  const handleUpdate = async () => {
    setLoading(true);
    await axios.put("/api/users/me", profile);
    setSuccess(true);
    setLoading(false);
  };

  return (
    <div className="profile-wrap">
      <h2>Update Profile</h2>
      <input value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} placeholder="Name" />
      <input value={profile.email} onChange={e => setProfile({...profile, email: e.target.value})} placeholder="Email" />
      <button onClick={handleUpdate} disabled={loading}>{loading ? "Saving..." : "Save"}</button>
      {success && <p className="success">Profile updated!</p>}
    </div>
  );
}
