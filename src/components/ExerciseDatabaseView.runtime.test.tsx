import { describe, it, expect, beforeAll, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { ExerciseDatabaseView } from './ExerciseDatabaseView';
import { setExerciseDatabase } from '../services/exerciseDatabaseService';

vi.mock('../context/useApp', () => ({
  useApp: () => ({
    routines: [{ dayNumber: 1, focus: 'Pecho' }],
    addExerciseToRoutine: vi.fn(),
    sendCoachMessage: vi.fn(),
    navigateTo: vi.fn(),
  }),
}));

const RAW_JSON = readFileSync(resolve(__dirname, '../../public/exercisesDatabase.json'), 'utf-8');

describe('ExerciseDatabaseView (carga del dataset en runtime)', () => {
  beforeAll(() => {
    setExerciseDatabase([]);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('puebla la biblioteca tras resolver el fetch local del dataset', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(RAW_JSON, { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    render(<ExerciseDatabaseView />);

    await waitFor(() => {
      expect(screen.getByText(/1\.324 ejercicios/)).toBeInTheDocument();
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const url = String(fetchMock.mock.calls[0][0]);
    expect(url.endsWith('exercisesDatabase.json')).toBe(true);
    expect(url.startsWith('http')).toBe(false);

    await waitFor(() => {
      expect(screen.queryByText('No se encontraron ejercicios')).not.toBeInTheDocument();
    });
    expect(screen.getAllByText('Detalles').length).toBeGreaterThanOrEqual(24);
  });
});