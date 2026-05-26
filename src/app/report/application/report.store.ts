import { Injectable, computed, signal } from '@angular/core';
import { Report } from '../domain/model/report.entity';
import { ReportApi } from '../infrastructure/report-api';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { retry } from 'rxjs';
import {CreateReportCommand} from '../domain/model/create-report.command';
import {Router} from '@angular/router';
import {GetReportsQuery} from '../domain/model/get-reports.query';

/**
 * Application service store for managing Reports state.
 * @author FloweyTech developer team
 */
@Injectable({ providedIn: 'root' })
export class ReportStore {
  private readonly reportsSignal = signal<Report[]>([]);
  private readonly loadingSignal = signal<boolean>(false);
  private readonly errorSignal = signal<string | null>(null);

  readonly reports = this.reportsSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();

  constructor(private reportApi: ReportApi) {}

  /**
   * Loads all reports from the API and updates the state.
   * @remarks Uses GetReportsQuery to fetch data.
   * @author FloweyTech developer team
   */
  loadReports(): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    const query = new GetReportsQuery();

    this.reportApi.getAll(query).subscribe({
      next: (reports) => {
        this.reportsSignal.set(reports);
        this.loadingSignal.set(false);
      },
      error: (err) => {
        // Asumimos que err es un Error object gracias al ErrorHandlingEnabledBaseType
        this.errorSignal.set(err.message || 'Error loading reports');
        this.loadingSignal.set(false);
        // Opcional: limpiar la lista si hay error
        // this.reportsSignal.set([]);
      }
    });
  }

  /**
   * Creates a new report via the API and updates the state.
   * @param command - The create report command.
   * @param router - Optional router for navigation after success.
   */
  createReport(command: CreateReportCommand, router?: Router): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    this.reportApi.create(command).subscribe({
      next: (newReport) => {
        this.reportsSignal.update(list => [...list, newReport]);
        this.loadingSignal.set(false);

        alert('Report created successfully!');
        if (router) {
          router.navigate(['/report']);
        }
      },
      error: (err) => {
        const errorMessage = err.message || 'Error creating report';
        this.errorSignal.set(errorMessage);
        this.loadingSignal.set(false);

        alert('Error: ' + errorMessage);
      }
    });
  }
}

