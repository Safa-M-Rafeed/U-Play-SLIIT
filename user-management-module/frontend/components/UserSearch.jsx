import { useState } from "react";

export default function UserSearch({ onSearch }) {
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");

  const handleSearch = () => {
    onSearch({ search, role, status });
  };

  return (
    <div className="search-bar">
      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search by name or email..."
      />
      <select value={role} onChange={e => setRole(e.target.value)}>
        <option value="">All Roles</option>
        <option>Admin</option>
        <option>Editor</option>
        <option>Viewer</option>
      </select>
      <select value={status} onChange={e => setStatus(e.target.value)}>
        <option value="">All Status</option>
        <option>Active</option>
        <option>Inactive</option>
      </select>
      <button onClick={handleSearch}>Search</button>
    </div>
  );
}
