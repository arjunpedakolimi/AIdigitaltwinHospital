import { useEffect, useState } from "react";
import { api } from "../api/client";

export interface HospitalData {
  patients: any[];
  doctors: any[];
  nurses: any[];
  departments: any[];
  beds: any[];
  rooms: any[];
  equipment: any[];
  ambulances: any[];
  vitals: any[];
  predictions: any[];
  kpis: any[];
  alerts: any[];
  emergencyEvents: any[];
  labResults: any[];
  medicalHistory: any[];
  medications: any[];
  surgeries: any[];
  billingInsurance: any[];
}

export function useHospitalData() {
  const [data, setData] = useState<HospitalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const [
          patients,
          doctors,
          nurses,
          departments,
          beds,
          rooms,
          equipment,
          ambulances,
          vitals,
          predictions,
          kpis,
          alerts,
          emergencyEvents,
          labResults,
          medicalHistory,
          medications,
          surgeries,
          billingInsurance,
        ] = await Promise.all([
          api.patients(),
          api.doctors(),
          api.nurses(),
          api.departments(),
          api.beds(),
          api.rooms(),
          api.equipment(),
          api.ambulances(),
          api.vitals().catch(() => []),
          api.predictions(),
          api.kpis(),
          api.alerts(),
          api.emergencyEvents(),
          api.labResults(),
          api.medicalHistory(),
          api.medications(),
          api.surgeries(),
          api.billingInsurance(),
        ]);

        if (cancelled) return;

        setData({
          patients,
          doctors,
          nurses,
          departments,
          beds,
          rooms,
          equipment,
          ambulances,
          vitals,
          predictions,
          kpis,
          alerts,
          emergencyEvents,
          labResults,
          medicalHistory,
          medications,
          surgeries,
          billingInsurance,
        });
      } catch (err) {
        if (cancelled) return;

        console.error("Hospital API error:", err);
        setError(err instanceof Error ? err.message : "Failed to load hospital data");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  return {
    data,
    loading,
    error,
  };
}
