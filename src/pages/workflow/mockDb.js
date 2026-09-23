// Full-stack API Client for JuteCRM Production Workflow & Masters

const notify = (msg, severity = 'success') => {
  if (typeof window !== 'undefined' && window.showNotification) {
    window.showNotification(msg, severity);
  }
};

const getAuthHeaders = () => {
  if (typeof window === 'undefined') return {};
  let saved = sessionStorage.getItem('jutecrm_user');
  if (!saved) {
    saved = localStorage.getItem('jutecrm_user');
  }
  if (saved) {
    const user = JSON.parse(saved);
    return {
      'x-user-email': user.email || ''
    };
  }
  return {};
};

export const getDb = async (tables = []) => {
  if (!tables || tables.length === 0) {
    const res = await fetch('/api/db', {
      headers: getAuthHeaders()
    });
    if (!res.ok) {
      const errorMsg = 'Failed to fetch DB state from backend.';
      notify(errorMsg, 'error');
      throw new Error(errorMsg);
    }
    return res.json();
  }

  try {
    const results = await Promise.all(
      tables.map(async (table) => {
        const res = await fetch(`/api/db/${table}`, {
          headers: getAuthHeaders()
        });
        if (!res.ok) {
          throw new Error(`Failed to fetch table ${table}`);
        }
        const data = await res.json();
        return { [table]: data };
      })
    );
    return Object.assign({}, ...results);
  } catch (err) {
    const errorMsg = err.message || 'Failed to fetch partial DB state.';
    notify(errorMsg, 'error');
    throw new Error(errorMsg);
  }
};

export const saveDb = async (db) => {
  const res = await fetch('/api/db/save', {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(db)
  });
  if (!res.ok) {
    const err = await res.json();
    const errorMsg = err.error || 'Failed to save DB state to backend.';
    notify(errorMsg, 'error');
    throw new Error(errorMsg);
  }
  notify('Transaction saved successfully!', 'success');
  return res.json();
};

// ==========================================
// MASTERS API HELPERS
// ==========================================

export const getMasters = async (type) => {
  const res = await fetch(`/api/masters/${type}`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) {
    const errorMsg = `Failed to fetch master data for "${type}".`;
    notify(errorMsg, 'error');
    throw new Error(errorMsg);
  }
  return res.json();
};

export const saveMaster = async (type, data) => {
  const isEdit = !!data.id && String(data.id).length < 10; // Auto-increment ids are small ints
  const url = isEdit ? `/api/masters/${type}/${data.id}` : `/api/masters/${type}`;
  const method = isEdit ? 'PUT' : 'POST';

  const payload = { ...data };
  if (!isEdit) {
    delete payload.id;
  }

  const res = await fetch(url, {
    method,
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const err = await res.json();
    const errorMsg = err.error || 'Failed to save master record.';
    notify(errorMsg, 'error');
    throw new Error(errorMsg);
  }
  notify(`${type.slice(0, -1).toUpperCase()} saved successfully!`, 'success');
  return res.json();
};

export const deleteMaster = async (type, id) => {
  const res = await fetch(`/api/masters/${type}/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  if (!res.ok) {
    const errorMsg = 'Failed to delete master record.';
    notify(errorMsg, 'error');
    throw new Error(errorMsg);
  }
  notify('Record deleted successfully!', 'success');
  return res.json();
};

// ==========================================
// FILE UPLOAD HELPER
// ==========================================

export const uploadBillFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
    headers: getAuthHeaders()
  });

  if (!res.ok) {
    const errorMsg = 'Failed to upload file to backend.';
    notify(errorMsg, 'error');
    throw new Error(errorMsg);
  }
  notify('File uploaded successfully!', 'success');
  return res.json(); // Returns { filename, url }
};
