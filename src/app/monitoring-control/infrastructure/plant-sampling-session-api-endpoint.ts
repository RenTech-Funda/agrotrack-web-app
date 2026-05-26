import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, forkJoin, of, switchMap } from 'rxjs';
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
  private readonly basePath = `${environment.platformProviderApiBaseUrl}/plant-sampling-sessions`;

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
    // Step 1: Create session WITHOUT observations
    // Construir el payload directamente desde la entidad
    const sessionPayload: any = {
      plotId: session.plotId,
      sampledAt: session.sampledAt, // ISO 8601 format
      average: {
        avgHeightCm: Number(session.average.avgHeightCm),
        avgLeafCount: Number(session.average.avgLeafCount),
        avgFruitCount: Number(session.average.avgFruitCount)
      }
    };

    console.log('🔵 [API] Creating session:');
    console.log('  - plotId:', sessionPayload.plotId, '(type:', typeof sessionPayload.plotId + ')');
    console.log('  - sampledAt:', sessionPayload.sampledAt, '(type:', typeof sessionPayload.sampledAt + ')');
    console.log('  - average:', JSON.stringify(sessionPayload.average));
    console.log('  - Full payload:', JSON.stringify(sessionPayload, null, 2));

    return this.http.post<PlantSamplingSessionResource>(this.basePath, sessionPayload).pipe(
      switchMap((createdSession) => {
        console.log('✅ [API] Session created successfully with ID:', createdSession.id);
        console.log('✅ [API] Created session details:', createdSession);

        // Step 2: If there are observations, add them separately
        if (session.observations && session.observations.length > 0) {
          console.log(`🔵 [API] Adding ${session.observations.length} observations to session ${createdSession.id}`);

          // Create all observations in parallel and wait for all to complete
          const observationRequests = session.observations.map((obs, index) => {
            const obsPayload = {
              heightCm: Number(obs.heightCm),
              leafCount: Number(obs.leafCount),
              fruitCount: Number(obs.fruitCount),
              notes: obs.notes || ''
            };
            console.log(`📤 [API] Sending observation ${index + 1}:`, obsPayload);
            return this.createObservation(createdSession.id, obs);
          });

          // Wait for all observations to be created
          return forkJoin(observationRequests).pipe(
            map((addedObservations) => {
              console.log(`✅ [API] All ${addedObservations.length} observations added successfully`);
              // Return session with the added observations
              createdSession.observations = addedObservations.map(obs => ({
                id: obs.id,
                heightCm: obs.heightCm,
                leafCount: obs.leafCount,
                fruitCount: obs.fruitCount,
                notes: obs.notes
              }));
              return this.assembler.toEntityFromResource(createdSession);
            })
          );
        } else {
          // No observations, just return the created session
          console.log('ℹ️ [API] No observations to add');
          return of(this.assembler.toEntityFromResource(createdSession));
        }
      }),
      map(result => {
        console.log('🎉 [API] Final result:', result);
        return result;
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
    const resource: PlantObservationResource = {
      id: observation.id,
      heightCm: observation.heightCm,
      leafCount: observation.leafCount,
      fruitCount: observation.fruitCount,
      notes: observation.notes
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

