import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, forkJoin, of, switchMap, catchError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PlantSamplingSession } from '../domain/model/plant-samplimg-session.entity';
import { PlantObservation } from '../domain/model/plant-observation.entity';
import { PlantSamplingSessionResource, PlantObservationResource } from './plant-sampling-session-resource';
import { PlantSamplingSessionAssembler } from './plant-sampling-session-assembler';

/**
 * API Endpoint service for Plant Sampling Session operations.
 * Handles HTTP communication with the backend API.
 * Endpoints match backend REST structure: /api/v1/plant-sampling-sessions
 */
@Injectable({
  providedIn: 'root'
})
export class PlantSamplingSessionApiEndpoint {
  private readonly assembler = new PlantSamplingSessionAssembler();
  private readonly basePath = `${environment.monitoringServiceBaseUrl}/plant-sampling-sessions`;

  constructor(private http: HttpClient) {}

  /**
   * GET /api/v1/plant-sampling-sessions
   * Get all plant sampling sessions
   */
  getAllSessions(): Observable<PlantSamplingSession[]> {
    return this.http.get<PlantSamplingSessionResource[]>(this.basePath).pipe(
      map((resources) => resources.map(resource => this.assembler.toEntityFromResource(resource)))
    );
  }

  /**
   * POST /api/v1/plant-sampling-sessions
   * Create a new plant sampling session
   * Then POST observations separately to /api/v1/plant-sampling-sessions/{sessionId}/observations
   */
  createSession(session: PlantSamplingSession): Observable<PlantSamplingSession> {
    const sessionPayload = {
      plotId: session.plotId,
      sampledAt: session.sampledAt
    };

    return this.http.post<PlantSamplingSessionResource>(`${this.basePath}/`, sessionPayload).pipe(
      switchMap((createdSession) => {
        if (!session.observations || session.observations.length === 0) {
          return of(this.assembler.toEntityFromResource(createdSession));
        }

        const observationRequests = session.observations.map((obs) =>
          this.createObservation(createdSession.id, obs).pipe(
            catchError((err) => {
              console.warn('[API] Observation failed (backend issue):', err.status);
              return of(null);
            })
          )
        );

        return forkJoin(observationRequests).pipe(
          map(() => this.assembler.toEntityFromResource(createdSession))
        );
      })
    );
  }

  /**
   * GET /api/v1/plant-sampling-sessions/{sessionId}
   * Get a specific plant sampling session by ID
   */
  getSessionById(sessionId: number): Observable<PlantSamplingSession> {
    const url = `${this.basePath}/${sessionId}`;
    return this.http.get<PlantSamplingSessionResource>(url).pipe(
      map((resource) => this.assembler.toEntityFromResource(resource))
    );
  }

  /**
   * GET /api/v1/plant-sampling-sessions/{sessionId}/observations
   * Get all observations for a specific session
   */
  getObservationsBySession(sessionId: number): Observable<PlantObservation[]> {
    const url = `${this.basePath}/${sessionId}/observations`;
    return this.http.get<PlantObservationResource[]>(url).pipe(
      map((resources) => resources.map(resource => new PlantObservation({
        id: resource.id,
        heightCm: resource.heightCm,
        leafCount: resource.leafCount,
        fruitCount: resource.fruitCount,
        notes: resource.notes
      })))
    );
  }

  /**
   * POST /api/v1/plant-sampling-sessions/{sessionId}/observations
   * Add a new observation to a session
   */
  createObservation(sessionId: number, observation: PlantObservation): Observable<PlantObservation> {
    const url = `${this.basePath}/${sessionId}/observations`;
    const resource = {
      id: observation.id,
      heightCm: Number(observation.heightCm),
      leafCount: Number(observation.leafCount),
      fruitCount: Number(observation.fruitCount),
      notes: observation.notes || ''
    };
    return this.http.post<PlantObservationResource>(url, resource).pipe(
      map((res) => new PlantObservation({
        id: res.id,
        heightCm: res.heightCm,
        leafCount: res.leafCount,
        fruitCount: res.fruitCount,
        notes: res.notes
      }))
    );
  }

  /**
   * PUT /api/v1/plant-sampling-sessions/{sessionId}/observations/{observationId}
   * Update an existing observation
   */
  updateObservation(sessionId: number, observationId: number, observation: PlantObservation): Observable<PlantObservation> {
    const url = `${this.basePath}/${sessionId}/observations/${observationId}`;
    const resource: PlantObservationResource = {
      id: observation.id,
      heightCm: observation.heightCm,
      leafCount: observation.leafCount,
      fruitCount: observation.fruitCount,
      notes: observation.notes
    };
    return this.http.put<PlantObservationResource>(url, resource).pipe(
      map((res) => new PlantObservation({
        id: res.id,
        heightCm: res.heightCm,
        leafCount: res.leafCount,
        fruitCount: res.fruitCount,
        notes: res.notes
      }))
    );
  }

  /**
   * DELETE /api/v1/plant-sampling-sessions/{sessionId}/observations/{observationId}
   * Delete an observation from a session
   */
  deleteObservation(sessionId: number, observationId: number): Observable<void> {
    const url = `${this.basePath}/${sessionId}/observations/${observationId}`;
    return this.http.delete<void>(url);
  }

  /**
   * PUT /api/v1/plant-sampling-sessions/{sessionId}
   * Update an existing plant sampling session
   */
  updateSession(sessionId: number, session: PlantSamplingSession): Observable<PlantSamplingSession> {
    const url = `${this.basePath}/${sessionId}`;
    const resource = this.assembler.toResourceFromEntity(session);
    return this.http.put<PlantSamplingSessionResource>(url, resource).pipe(
      map((res) => this.assembler.toEntityFromResource(res))
    );
  }

  /**
   * DELETE /api/v1/plant-sampling-sessions/{sessionId}
   * Delete a plant sampling session
   */
  deleteSession(sessionId: number): Observable<void> {
    const url = `${this.basePath}/${sessionId}`;
    return this.http.delete<void>(url);
  }

  /**
   * GET /api/v1/plant-sampling-sessions/plot/{plotId}
   * Get all plant sampling sessions for a specific plot
   */
  getSessionsByPlot(plotId: number): Observable<PlantSamplingSession[]> {
    const url = `${this.basePath}/plot/${plotId}`;
    return this.http.get<PlantSamplingSessionResource[]>(url).pipe(
      map((resources) => resources.map(resource => this.assembler.toEntityFromResource(resource)))
    );
  }
}

