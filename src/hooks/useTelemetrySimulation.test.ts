import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { calculateAllometricProfile } from '../services/allometricService';
import { useTelemetrySimulation } from './useTelemetrySimulation';

const profile = calculateAllometricProfile(78.2, 28, 178, 'Masculino');

describe('useTelemetrySimulation (fake timers)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function renderActive() {
    return renderHook(() => useTelemetrySimulation(profile, false, 10, 0, 'Piernas'));
  }

  it('acumula una lectura por segundo durante el ejercicio', () => {
    const { result } = renderActive();

    expect(result.current.bpmReadings).toHaveLength(0);

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(result.current.bpmReadings).toHaveLength(3);
    expect(result.current.bpmReadings[0]).toBeGreaterThanOrEqual(profile.allometricRestingHr);
    expect(result.current.bpmReadings[2]).toBeLessThanOrEqual(profile.maxHeartRateBpm);
  });

  it('actualiza los picos de sesión y último pico durante el ejercicio', () => {
    const { result } = renderActive();

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(result.current.sessionPeakBpm).toBeGreaterThan(0);
    expect(result.current.lastPeakBpm).toBeGreaterThan(0);
    expect(result.current.sessionPeakBpm).toBeGreaterThanOrEqual(result.current.lastPeakBpm);
  });

  it('no eleva el último pico durante el descanso', () => {
    const { result } = renderHook(() => useTelemetrySimulation(profile, true, 8, 30, 'Pecho'));

    const initialLastPeak = result.current.lastPeakBpm;
    const initialSessionPeak = result.current.sessionPeakBpm;

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(result.current.lastPeakBpm).toBe(initialLastPeak);
    expect(result.current.sessionPeakBpm).toBe(initialSessionPeak);
  });

  it('retiene como máximo 60 lecturas', () => {
    const { result } = renderActive();

    act(() => {
      vi.advanceTimersByTime(65_000);
    });

    expect(result.current.bpmReadings).toHaveLength(60);
  });

  it('limpia el intervalo al desmontar (sin fugas)', () => {
    const { result, unmount } = renderActive();

    act(() => {
      vi.advanceTimersByTime(3000);
    });
    const lengthBefore = result.current.bpmReadings.length;

    unmount();

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(result.current.bpmReadings).toHaveLength(lengthBefore);
  });
});
