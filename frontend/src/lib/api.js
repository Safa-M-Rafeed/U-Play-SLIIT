const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function request(path, options = {}) {
  const { headers, ...restOptions } = options;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...restOptions,
    headers: {
      'Content-Type': 'application/json',
      ...(headers || {})
    }
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }

  return data;
}

export async function loginUser(payload) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function verifyLoginOtp(payload) {
  return request('/auth/verify-login-otp', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function registerUser(payload) {
  return request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function getCurrentUser(token) {
  return request('/auth/me', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}

export async function updateProfile(token, payload) {
  return request('/auth/profile', {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });
}

export async function updatePassword(token, payload) {
  return request('/auth/password', {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });
}

export async function uploadProfileAvatar(token, file) {
  const formData = new FormData();
  formData.append('avatar', file);

  const response = await fetch(`${API_BASE_URL}/auth/avatar`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: formData
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'Upload failed');
  }

  return data;
}

export async function getAdminDashboard(token) {
  return request('/admin/dashboard', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}

export async function downloadAdminReport(token) {
  const response = await fetch(`${API_BASE_URL}/admin/report`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || 'Failed to generate report');
  }

  const blob = await response.blob();
  const disposition = response.headers.get('Content-Disposition') || '';
  const fileNameMatch = disposition.match(/filename="([^"]+)"/i);

  return {
    blob,
    fileName: fileNameMatch?.[1] || 'admin-report.csv'
  };
}

export async function updateAdminUserStatus(token, userId, status) {
  return request(`/admin/users/${userId}/status`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ status })
  });
}

export async function deleteAdminUser(token, userId) {
  return request(`/admin/users/${userId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}

export async function createAdminTournament(token, payload) {
  return request('/admin/tournaments', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });
}

export async function updateAdminTournament(token, tournamentId, payload) {
  return request(`/admin/tournaments/${tournamentId}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });
}

export async function deleteAdminTournament(token, tournamentId) {
  return request(`/admin/tournaments/${tournamentId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}

export async function updateAdminApprovalStatus(token, approvalId, status) {
  return request(`/admin/approvals/${approvalId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ status })
  });
}
