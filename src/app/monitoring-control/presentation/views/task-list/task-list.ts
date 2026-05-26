import { Component, inject, OnInit, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialogModule, MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MonitoringStore } from '../../../application/monitoring-control.store';
import { IamStore } from '../../../../iam/application/iam.store';
import { UserRole } from '../../../../iam/domain/model/user.role.enum';
import { Router } from '@angular/router';
import { Inject } from '@angular/core';
import {OrganizationStore} from '../../../../organization/application/organization.store';



@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [
    CommonModule,
    TranslatePipe,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatIconModule,
    MatButtonModule,
    MatSelectModule,
    MatInputModule,
    MatFormFieldModule,
    MatDialogModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTooltipModule,
    FormsModule
  ],
  templateUrl: './task-list.html',
  styleUrl: './task-list.css'
})
export class TaskList implements OnInit {
  readonly monitoringStore = inject(MonitoringStore);
  readonly iamStore = inject(IamStore);
  readonly organizationStore = inject(OrganizationStore)
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);

  selectedStatus = 'all';
  selectedOrganization = 'all';
  startDateFilter: Date | null = null;
  endDateFilter: Date | null = null;



  get filteredTasks() {
    return this.tasks.filter(task => {
      // Status filter
      const statusFilter = this.selectedStatus === 'all' ||
        task.taskStatus?.toUpperCase() === this.selectedStatus.toUpperCase();

      // Organization filter
      const orgFilter = this.selectedOrganization === 'all' ||
        task.organizationId?.toString() === this.selectedOrganization;

      // Start date filter
      const startFilter = !this.startDateFilter ||
        new Date(task.startDate) >= this.startDateFilter;

      // End date filter
      const endFilter = !this.endDateFilter ||
        new Date(task.endDate) <= this.endDateFilter;

      return statusFilter && orgFilter && startFilter && endFilter;
    });
  }

  ngOnInit(): void {
    console.log('🔄 Task list component initialized - Loading tasks');
    this.loadData();
  }

  loadData(): void {
    const profileId = this.iamStore.currentUserIdValue;
    console.log('📋 Loading tasks for profileId:', profileId);

    if (!profileId) {
      console.warn('⚠️ No profileId available');
      return;
    }

    // 1. Cargar Tareas
    if (this.isFarmer) {
      console.log('👨‍🌾 Loading tasks as Farmer');
      this.monitoringStore.loadTasksAssignedTo(profileId);
    } else if (this.isAgronomist) {
      console.log('👩‍🌾 Loading tasks as Agronomist');
      this.monitoringStore.loadTasksByAssignee(profileId);
    }

    // 2. Cargar Organizaciones (Para poder mostrar los nombres)
    this.organizationStore.loadOrganizationsByOwner(profileId);

    console.log('✅ Tasks loaded:', this.monitoringStore.tasks().length);
  }


  /** Get tasks from store */
  get tasks() {
    return this.monitoringStore.tasks();
  }

  get isAgronomist(): boolean {
    return this.iamStore.isAgronomist(); // CAMBIO
  }

  get isFarmer(): boolean {
    return this.iamStore.isFarmer(); // CAMBIO
  }

  /** Navigate to create task form (for agronomists) */
  navigateToCreateTask(): void {
    this.router.navigate(['/tasks/create']);
  }

  /** Get unique organizations from tasks for the filter dropdown */
  get uniqueOrganizations() {
    // Usamos las organizaciones cargadas en el store en lugar de deducirlas de las tareas
    // para tener nombres más fiables.
    return this.organizationStore.organizationsByOwner().map(org => ({
      id: org.id,
      name: org.organizationName
    }));
  }

  /** Clear date filters */
  clearDateFilters(): void {
    this.startDateFilter = null;
    this.endDateFilter = null;
  }

  /** Get status color */
  getStatusColor(status: string): string {
    switch (status.toUpperCase()) {
      case 'COMPLETED':
      case 'FINALIZADO':
        return '#4caf50'; // Verde - Completado
      case 'IN_PROGRESS':
      case 'EN_PROGRESO':
        return '#2196f3'; // Azul - En progreso
      case 'PENDING':
      case 'PENDIENTE':
        return '#ff9800'; // Naranja - Pendiente
      case 'CANCELLED':
      case 'CANCELADO':
        return '#f44336'; // Rojo - Cancelado
      default:
        return '#9e9e9e'; // Gris - Desconocido
    }
  }

  /** Get status display name */
  getStatusDisplayName(status: string): string {
    switch (status.toUpperCase()) {
      case 'COMPLETED':
        return 'Completado';
      case 'IN_PROGRESS':
        return 'En Progreso';
      case 'PENDING':
        return 'Pendiente';
      case 'CANCELLED':
        return 'Cancelado';
      default:
        return status;
    }
  }

  /** Format date */
  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  toggleTaskCompletion(task: any): void {
    task.completed = !task.completed;
    task.status = task.completed ? 'completed' : 'pending';
  }

  trackByTaskId(index: number, task: any): number {
    return task.taskId || index;
  }

  getPriorityIcon(priority: string): string {
    switch (priority) {
      case 'high': return 'priority_high';
      case 'medium': return 'remove';
      case 'low': return 'keyboard_arrow_down';
      default: return 'remove';
    }
  }

  getPriorityColor(priority: string): string {
    switch (priority) {
      case 'high': return 'warn';
      case 'medium': return 'accent';
      case 'low': return 'primary';
      default: return 'primary';
    }
  }

  getCategoryIcon(categoryKey: string): string {
    if (categoryKey.includes('irrigation')) return 'water_drop';
    if (categoryKey.includes('fertilization')) return 'eco';
    if (categoryKey.includes('pest_control')) return 'pest_control';
    if (categoryKey.includes('harvest')) return 'agriculture';
    if (categoryKey.includes('soil_preparation')) return 'landscape';
    if (categoryKey.includes('monitoring')) return 'visibility';
    if (categoryKey.includes('maintenance')) return 'build';
    return 'task';
  }

  /** Open task details dialog */
  openTaskDetails(task: any): void {
    const dialogRef = this.dialog.open(TaskDetailsDialog, {
      width: '600px',
      data: { task, isAgronomist: this.isAgronomist, isFarmer: this.isFarmer }
    });

    dialogRef.componentInstance.onCancel.subscribe((taskId: number) => {
      this.cancelTask(taskId);
    });

    dialogRef.componentInstance.onDelete.subscribe((taskId: number) => {
      this.deleteTask(taskId);
    });

    dialogRef.componentInstance.onMarkInProgress.subscribe((taskId: number) => {
      this.markInProgress(taskId);
    });

    dialogRef.componentInstance.onMarkCompleted.subscribe((taskId: number) => {
      this.markCompleted(taskId);
    });
  }

  /** Check if task can be cancelled */
  canCancelTask(status: string): boolean {
    const upperStatus = status.toUpperCase();
    return upperStatus === 'PENDING' || upperStatus === 'IN_PROGRESS';
  }

  /** Cancel a task */
  cancelTask(taskId: number): void {
    if (confirm('¿Está seguro de que desea cancelar esta tarea?')) {
      this.monitoringStore.cancelTask(taskId);
    }
  }

  /** Delete a task */
  deleteTask(taskId: number): void {
    if (confirm('¿Está seguro de que desea eliminar esta tarea? Esta acción no se puede deshacer.')) {
      this.monitoringStore.deleteTask(taskId);
    }
  }

  /** Mark task as in progress */
  markInProgress(taskId: number): void {
    if (confirm('¿Marcar esta tarea como "En Progreso"?')) {
      this.monitoringStore.markInProgress(taskId);
    }
  }

  /** Mark task as completed */
  markCompleted(taskId: number): void {
    if (confirm('¿Marcar esta tarea como "Completada"?')) {
      this.monitoringStore.markCompleted(taskId);
    }
  }
}

/** Dialog component for task details */
@Component({
  selector: 'task-details-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>assignment</mat-icon>
      Detalles de la Tarea
    </h2>
    <mat-dialog-content>
      <div class="dialog-section">
        <h3>{{ data.task.title }}</h3>
        <p class="description">{{ data.task.description }}</p>
      </div>

      <div class="dialog-section">
        <div class="detail-row">
          <mat-icon>business</mat-icon>
          <span><strong>Organización:</strong> {{ data.task.organizationName || 'Cargando...' }}</span>
        </div>
        <div class="detail-row">
          <mat-icon>calendar_today</mat-icon>
          <span><strong>Inicio:</strong> {{ formatDate(data.task.startDate) }}</span>
        </div>
        <div class="detail-row">
          <mat-icon>event</mat-icon>
          <span><strong>Fin:</strong> {{ formatDate(data.task.endDate) }}</span>
        </div>
        <div class="detail-row">
          <mat-icon>info</mat-icon>
          <span><strong>Estado:</strong></span>
          <mat-chip [style.background-color]="getStatusColor(data.task.taskStatus)">
            {{ getStatusDisplayName(data.task.taskStatus) }}
          </mat-chip>
        </div>
      </div>

      @if (data.task.materialsUsed && data.task.materialsUsed.length > 0) {
        <div class="dialog-section">
          <h4><mat-icon>inventory</mat-icon> Materiales Utilizados</h4>
          <div class="materials-full-list">
            @for (material of data.task.materialsUsed; track $index) {
              <div class="material-full-item">
                <span class="material-name">{{ material.materialName }}</span>
                <span class="material-qty">{{ material.quantity }} {{ material.unit }}</span>
              </div>
            }
          </div>
        </div>
      }
    </mat-dialog-content>
    <mat-dialog-actions>
      @if (data.isAgronomist) {
        <div class="agronomist-actions">
          @if (canCancelTask(data.task.taskStatus)) {
            <button mat-raised-button color="warn" (click)="cancelTask()">
              <mat-icon>cancel</mat-icon>
              Cancelar Tarea
            </button>
          }
          <button mat-raised-button color="warn" (click)="deleteTask()">
            <mat-icon>delete</mat-icon>
            Eliminar
          </button>
        </div>
      }
      @if (data.isFarmer) {
        <div class="agronomist-actions">
          @if (canMarkInProgress()) {
            <button mat-raised-button color="accent" (click)="markInProgress()">
              <mat-icon>play_arrow</mat-icon>
              Marcar en Progreso
            </button>
          }
          @if (canMarkCompleted()) {
            <button mat-raised-button style="background-color: #4caf50; color: white;" (click)="markCompleted()">
              <mat-icon>check_circle</mat-icon>
              Marcar Completado
            </button>
          }
        </div>
      }
      <button mat-raised-button mat-dialog-close color="primary">
        <mat-icon>close</mat-icon>
        Cerrar
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    mat-dialog-content {
      max-height: 70vh;
      overflow-y: auto;
    }

    h2[mat-dialog-title] {
      display: flex;
      align-items: center;
      gap: 10px;
      color: #333;
    }

    .dialog-section {
      margin-bottom: 20px;
      padding-bottom: 15px;
      border-bottom: 1px solid #f0f0f0;
    }

    .dialog-section:last-of-type {
      border-bottom: none;
    }

    .dialog-section h3 {
      margin: 0 0 10px 0;
      color: #333;
      font-size: 1.2rem;
    }

    .dialog-section h4 {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0 0 12px 0;
      color: #666;
      font-size: 1rem;
    }

    .description {
      color: #555;
      line-height: 1.6;
      margin: 0;
    }

    .detail-row {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 12px;
      color: #555;
    }

    .detail-row mat-icon {
      color: #666;
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .detail-row strong {
      color: #333;
      min-width: 100px;
    }

    .materials-full-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .material-full-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 15px;
      background-color: #f8f9fa;
      border-radius: 6px;
      border-left: 3px solid #4caf50;
    }

    .material-name {
      font-weight: 500;
      color: #333;
    }

    .material-qty {
      color: #666;
      font-size: 0.9rem;
    }

    mat-dialog-actions {
      justify-content: flex-end;
      padding: 16px;
      border-top: 1px solid #f0f0f0;
    }

    mat-dialog-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .agronomist-actions {
      display: flex;
      gap: 8px;
    }

    mat-dialog-actions button mat-icon {
      margin-right: 6px;
    }
  `]
})
export class TaskDetailsDialog {
  onCancel = new EventEmitter<number>();
  onDelete = new EventEmitter<number>();
  onMarkInProgress = new EventEmitter<number>();
  onMarkCompleted = new EventEmitter<number>();

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<TaskDetailsDialog>
  ) {}

  canCancelTask(status: string): boolean {
    const upperStatus = status.toUpperCase();
    return upperStatus === 'PENDING' || upperStatus === 'IN_PROGRESS';
  }

  cancelTask(): void {
    this.onCancel.emit(this.data.task.taskId);
    this.dialogRef.close();
  }

  deleteTask(): void {
    this.onDelete.emit(this.data.task.taskId);
    this.dialogRef.close();
  }

  markInProgress(): void {
    this.onMarkInProgress.emit(this.data.task.taskId);
    this.dialogRef.close();
  }

  markCompleted(): void {
    this.onMarkCompleted.emit(this.data.task.taskId);
    this.dialogRef.close();
  }

  canMarkInProgress(): boolean {
    return this.data.task.taskStatus?.toUpperCase() === 'PENDING';
  }

  canMarkCompleted(): boolean {
    return this.data.task.taskStatus?.toUpperCase() === 'IN_PROGRESS';
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getStatusColor(status: string): string {
    switch (status.toUpperCase()) {
      case 'COMPLETED':
      case 'FINALIZADO':
        return '#4caf50'; // Verde - Completado
      case 'IN_PROGRESS':
      case 'EN_PROGRESO':
        return '#2196f3'; // Azul - En progreso
      case 'PENDING':
      case 'PENDIENTE':
        return '#ff9800'; // Naranja - Pendiente
      case 'CANCELLED':
      case 'CANCELADO':
        return '#f44336'; // Rojo - Cancelado
      default:
        return '#9e9e9e'; // Gris - Desconocido
    }
  }

  getStatusDisplayName(status: string): string {
    switch (status.toUpperCase()) {
      case 'COMPLETED':
        return 'Completado';
      case 'IN_PROGRESS':
        return 'En Progreso';
      case 'PENDING':
        return 'Pendiente';
      case 'CANCELLED':
        return 'Cancelado';
      default:
        return status;
    }
  }
}
