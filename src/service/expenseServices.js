// frontend/src/service/expenseServices.js

import api from "./api";

// ============================================================
// 1. EXPENSE CATEGORY CRUD (Super Admin only)
// ============================================================

export const getExpenseCategories = async () => {
  const response = await api.get("/expenses/categories/");
  return response.data;
};

export const createExpenseCategory = async (data) => {
  const response = await api.post("/expenses/categories/create/", data);
  return response.data;
};

export const updateExpenseCategory = async (id, data) => {
  const response = await api.put(`/expenses/categories/${id}/`, data);
  return response.data;
};

export const deleteExpenseCategory = async (id) => {
  const response = await api.delete(`/expenses/categories/${id}/`);
  return response.data;
};

// ============================================================
// 2. MASTER ITEMS (Raw Materials) - FULL CRUD
// ============================================================

export const getExpenseMasterItems = async (categoryId) => {
  const response = await api.get(`/expenses/category/${categoryId}/items/`);
  return response.data;
};

export const createMasterItem = async (data) => {
  const response = await api.post("/expenses/master-items/create/", data);
  return response.data;
};

export const updateMasterItem = async (id, data) => {
  const response = await api.put(`/expenses/master-items/${id}/`, data);
  return response.data;
};

export const deleteMasterItem = async (id) => {
  const response = await api.delete(`/expenses/master-items/${id}/`);
  return response.data;
};

// ============================================================
// 3. EXPENSE ENTRIES (Manager adds KG + Price)
// ============================================================

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

// ============================================================
// 4. MAINTENANCE EXPENSES
// ============================================================

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

// ============================================================
// 5. REPORTS & ANALYTICS
// ============================================================

export const getExpenseReport = async (params = {}) => {
  const response = await api.get("/expenses/report/", { params });
  return response.data;
};

// ============================================================
// 6. STAFF MANAGEMENT (SINGLE COPY - NO DUPLICATES)
// ============================================================

export const getStaffList = async (params = {}) => {
  const response = await api.get("/expenses/staff/", { params });
  return response.data;
};

export const createStaff = async (data) => {
  const response = await api.post("/expenses/staff/", data);
  return response.data;
};

export const updateStaff = async (id, data) => {
  const response = await api.put(`/expenses/staff/${id}/`, data);
  return response.data;
};

export const deleteStaff = async (id) => {
  const response = await api.delete(`/expenses/staff/${id}/`);
  return response.data;
};

// ============================================================
// 7. STAFF SALARY
// ============================================================

export const addStaffSalary = async (data) => {
  const response = await api.post("/expenses/staff/salary/add/", data);
  return response.data;
};

export const getStaffSalaryDetail = async (staffId) => {
  const response = await api.get(`/expenses/staff/salary/detail/${staffId}/`);
  return response.data;
};

export const getStaffSalaryList = async () => {
  const response = await api.get("/expenses/staff/salary/list/");
  return response.data;
};

export const getStaffSalaryReport = async (params = {}) => {
  const response = await api.get("/expenses/staff/salary/report/", { params });
  return response.data;
};

// ============================================================
// 8. VENDOR MANAGEMENT
// ============================================================

export const getVendors = async (params = {}) => {
  const response = await api.get("/expenses/vendors/", { params });
  return response.data;
};

export const createVendor = async (data) => {
  const response = await api.post("/expenses/vendors/", data);
  return response.data;
};

export const updateVendor = async (id, data) => {
  const response = await api.put(`/expenses/vendors/${id}/`, data);
  return response.data;
};

export const deleteVendor = async (id) => {
  const response = await api.delete(`/expenses/vendors/${id}/`);
  return response.data;
};

// ============================================================
// 9. RAW MATERIAL EXPENSES
// ============================================================

export const getRawMaterialExpenses = async (params = {}) => {
  const response = await api.get("/expenses/raw-materials/", { params });
  return response.data;
};

export const getRawMaterialExpense = async (id) => {
  const response = await api.get(`/expenses/raw-materials/${id}/`);
  return response.data;
};

export const createRawMaterialExpense = async (data) => {
  const response = await api.post("/expenses/raw-materials/", data);
  return response.data;
};

export const updateRawMaterialExpense = async (id, data) => {
  const response = await api.put(`/expenses/raw-materials/${id}/`, data);
  return response.data;
};

export const deleteRawMaterialExpense = async (id) => {
  const response = await api.delete(`/expenses/raw-materials/${id}/`);
  return response.data;
};