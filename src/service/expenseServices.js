import api from "./api";




// ---------- Expense APIs ----------
export const getExpenseCategories = async () => {
  const response = await api.get("/expenses/categories/");
  return response.data;
};

export const getExpenseMasterItems = async (categoryId) => {
  const response = await api.get(`/expenses/category/${categoryId}/items/`);
  return response.data;
};

export const createExpense = async (data) => {
  const response = await api.post("/expenses/create/", data);
  return response.data;
};

export const getExpenses = async (params = {}) => {
  const response = await api.get("/expenses/", { params });
  return response.data;
};

export const getExpenseDetail = async (id) => {
  const response = await api.get(`/expenses/${id}/`);
  return response.data;
};

export const updateExpense = async (id, data) => {
  const response = await api.put(`/expenses/${id}/`, data);
  return response.data;
};

export const deleteExpense = async (id) => {
  const response = await api.delete(`/expenses/${id}/`);
  return response.data;
};

// ---------- Maintenance APIs ----------
export const createMaintenance = async (data) => {
  const response = await api.post("/expenses/maintenance/create/", data);
  return response.data;
};

export const getMaintenanceList = async (params = {}) => {
  const response = await api.get("/expenses/maintenance/", { params });
  return response.data;
};

export const updateMaintenance = async (id, data) => {
  const response = await api.put(`/expenses/maintenance/${id}/`, data);
  return response.data;
};

export const deleteMaintenance = async (id) => {
  const response = await api.delete(`/expenses/maintenance/${id}/`);
  return response.data;
};


export const getExpenseReport = async () => {
  const response = await api.get("/expenses/categories/");
  return response.data;
};