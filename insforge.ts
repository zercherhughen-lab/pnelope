import axios from 'axios';

const INSFORGE_BASE_URL = process.env.INSFORGE_URL || 'https://jbj49fff.us-west.insforge.app';
const INSFORGE_API_KEY = process.env.INSFORGE_API_KEY || 'ik_0c9ab45f9791edad7f3188854980f5f4';

const getHeaders = () => ({
  'Authorization': `Bearer ${INSFORGE_API_KEY}`,
  'x-api-key': INSFORGE_API_KEY,
  'Content-Type': 'application/json',
});

/**
 * Helper to safely extract error message from Axios errors
 */
function getErrorMessage(error: any): string {
  if (error.response?.data) {
    if (typeof error.response.data === 'string') return error.response.data;
    if (error.response.data.message) return error.response.data.message;
    if (error.response.data.detail) return error.response.data.detail;
  }
  return error.message || 'Unknown network error';
}

let masterServicesTableCreated = false;

/**
 * Ensures master services table exists in InsForge database
 */
export async function ensureServicesTable(): Promise<boolean> {
  if (masterServicesTableCreated) return true;
  try {
    await axios.post(
      `${INSFORGE_BASE_URL}/api/database/tables`,
      {
        tableName: 'vauth_services',
        columns: [
          { columnName: 'id', type: 'string', isNullable: false, isUnique: true },
          { columnName: 'user_id', type: 'string', isNullable: false, isUnique: false },
          { columnName: 'name', type: 'string', isNullable: false, isUnique: true },
          { columnName: 'prefix', type: 'string', isNullable: true, isUnique: false },
          { columnName: 'description', type: 'string', isNullable: true, isUnique: false },
          { columnName: 'api_key', type: 'string', isNullable: false, isUnique: true },
          { columnName: 'secret_id', type: 'string', isNullable: false, isUnique: true },
          { columnName: 'created_at', type: 'string', isNullable: true, isUnique: false },
        ],
      },
      { headers: getHeaders(), timeout: 5000 }
    );
    masterServicesTableCreated = true;
    return true;
  } catch (error: any) {
    masterServicesTableCreated = true;
    return true;
  }
}

function extractArray(data: any): any[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.data)) return data.data;
  if (Array.isArray(data.records)) return data.records;
  if (Array.isArray(data.result)) return data.result;
  if (Array.isArray(data.rows)) return data.rows;
  if (Array.isArray(data.items)) return data.items;
  return [];
}

/**
 * Fetch all persistent services from InsForge
 */
export async function getAllServices(): Promise<any[]> {
  try {
    await ensureServicesTable();
    const res = await axios.get(`${INSFORGE_BASE_URL}/api/database/records/vauth_services`, {
      headers: getHeaders(),
      timeout: 5000,
    });
    return extractArray(res.data);
  } catch (error: any) {
    return [];
  }
}

/**
 * Insert new service into InsForge master table
 */
export async function insertServiceRecord(data: Record<string, any>): Promise<any> {
  try {
    await ensureServicesTable();
    const res = await axios.post(`${INSFORGE_BASE_URL}/api/database/records/vauth_services`, data, {
      headers: getHeaders(),
      timeout: 10000,
    });
    return res.data;
  } catch (error: any) {
    if (data.id) {
      try {
        await updateServiceRecord(data.id, data);
        return data;
      } catch {
        // ignore fallback update error
      }
    }
    console.warn("[InsForge] Notice inserting service into 'vauth_services':", error.response?.data?.message || error.message);
    return null;
  }
}

/**
 * Delete service from InsForge master table
 */
export async function deleteServiceRecord(serviceId: string): Promise<boolean> {
  try {
    const tableExists = await ensureServicesTable();
    if (!tableExists) return false;
    await axios.delete(
      `${INSFORGE_BASE_URL}/api/database/records/vauth_services?id=eq.${encodeURIComponent(serviceId)}`,
      { headers: getHeaders(), timeout: 5000 }
    );
    return true;
  } catch (error: any) {
    return false;
  }
}

/**
 * Update service API key or Secret ID in master table
 */
export async function updateServiceRecord(serviceId: string, updates: Record<string, any>): Promise<boolean> {
  try {
    const tableExists = await ensureServicesTable();
    if (!tableExists) return false;
    await axios.patch(
      `${INSFORGE_BASE_URL}/api/database/records/vauth_services?id=eq.${encodeURIComponent(serviceId)}`,
      updates,
      { headers: getHeaders(), timeout: 5000 }
    );
    return true;
  } catch (error: any) {
    return false;
  }
}

/**
 * Sanitizes service name to PostgreSQL compliant table name
 */
export function getTableNameForService(serviceName: string): string {
  let clean = serviceName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');

  if (!clean) clean = 'service_licenses';
  if (/^[0-9]/.test(clean)) clean = 's_' + clean;
  return clean;
}

const knownTables = new Set<string>();

/**
 * Ensures table exists in InsForge database for a service
 */
export async function ensureServiceTable(tableName: string): Promise<boolean> {
  if (knownTables.has(tableName)) return true;
  try {
    await axios.post(
      `${INSFORGE_BASE_URL}/api/database/tables`,
      {
        tableName,
        columns: [
          { columnName: 'license_key', type: 'string', isNullable: false, isUnique: true },
          { columnName: 'username', type: 'string', isNullable: true, isUnique: false },
          { columnName: 'duration', type: 'string', isNullable: true, isUnique: false },
          { columnName: 'status', type: 'string', isNullable: true, isUnique: false },
          { columnName: 'rank', type: 'string', isNullable: true, isUnique: false },
          { columnName: 'hwid', type: 'string', isNullable: true, isUnique: false },
          { columnName: 'notes', type: 'string', isNullable: true, isUnique: false },
          { columnName: 'expires_at', type: 'string', isNullable: true, isUnique: false },
          { columnName: 'last_used_at', type: 'string', isNullable: true, isUnique: false },
        ],
      },
      { headers: getHeaders(), timeout: 5000 }
    );
    knownTables.add(tableName);
    return true;
  } catch (error: any) {
    knownTables.add(tableName);
    return true;
  }
}

/**
 * Deletes table in InsForge database
 */
export async function deleteServiceTable(tableName: string): Promise<boolean> {
  try {
    knownTables.delete(tableName);
    await axios.delete(`${INSFORGE_BASE_URL}/api/database/tables/${tableName}`, {
      headers: getHeaders(),
      timeout: 5000,
    });
    return true;
  } catch (error: any) {
    return false;
  }
}

/**
 * Fetch all license records for a table
 */
export async function getRecords(tableName: string): Promise<any[]> {
  try {
    await ensureServiceTable(tableName);
    const res = await axios.get(`${INSFORGE_BASE_URL}/api/database/records/${tableName}`, {
      headers: getHeaders(),
      timeout: 5000,
    });
    return extractArray(res.data);
  } catch (error: any) {
    return [];
  }
}

/**
 * Insert a license record into a service table
 */
export async function insertRecord(tableName: string, data: Record<string, any>): Promise<any> {
  try {
    await ensureServiceTable(tableName);
    const res = await axios.post(`${INSFORGE_BASE_URL}/api/database/records/${tableName}`, data, {
      headers: getHeaders(),
      timeout: 5000,
    });
    return res.data;
  } catch (error: any) {
    return null;
  }
}

/**
 * Find record by license_key
 */
export async function findRecordByKey(tableName: string, licenseKey: string): Promise<any | null> {
  try {
    await ensureServiceTable(tableName);
    const res = await axios.get(
      `${INSFORGE_BASE_URL}/api/database/records/${tableName}?license_key=eq.${encodeURIComponent(licenseKey)}`,
      { headers: getHeaders(), timeout: 5000 }
    );
    const arr = extractArray(res.data);
    if (arr.length > 0) {
      return arr[0];
    }
    return null;
  } catch (error: any) {
    return null;
  }
}

/**
 * Update record by license_key
 */
export async function updateRecordByKey(tableName: string, licenseKey: string, updates: Record<string, any>): Promise<boolean> {
  try {
    await ensureServiceTable(tableName);
    await axios.patch(
      `${INSFORGE_BASE_URL}/api/database/records/${tableName}?license_key=eq.${encodeURIComponent(licenseKey)}`,
      updates,
      { headers: getHeaders(), timeout: 5000 }
    );
    return true;
  } catch (error: any) {
    return false;
  }
}

/**
 * Delete record by license_key
 */
export async function deleteRecordByKey(tableName: string, licenseKey: string): Promise<boolean> {
  try {
    await ensureServiceTable(tableName);
    await axios.delete(
      `${INSFORGE_BASE_URL}/api/database/records/${tableName}?license_key=eq.${encodeURIComponent(licenseKey)}`,
      { headers: getHeaders(), timeout: 5000 }
    );
    return true;
  } catch (error: any) {
    return false;
  }
}
