import { useState, useEffect } from "react";
import axios from "axios";

export default function UserDashboard() {
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0, admins: 0 });

  useEffect(() => {
    axios.get("/api/users").then(res => {
      const users = res.data.data;
      setStats({
        total: users.length,
        active: users.filter(u => u.status === "Active").length,
        inactive: users.filter(u => u.status === "Inactive").length,
        admins: users.filter(u => u.role === "Admin").length,
      });
    });
  }, []);

  return (
    <div className="dashboard">
      <h2>User Dashboard</h2>
      <div className="stats-grid">
        <div className="stat-card"><h3>Total Users</h3><p>{stats.total}</p></div>
        <div className="stat-card active"><h3>Active</h3><p>{stats.active}</p></div>
        <div className="stat-card inactive"><h3>Inactive</h3><p>{stats.inactive}</p></div>
        <div className="stat-card admin"><h3>Admins</h3><p>{stats.admins}</p></div>
      </div>
    </div>
  );
}
