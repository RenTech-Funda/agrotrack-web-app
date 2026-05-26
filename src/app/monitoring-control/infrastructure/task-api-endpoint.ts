import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Task } from '../domain/model/task.entity';
import { TaskResource } from './task-resource';
import { TaskAssembler } from './task-assembler';

@Injectable({
  providedIn: 'root'
})
export class TaskApiEndpoint {
  private readonly assembler = new TaskAssembler();

  constructor(private http: HttpClient) {}

  /**
   * Get tasks assigned to a profile (for FARMER role)
   */
  getTasksAssignedTo(assignedToProfileId: number): Observable<Task[]> {
    const url = `${environment.platformProviderApiBaseUrl}/tasks/assigned/${assignedToProfileId}`;
    return this.http.get<TaskResource[]>(url).pipe(
      map((resources) => resources.map(resource => this.assembler.toEntityFromResource(resource)))
    );
  }

  /**
   * Get tasks created by a profile (for AGRONOMIST role)
   */
  getTasksByAssignee(assigneeProfileId: number): Observable<Task[]> {
    const url = `${environment.platformProviderApiBaseUrl}/tasks/assignee/${assigneeProfileId}`;
    return this.http.get<TaskResource[]>(url).pipe(
      map((resources) => resources.map(resource => this.assembler.toEntityFromResource(resource)))
    );
  }

  /**
   * Create a new task
   */
  createTask(task: Task): Observable<Task> {
    const url = `${environment.platformProviderApiBaseUrl}/tasks`;
    const resource = this.assembler.toResourceFromEntity(task);
    return this.http.post<TaskResource>(url, resource).pipe(
      map((res) => this.assembler.toEntityFromResource(res))
    );
  }

  /**
   * Get organization name by ID
   */
  getOrganizationName(organizationId: number): Observable<string> {
    const url = `${environment.platformProviderApiBaseUrl}/organizations/${organizationId}`;
    return this.http.get<any>(url).pipe(
      map((org) => org.organizationName || 'Unknown')
    );
  }

  /**
   * Update task status
   */
  updateTaskStatus(taskId: number, status: string): Observable<void> {
    const url = `${environment.platformProviderApiBaseUrl}/tasks/${taskId}/status`;
    return this.http.patch<void>(url, { status });
  }

  /**
   * Cancel a task (change status to CANCELLED)
   */
  cancelTask(taskId: number): Observable<void> {
    return this.updateTaskStatus(taskId, 'CANCELLED');
  }

  /**
   * Mark task as in progress
   */
  markInProgress(taskId: number): Observable<void> {
    return this.updateTaskStatus(taskId, 'IN_PROGRESS');
  }

  /**
   * Mark task as completed
   */
  markCompleted(taskId: number): Observable<void> {
    return this.updateTaskStatus(taskId, 'COMPLETED');
  }

  /**
   * Delete a task
   */
  deleteTask(taskId: number): Observable<void> {
    const url = `${environment.platformProviderApiBaseUrl}/tasks/${taskId}`;
    return this.http.delete<void>(url);
  }
}
