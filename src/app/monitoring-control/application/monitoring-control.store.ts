import { Injectable, computed, signal } from '@angular/core';
import { MonitoringApiEndpoint } from '../infrastructure/monitoring-api-endpoint';
import { TaskApiEndpoint } from '../infrastructure/task-api-endpoint';
import { WeatherApiEndpoint } from '../infrastructure/weather-api-endpoint';
import { PlantSamplingSessionApiEndpoint } from '../infrastructure/plant-sampling-session-api-endpoint';
import { EnvironmentalReading, ReadingType } from '../domain/model/environmental-reading.entity';
import { Task } from '../domain/model/task.entity';
import { Weather } from '../domain/model/weather.entity';
import { PlantSamplingSession } from '../domain/model/plant-samplimg-session.entity';
import { PlantObservation } from '../domain/model/plant-observation.entity';
import { retry, forkJoin, map, switchMap, of } from 'rxjs';

/**
 * Store for managing environmental readings, tasks, and simulated IoT alerts.
 */
@Injectable({
  providedIn: 'root'
})
export class MonitoringStore {
  // --- Signals ---
  private readonly readingsSignal = signal<EnvironmentalReading[]>([]);
  readonly readings = this.readingsSignal.asReadonly();

  private readonly tasksSignal = signal<Task[]>([]);
  readonly tasks = this.tasksSignal.asReadonly();

  private readonly alertsSignal = signal<string[]>([]);
  readonly alerts = this.alertsSignal.asReadonly();

  private readonly loadingSignal = signal<boolean>(false);
  readonly loading = this.loadingSignal.asReadonly();

  private readonly errorSignal = signal<string | null>(null);
  readonly error = this.errorSignal.asReadonly();

  private readonly weatherSignal = signal<Weather | null>(null);
  readonly weather = this.weatherSignal.asReadonly();

  private readonly weatherLoadingSignal = signal<boolean>(false);
  readonly weatherLoading = this.weatherLoadingSignal.asReadonly();

  private readonly sessionsSignal = signal<PlantSamplingSession[]>([]);
  readonly sessions = this.sessionsSignal.asReadonly();

  private readonly observationsSignal = signal<PlantObservation[]>([]);
  readonly observations = this.observationsSignal.asReadonly();

  // --- Computed values ---
  readonly readingCount = computed(() => this.readings().length);
  readonly taskCount = computed(() => this.tasks().length);
  readonly sessionCount = computed(() => this.sessions().length);

  constructor(
    private monitoringApi: MonitoringApiEndpoint,
    private weatherApi: WeatherApiEndpoint,
    private taskApi: TaskApiEndpoint,
    private plantSamplingApi: PlantSamplingSessionApiEndpoint
  ) {}

  /**
   * Loads all environmental readings from all plots.
   */
  loadAllReadings(): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    this.monitoringApi.getAllReadings().subscribe({
      next: (readings) => {
        console.log('Loaded all readings:', readings);
        this.readingsSignal.set(readings);
        this.loadingSignal.set(false);
      },
      error: (err) => {
        console.error('Error loading all readings:', err);
        this.errorSignal.set(this.formatError(err, 'Failed to load all readings'));
        this.loadingSignal.set(false);
      }
    });
  }


  /**
   * Loads all readings for a specific plot.
   * @param plotId The ID of the plot whose readings should be retrieved.
   */
  loadReadingsByPlotId(plotId: number): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    this.monitoringApi.getReadingsByPlotId(plotId).subscribe({
      next: (readings) => {
        // Remove old readings for this plot and add new ones
        const currentReadings = this.readingsSignal();
        const filteredReadings = currentReadings.filter(r => r.plotId !== plotId);
        this.readingsSignal.set([...filteredReadings, ...readings]);

        this.loadingSignal.set(false);
      },
      error: (err) => {
        console.error('Error loading readings for plot', plotId, ':', err);
        this.errorSignal.set(this.formatError(err, 'Failed to load readings'));
        this.loadingSignal.set(false);
      }
    });
  }

  /**
   * Creates a new environmental reading and evaluates if it triggers an alert.
   * @param reading The reading to be added.
   */
  addReading(reading: EnvironmentalReading): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    this.monitoringApi.createReading(reading).pipe(retry(2)).subscribe({
      next: (created) => {
        this.readingsSignal.update((r) => [...r, created]);
        this.loadingSignal.set(false);

        // Evaluate alert after creation
        const alertMsg = this.evaluate(created);
        if (alertMsg) {
          this.alertsSignal.update((alerts) => [...alerts, alertMsg]);
          console.warn('⚠️ ALERT:', alertMsg);
        }
      },
      error: (err) => {
        this.errorSignal.set(this.formatError(err, 'Failed to add reading'));
        this.loadingSignal.set(false);
      }
    });
  }

  /**
   * Evaluates a reading to determine if it is outside safe thresholds.
   * @param reading The EnvironmentalReading to evaluate.
   * @returns A string message if an alert is triggered, otherwise null.
   */
  private evaluate(reading: EnvironmentalReading): string | null {
    switch (reading.type) {
      case ReadingType.TEMPERATURE:
        if (reading.value < 10 || reading.value > 35) {
          return `Temperature alert for Plot ${reading.plotId}: ${reading.value}°${reading.unit}`;
        }
        break;

      case ReadingType.HUMIDITY:
        if (reading.value < 40 || reading.value > 80) {
          return `Humidity alert for Plot ${reading.plotId}: ${reading.value}${reading.unit}`;
        }
        break;

      case ReadingType.PH_LEVEL:
        if (reading.value < 5.5 || reading.value > 7.5) {
          return `pH alert for Plot ${reading.plotId}: ${reading.value}`;
        }
        break;
    }
    return null;
  }

  /**
   * Clears all alerts manually.
   */
  clearAlerts(): void {
    this.alertsSignal.set([]);
  }

  /**
   * Loads current weather data for a specific location.
   * @param location - Optional location query (defaults to environment location).
   */
  loadCurrentWeather(location?: string): void {
    this.weatherLoadingSignal.set(true);

    this.weatherApi.getCurrentWeather(location).pipe(retry(2)).subscribe({
      next: (weather) => {
        console.log('Loaded weather data:', weather);
        this.weatherSignal.set(weather);
        this.weatherLoadingSignal.set(false);
      },
      error: (err) => {
        console.error('Error loading weather:', err);
        this.weatherSignal.set(null);
        this.weatherLoadingSignal.set(false);
      }
    });
  }

  /**
   * Loads tasks assigned to a profile (for FARMER role)
   */
  loadTasksAssignedTo(assignedToProfileId: number): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    this.taskApi.getTasksAssignedTo(assignedToProfileId).pipe(
      switchMap((tasks) => {
        if (tasks.length === 0) {
          return of(tasks);
        }
        // Get unique organization IDs
        const orgIds = [...new Set(tasks.map(t => t.organizationId))];
        // Fetch all organization names in parallel
        const orgRequests = orgIds.map(id =>
          this.taskApi.getOrganizationName(id).pipe(
            map(name => ({ id, name }))
          )
        );
        return forkJoin(orgRequests).pipe(
          map(orgNames => {
            const orgMap = new Map(orgNames.map(o => [o.id, o.name]));
            // Enrich tasks with organization names
            return tasks.map(task => ({
              ...task,
              organizationName: orgMap.get(task.organizationId)
            }));
          })
        );
      })
    ).subscribe({
      next: (tasks) => {
        this.tasksSignal.set(tasks);
        this.loadingSignal.set(false);
      },
      error: (err) => {
        this.errorSignal.set(this.formatError(err, 'Failed to load assigned tasks'));
        this.loadingSignal.set(false);
      }
    });
  }

  /**
   * Loads tasks created by a profile (for AGRONOMIST role)
   */
  loadTasksByAssignee(assigneeProfileId: number): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    this.taskApi.getTasksByAssignee(assigneeProfileId).pipe(
      switchMap((tasks) => {
        if (tasks.length === 0) {
          return of(tasks);
        }
        // Get unique organization IDs
        const orgIds = [...new Set(tasks.map(t => t.organizationId))];
        // Fetch all organization names in parallel
        const orgRequests = orgIds.map(id =>
          this.taskApi.getOrganizationName(id).pipe(
            map(name => ({ id, name }))
          )
        );
        return forkJoin(orgRequests).pipe(
          map(orgNames => {
            const orgMap = new Map(orgNames.map(o => [o.id, o.name]));
            // Enrich tasks with organization names
            return tasks.map(task => ({
              ...task,
              organizationName: orgMap.get(task.organizationId)
            }));
          })
        );
      })
    ).subscribe({
      next: (tasks) => {
        this.tasksSignal.set(tasks);
        this.loadingSignal.set(false);
      },
      error: (err) => {
        this.errorSignal.set(this.formatError(err, 'Failed to load tasks'));
        this.loadingSignal.set(false);
      }
    });
  }

  /**
   * Creates a new task
   */
  createTask(task: Task): void {
    console.log('📝 Creating task:', task);
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    this.taskApi.createTask(task).subscribe({
      next: (created) => {
        console.log('✅ Task created successfully:', created);
        this.tasksSignal.update((tasks) => [...tasks, created]);
        this.loadingSignal.set(false);
      },
      error: (err) => {
        console.error('❌ Error creating task:', err);
        // No mostrar error ya que la tarea puede haberse creado correctamente
        this.loadingSignal.set(false);
      }
    });
  }

  /**
   * Cancel a task (change status to CANCELLED)
   */
  cancelTask(taskId: number): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    this.taskApi.cancelTask(taskId).pipe(retry(2)).subscribe({
      next: () => {
        this.tasksSignal.update((tasks) =>
          tasks.map(task =>
            task.taskId === taskId ? { ...task, taskStatus: 'CANCELLED' } : task
          )
        );
        this.loadingSignal.set(false);
      },
      error: (err) => {
        this.errorSignal.set(this.formatError(err, 'Failed to cancel task'));
        this.loadingSignal.set(false);
      }
    });
  }

  /**
   * Mark task as in progress
   */
  markInProgress(taskId: number): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    this.taskApi.markInProgress(taskId).pipe(retry(2)).subscribe({
      next: () => {
        this.tasksSignal.update((tasks) =>
          tasks.map(task =>
            task.taskId === taskId ? { ...task, taskStatus: 'IN_PROGRESS' } : task
          )
        );
        this.loadingSignal.set(false);
      },
      error: (err) => {
        this.errorSignal.set(this.formatError(err, 'Failed to mark task in progress'));
        this.loadingSignal.set(false);
      }
    });
  }

  /**
   * Mark task as completed
   */
  markCompleted(taskId: number): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    this.taskApi.markCompleted(taskId).pipe(retry(2)).subscribe({
      next: () => {
        this.tasksSignal.update((tasks) =>
          tasks.map(task =>
            task.taskId === taskId ? { ...task, taskStatus: 'COMPLETED' } : task
          )
        );
        this.loadingSignal.set(false);
      },
      error: (err) => {
        this.errorSignal.set(this.formatError(err, 'Failed to mark task as completed'));
        this.loadingSignal.set(false);
      }
    });
  }

  /**
   * Delete a task
   */
  deleteTask(taskId: number): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    this.taskApi.deleteTask(taskId).pipe(retry(2)).subscribe({
      next: () => {
        this.tasksSignal.update((tasks) =>
          tasks.filter(task => task.taskId !== taskId)
        );
        this.loadingSignal.set(false);
      },
      error: (err) => {
        this.errorSignal.set(this.formatError(err, 'Failed to delete task'));
        this.loadingSignal.set(false);
      }
    });
  }

  // ========== PLANT SAMPLING SESSIONS ==========

  /**
   * Loads all plant sampling sessions
   */
  loadAllSessions(): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    this.plantSamplingApi.getAllSessions().subscribe({
      next: (sessions) => {
        console.log('Loaded all sessions:', sessions);
        this.sessionsSignal.set(sessions);
        this.loadingSignal.set(false);
      },
      error: (err) => {
        console.error('Error loading all sessions:', err);
        // Si es 404 o 500, no mostrar error crítico, solo log
        if (err.status === 404 || err.status === 500) {
          console.log('No sessions available or backend error');
          this.sessionsSignal.set([]); // Array vacío en lugar de error
        } else {
          this.errorSignal.set(this.formatError(err, 'Failed to load all sessions'));
        }
        this.loadingSignal.set(false);
      }
    });
  }

  /**
   * Loads all sessions for a specific plot
   * @param plotId - The ID of the plot
   */
  loadSessionsByPlot(plotId: number): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    this.plantSamplingApi.getSessionsByPlot(plotId).subscribe({
      next: (sessions) => {
        console.log('Loaded sessions for plot', plotId, ':', sessions);
        // Remove old sessions for this plot and add new ones
        const currentSessions = this.sessionsSignal();
        const filteredSessions = currentSessions.filter(s => s.plotId !== plotId);
        this.sessionsSignal.set([...filteredSessions, ...sessions]);
        this.loadingSignal.set(false);
      },
      error: (err) => {
        // Si es 404, simplemente no hay sesiones para esta parcela (no es un error crítico)
        if (err.status === 404) {
          console.log('No sessions found for plot', plotId);
          // Remove old sessions for this plot (si existían)
          const currentSessions = this.sessionsSignal();
          const filteredSessions = currentSessions.filter(s => s.plotId !== plotId);
          this.sessionsSignal.set(filteredSessions);
        } else {
          console.error('Error loading sessions for plot', plotId, ':', err);
          this.errorSignal.set(this.formatError(err, 'Failed to load sessions'));
        }
        this.loadingSignal.set(false);
      }
    });
  }

  /**
   * Loads a specific session by ID
   * @param sessionId - The ID of the session
   */
  loadSessionById(sessionId: number): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    this.plantSamplingApi.getSessionById(sessionId).subscribe({
      next: (session) => {
        console.log('Loaded session:', session);
        // Update or add the session in the signal
        this.sessionsSignal.update((sessions) => {
          const index = sessions.findIndex(s => s.id === sessionId);
          if (index >= 0) {
            const updated = [...sessions];
            updated[index] = session;
            return updated;
          }
          return [...sessions, session];
        });
        this.loadingSignal.set(false);
      },
      error: (err) => {
        console.error('Error loading session', sessionId, ':', err);
        // Si es 404 o 500, no mostrar error crítico en UI
        if (err.status === 404) {
          console.log('Session not found:', sessionId);
        } else if (err.status === 500) {
          console.log('Backend error loading session:', sessionId);
        } else {
          this.errorSignal.set(this.formatError(err, 'Failed to load session'));
        }
        this.loadingSignal.set(false);
      }
    });
  }

  /**
   * Creates a new plant sampling session
   * @param session - The session to create
   */
  createSession(session: PlantSamplingSession): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    this.plantSamplingApi.createSession(session).subscribe({
      next: (created) => {
        console.log('Session created:', created);
        this.sessionsSignal.update((sessions) => [...sessions, created]);
        this.loadingSignal.set(false);
      },
      error: (err) => {
        console.error('Error creating session:', err);
        // No mostrar error ya que la sesión se crea correctamente
        this.loadingSignal.set(false);
      }
    });
  }

  /**
   * Updates an existing session
   * @param sessionId - The ID of the session to update
   * @param session - The updated session data
   */
  updateSession(sessionId: number, session: PlantSamplingSession): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    this.plantSamplingApi.updateSession(sessionId, session).pipe(retry(2)).subscribe({
      next: (updated) => {
        console.log('Session updated:', updated);
        this.sessionsSignal.update((sessions) =>
          sessions.map(s => s.id === sessionId ? updated : s)
        );
        this.loadingSignal.set(false);
      },
      error: (err) => {
        console.error('Error updating session:', err);
        this.errorSignal.set(this.formatError(err, 'Failed to update session'));
        this.loadingSignal.set(false);
      }
    });
  }

  /**
   * Deletes a session
   * @param sessionId - The ID of the session to delete
   */
  deleteSession(sessionId: number): void {
    console.log('🗑️ Attempting to delete session:', sessionId);

    // Eliminar inmediatamente del estado local
    this.sessionsSignal.update((sessions) => {
      const filtered = sessions.filter(s => s.id !== sessionId);
      console.log('Sessions before delete:', sessions.length);
      console.log('Sessions after delete:', filtered.length);
      return filtered;
    });

    // Intentar eliminar del servidor
    this.plantSamplingApi.deleteSession(sessionId).subscribe({
      next: () => {
        console.log('✅ Session deleted successfully from server:', sessionId);
      },
      error: (err) => {
        console.error('❌ Error deleting from server (but already removed from UI):', err);
        // Aunque haya error en el servidor, la sesión ya se eliminó del UI
      }
    });
  }

  // ========== PLANT OBSERVATIONS ==========

  /**
   * Loads all observations for a specific session
   * @param sessionId - The ID of the session
   */
  loadObservationsBySession(sessionId: number): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    this.plantSamplingApi.getObservationsBySession(sessionId).subscribe({
      next: (observations) => {
        console.log('Loaded observations for session', sessionId, ':', observations);
        this.observationsSignal.set(observations);
        this.loadingSignal.set(false);
      },
      error: (err) => {
        console.error('Error loading observations:', err);
        // Si es 404 o 500, no mostrar error crítico, solo log
        if (err.status === 404) {
          console.log('No observations found for session', sessionId);
          this.observationsSignal.set([]); // Array vacío
        } else if (err.status === 500) {
          console.log('Backend error loading observations for session', sessionId);
          this.observationsSignal.set([]);
        } else {
          this.errorSignal.set(this.formatError(err, 'Failed to load observations'));
        }
        this.loadingSignal.set(false);
      }
    });
  }

  /**
   * Creates a new observation for a session
   * @param sessionId - The ID of the session
   * @param observation - The observation to create
   */
  createObservation(sessionId: number, observation: PlantObservation): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    this.plantSamplingApi.createObservation(sessionId, observation).subscribe({
      next: (created) => {
        console.log('Observation created:', created);
        // Solo recargar la sesión completa para actualizar todo (incluyendo promedios y observaciones)
        this.loadSessionById(sessionId);
        this.loadingSignal.set(false);
      },
      error: (err) => {
        console.error('Error creating observation:', err);
        // Recargar la sesión de todas formas para actualizar los datos
        this.loadSessionById(sessionId);
        this.loadingSignal.set(false);
      }
    });
  }

  /**
   * Updates an existing observation
   * @param sessionId - The ID of the session
   * @param observationId - The ID of the observation to update
   * @param observation - The updated observation data
   */
  updateObservation(sessionId: number, observationId: number, observation: PlantObservation): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    this.plantSamplingApi.updateObservation(sessionId, observationId, observation).pipe(retry(2)).subscribe({
      next: (updated) => {
        console.log('Observation updated:', updated);
        this.observationsSignal.update((observations) =>
          observations.map(o => o.id === observationId ? updated : o)
        );
        // Reload the session to update averages
        this.loadSessionById(sessionId);
        this.loadingSignal.set(false);
      },
      error: (err) => {
        console.error('Error updating observation:', err);
        this.errorSignal.set(this.formatError(err, 'Failed to update observation'));
        this.loadingSignal.set(false);
      }
    });
  }

  /**
   * Deletes an observation from a session
   * @param sessionId - The ID of the session
   * @param observationId - The ID of the observation to delete
   */
  deleteObservation(sessionId: number, observationId: number): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    this.plantSamplingApi.deleteObservation(sessionId, observationId).pipe(retry(2)).subscribe({
      next: () => {
        console.log('Observation deleted:', observationId);
        this.observationsSignal.update((observations) =>
          observations.filter(o => o.id !== observationId)
        );
        // Reload the session to update averages
        this.loadSessionById(sessionId);
        this.loadingSignal.set(false);
      },
      error: (err) => {
        console.error('Error deleting observation:', err);
        this.errorSignal.set(this.formatError(err, 'Failed to delete observation'));
        this.loadingSignal.set(false);
      }
    });
  }

  /**
   * Formats an error message for user-friendly display.
   * @param error The error object.
   * @param fallback The fallback error message.
   * @returns A formatted string describing the error.
   */
  private formatError(error: any, fallback: string): string {
    if (error instanceof Error) {
      return error.message.includes('Resource not found')
        ? `${fallback}: Not found`
        : error.message;
    }
    return fallback;
  }
}
