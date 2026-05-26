import { Component, OnInit, effect, OnDestroy, ChangeDetectorRef, inject } from '@angular/core';
import { ReportStore } from '../../../application/report.store';
import { Report } from '../../../domain/model/report.entity';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { RouterModule } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import {MatInputModule} from '@angular/material/input';
import {MatIcon} from '@angular/material/icon';

@Component({
  selector: 'app-report-list',
  standalone: true,
  imports: [
    MatIcon,
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatSelectModule,
    MatFormFieldModule,
    RouterModule,
    TranslatePipe
  ],
  templateUrl: './report-list.html',
  styleUrls: ['./report-list.css']
})
export class ReportListComponent implements OnInit, OnDestroy {
  public store = inject(ReportStore);
  private translate = inject(TranslateService);
  private cdr = inject(ChangeDetectorRef);


  displayedColumns = ['id', 'organizationId', 'type', 'status', 'period', 'actions'];


  organizations: number[] = [];
  filteredReports: Report[] = [];


  selectedOrganizationId: number | null = null;

  private langSub: any;

  constructor() {
    effect(() => {
      const reports = this.store.reports();


      this.filteredReports = this.selectedOrganizationId !== null
        ? reports.filter(r => r.organizationId === this.selectedOrganizationId)
        : reports;


      this.organizations = [...new Set(reports.map(r => r.organizationId))];
    });

    this.langSub = this.translate.onLangChange.subscribe(() => {
      this.cdr.markForCheck();
    });
  }

  ngOnInit(): void {
    this.store.loadReports();
  }

  filterByOrganization(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const value = target.value;


    this.selectedOrganizationId = value ? Number(value) : null;


    const reports = this.store.reports();
    this.filteredReports = this.selectedOrganizationId !== null
      ? reports.filter(r => r.organizationId === this.selectedOrganizationId)
      : reports;
  }

  generate(report: Report): void {
    this.store.createReport(report as any); // Ajustar según tu lógica de re-generar
  }

  reload(): void {
    this.store.loadReports();
  }

  ngOnDestroy(): void {
    if (this.langSub) {
      this.langSub.unsubscribe();
    }
  }
}
