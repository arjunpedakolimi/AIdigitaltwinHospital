const API_BASE = "http://127.0.0.1:8000";

async function request<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`);

  if (!response.ok) {
    throw new Error(`API ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

export const api = {
  patients: () => request<any[]>("/api/patients/"),
  doctors: () => request<any[]>("/api/doctors/"),
  nurses: () => request<any[]>("/api/nurses/"),
  departments: () => request<any[]>("/api/departments/"),
  beds: () => request<any[]>("/api/beds/"),
  rooms: () => request<any[]>("/api/rooms/"),
  equipment: () => request<any[]>("/api/equipment/"),
  ambulances: () => request<any[]>("/api/ambulances/"),
  vitals: () => request<any[]>("/api/patient_vitals/"),
  predictions: () => request<any[]>("/api/predictions/"),
  kpis: () => request<any[]>("/api/hospital_kpis/"),
  alerts: () => request<any[]>("/api/alerts/"),
  emergencyEvents: () => request<any[]>("/api/emergency_events/"),
  labResults: () => request<any[]>("/api/lab_results/"),
  medicalHistory: () => request<any[]>("/api/medical_history/"),
  medications: () => request<any[]>("/api/medications/"),
  surgeries: () => request<any[]>("/api/surgeries/"),
  billingInsurance: () => request<any[]>("/api/billing_insurance/"),
  health: () => request<any>("/health"),
};
