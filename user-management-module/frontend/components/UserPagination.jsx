import { useState } from "react";

export default function UserPagination({ total, limit, onPageChange }) {
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(total / limit);

  const handlePage = (p) => {
    setPage(p);
    onPageChange(p);
  };

  return (
    <div className="pagination">
      <button onClick={() => handlePage(page - 1)} disabled={page === 1}>Prev</button>
      {Array.from({ length: totalPages }, (_, i) => (
        <button
          key={i + 1}
          onClick={() => handlePage(i + 1)}
          className={page === i + 1 ? "active" : ""}
        >
          {i + 1}
        </button>
      ))}
      <button onClick={() => handlePage(page + 1)} disabled={page === totalPages}>Next</button>
    </div>
  );
}
