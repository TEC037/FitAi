import { useEffect, useMemo, useState } from 'react';
import { AllometricProfile, computeDynamicHeartRate } from '../services/allometricService';

const TELEMETRY_SAMPLING_INTERVAL_MS = 1000;
const TELEMETRY_MAX_READINGS = 60;
const TELEMETRY_INITIAL_LAST_PEAK_BPM_FRACTION = 0.82;
const TELEMETRY_INITIAL_SESSION_PEAK_BPM_FRACTION = 0.85;

export function useTelemetrySimulation(
  profile: AllometricProfile,
  isRestTimerActive: boolean,
  currentRpe: number,
  elapsedRestSec: number,
  primaryMuscle: string
) {
  // Picos iniciales derivados de la FC máx. alométrica del usuario (no de constantes arbitrarias)
  const initialLastPeak = Math.round(
    profile.maxHeartRateBpm * TELEMETRY_INITIAL_LAST_PEAK_BPM_FRACTION
  );
  const initialSessionPeak = Math.round(
    profile.maxHeartRateBpm * TELEMETRY_INITIAL_SESSION_PEAK_BPM_FRACTION
  );

  const [readings, setReadings] = useState<number[]>([]);
  const [sessionPeakBpm, setSessionPeakBpm] = useState<number>(initialSessionPeak);
  const [lastPeakBpm, setLastPeakBpm] = useState<number>(initialLastPeak);

  const dynamic = useMemo(
    () =>
      computeDynamicHeartRate(
        profile,
        isRestTimerActive,
        currentRpe,
        elapsedRestSec,
        primaryMuscle,
        lastPeakBpm
      ),
    [profile, isRestTimerActive, currentRpe, elapsedRestSec, primaryMuscle, lastPeakBpm]
  );

  useEffect(() => {
    const interval = setInterval(() => {
      const { currentBpm } = dynamic;
      setReadings((prev) => [...prev.slice(-(TELEMETRY_MAX_READINGS - 1)), currentBpm]);
      setSessionPeakBpm((prev) => Math.max(prev, currentBpm));
      setLastPeakBpm((prev) => (isRestTimerActive ? prev : Math.max(prev, currentBpm)));
    }, TELEMETRY_SAMPLING_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [dynamic, isRestTimerActive]);

  return {
    dynamicTelemetry: dynamic,
    bpmReadings: readings,
    sessionPeakBpm,
    lastPeakBpm,
  };
}
