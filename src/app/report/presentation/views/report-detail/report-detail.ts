import { Component, OnInit, OnDestroy, ChangeDetectorRef, inject, effect } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ReportStore } from '../../../application/report.store';
import { Report } from '../../../domain/model/report.entity';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-report-detail',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, TranslatePipe],
  templateUrl: './report-detail.html',
  styleUrls: ['./report-detail.css']
})
export class ReportDetailComponent implements OnInit, OnDestroy {
  public store = inject(ReportStore);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private translate = inject(TranslateService);
  private cdr = inject(ChangeDetectorRef);

  report: Report | undefined;
  private langSub: any;

  constructor() {
    // Effect para reaccionar cuando los reportes se carguen (caso refresh F5)
    effect(() => {
      const id = Number(this.route.snapshot.paramMap.get('id'));
      const reports = this.store.reports();
      if (reports.length > 0) {
        this.report = reports.find(r => r.id === id);
      }
    });
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));


    this.report = this.store.reports().find((r) => r.id === id);


    if (!this.report) {
      this.store.loadReports();
    }

    this.langSub = this.translate.onLangChange.subscribe(() => {
      this.cdr.markForCheck();
    });
  }

  downloadExcel(): void {
    if (!this.report) return;


    const metrics = this.report.reportMetrics || {};

    const rows = [
      ['REPORTE DE DETALLE'],
      ['ID Reporte', this.report.id],
      ['Estado', this.report.status],
      ['Tipo', this.report.type],
      ['ID Organizacion', this.report.organizationId],
      ['ID Parcela', this.report.plotId],
      ['Fecha Inicio', this.report.periodStart],
      ['Fecha Fin', this.report.periodEnd],
      ['Generado el', this.report.generatedAt],
      [], // Fila vacía separadora
      ['RESULTADOS / METRICAS'],
      ['Promedio', metrics.averageValue ?? 0],
      ['Valor Maximo', metrics.maxValue ?? 0],
      ['Valor Minimo', metrics.minValue ?? 0],
      ['Cantidad de Datos', metrics.dataCount ?? 0]
    ];

    const csvContent = rows.map(e => e.join(",")).join("\n");


    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

    const url = URL.createObjectURL(blob);


    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `report_${this.report.id}_${new Date().getTime()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  goBack(): void {
    this.router.navigate(['/report']);
  }

  ngOnDestroy(): void {
    if (this.langSub) {
      this.langSub.unsubscribe();
    }
  }
}
