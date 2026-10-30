import axios from 'axios';

const BASE_URL = 'http://localhost:3000';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Response interceptor for clean error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    let customMessage = 'An unexpected error occurred';
    if (error.response) {
      customMessage = `Server error (${error.response.status}): ${error.response.statusText || 'Request failed'}`;
    } else if (error.request) {
      customMessage = 'Cannot connect to JSON Server. Make sure "npx json-server --watch db.json --port 3000" is running.';
    } else {
      customMessage = error.message;
    }
    return Promise.reject(new Error(customMessage));
  }
);

// --- Employee API Endpoints ---
export const getEmployees = async (params = {}) => {
  const response = await apiClient.get('/employees', { params });
  return response.data;
};

export const getEmployeeById = async (id) => {
  const response = await apiClient.get(`/employees/${id}`);
  return response.data;
};

export const addEmployee = async (employeeData) => {
  const response = await apiClient.post('/employees', employeeData);
  return response.data;
};

export const updateEmployee = async (id, employeeData) => {
  const response = await apiClient.put(`/employees/${id}`, employeeData);
  return response.data;
};

export const deleteEmployee = async (id) => {
  const response = await apiClient.delete(`/employees/${id}`);
  return response.data;
};

// --- Department API Endpoints ---
export const getDepartments = async () => {
  const response = await apiClient.get('/departments');
  return response.data;
};

export const getDepartmentById = async (id) => {
  const response = await apiClient.get(`/departments/${id}`);
  return response.data;
};

export const addDepartment = async (departmentData) => {
  const response = await apiClient.post('/departments', departmentData);
  return response.data;
};

export const updateDepartment = async (id, departmentData) => {
  const response = await apiClient.put(`/departments/${id}`, departmentData);
  return response.data;
};

export const deleteDepartment = async (id) => {
  const response = await apiClient.delete(`/departments/${id}`);
  return response.data;
};

// --- Designation API Endpoints ---
export const getDesignations = async () => {
  const response = await apiClient.get('/designations');
  return response.data;
};

export const getDesignationById = async (id) => {
  const response = await apiClient.get(`/designations/${id}`);
  return response.data;
};

export const addDesignation = async (designationData) => {
  const response = await apiClient.post('/designations', designationData);
  return response.data;
};

export const updateDesignation = async (id, designationData) => {
  const response = await apiClient.put(`/designations/${id}`, designationData);
  return response.data;
};

export const deleteDesignation = async (id) => {
  const response = await apiClient.delete(`/designations/${id}`);
  return response.data;
};

export default {
  getEmployees,
  getEmployeeById,
  addEmployee,
  updateEmployee,
  deleteEmployee,
  getDepartments,
  getDepartmentById,
  addDepartment,
  updateDepartment,
  deleteDepartment,
  getDesignations,
  getDesignationById,
  addDesignation,
  updateDesignation,
  deleteDesignation,
};

