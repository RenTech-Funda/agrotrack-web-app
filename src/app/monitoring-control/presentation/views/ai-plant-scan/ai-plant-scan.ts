import { Component, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';

interface ScanIssue {
  name: string;
  severity: 'low' | 'medium' | 'high';
  confidence: number;
  description: string;
}

interface ScanResult {
  species: string;
  commonName: string;
  healthScore: number;
  status: 'healthy' | 'warning' | 'critical';
  issues: ScanIssue[];
  recommendations: string[];
  analyzedAt: Date;
}

const MOCK_RESULTS: ScanResult[] = [
  {
    species: 'Solanum lycopersicum',
    commonName: 'Tomate',
    healthScore: 82,
    status: 'warning',
    issues: [
      { name: 'Tizón temprano', severity: 'medium', confidence: 87, description: 'Manchas concéntricas oscuras en hojas inferiores.' },
      { name: 'Deficiencia de calcio', severity: 'low', confidence: 74, description: 'Bordes de hojas jóvenes ligeramente amarillentos.' }
    ],
    recommendations: [
      'Aplicar fungicida cúprico cada 7 días durante 3 semanas.',
      'Incorporar cal agrícola al suelo antes del próximo riego.',
      'Evitar el riego por aspersión para reducir humedad foliar.',
      'Mejorar la circulación de aire entre plantas.'
    ],
    analyzedAt: new Date()
  },
  {
    species: 'Zea mays',
    commonName: 'Maíz',
    healthScore: 95,
    status: 'healthy',
    issues: [],
    recommendations: [
      'Continuar con el plan de fertilización actual.',
      'Mantener riego cada 3-4 días según condición del suelo.',
      'Monitorear aparición de cogollero en las próximas semanas.'
    ],
    analyzedAt: new Date()
  },
  {
    species: 'Capsicum annuum',
    commonName: 'Pimiento',
    healthScore: 41,
    status: 'critical',
    issues: [
      { name: 'Virus del mosaico', severity: 'high', confidence: 93, description: 'Moteado clorótico y deformación severa de hojas.' },
      { name: 'Áfidos (pulgones)', severity: 'high', confidence: 88, description: 'Colonia activa detectada en brotes terminales.' },
      { name: 'Estrés hídrico', severity: 'medium', confidence: 79, description: 'Marchitamiento diurno reversible en hojas.' }
    ],
    recommendations: [
      'Retirar y destruir plantas severamente infectadas para evitar propagación.',
      'Aplicar insecticida sistémico para control de vectores (áfidos).',
      'Instalar malla antiáfidos en el perímetro del cultivo.',
      'Revisar sistema de riego — posible obstrucción detectada.',
      'Consultar con agrónomo antes de replantear.'
    ],
    analyzedAt: new Date()
  }
];

type ScanState = 'idle' | 'uploading' | 'analyzing' | 'done';

@Component({
  selector: 'app-ai-plant-scan',
  standalone: true,
  templateUrl: './ai-plant-scan.html',
  styleUrls: ['./ai-plant-scan.css'],
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatChipsModule,
    MatDividerModule,
    MatTooltipModule,
    DatePipe
  ]
})
export class AiPlantScan {
  state = signal<ScanState>('idle');
  previewUrl = signal<string | null>(null);
  result = signal<ScanResult | null>(null);
  analyzeProgress = signal<number>(0);
  private mockIndex = 0;

  readonly statusColor = computed(() => {
    const r = this.result();
    if (!r) return '';
    return { healthy: 'status-healthy', warning: 'status-warning', critical: 'status-critical' }[r.status];
  });

  readonly statusLabel = computed(() => {
    const r = this.result();
    if (!r) return '';
    return { healthy: 'Saludable', warning: 'Atención requerida', critical: 'Estado crítico' }[r.status];
  });

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      this.previewUrl.set(reader.result as string);
      this.runAnalysis();
    };
    reader.readAsDataURL(file);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    const file = event.dataTransfer?.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      this.previewUrl.set(reader.result as string);
      this.runAnalysis();
    };
    reader.readAsDataURL(file);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  private runAnalysis(): void {
    this.state.set('uploading');
    this.analyzeProgress.set(0);
    this.result.set(null);

    setTimeout(() => {
      this.state.set('analyzing');
      this.simulateProgress();
    }, 800);
  }

  private simulateProgress(): void {
    const steps = [15, 35, 52, 68, 80, 91, 97, 100];
    let i = 0;
    const tick = () => {
      if (i < steps.length) {
        this.analyzeProgress.set(steps[i++]);
        setTimeout(tick, 300 + Math.random() * 200);
      } else {
        const mockResult = MOCK_RESULTS[this.mockIndex % MOCK_RESULTS.length];
        this.mockIndex++;
        this.result.set({ ...mockResult, analyzedAt: new Date() });
        this.state.set('done');
      }
    };
    tick();
  }

  reset(): void {
    this.state.set('idle');
    this.previewUrl.set(null);
    this.result.set(null);
    this.analyzeProgress.set(0);
  }

  getSeverityColor(severity: string): string {
    return { low: 'severity-low', medium: 'severity-medium', high: 'severity-high' }[severity] ?? '';
  }

  getSeverityLabel(severity: string): string {
    return { low: 'Leve', medium: 'Moderado', high: 'Grave' }[severity] ?? severity;
  }

  getSeverityIcon(severity: string): string {
    return { low: 'info', medium: 'warning', high: 'error' }[severity] ?? 'help';
  }
}
