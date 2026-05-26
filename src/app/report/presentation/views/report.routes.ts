import { Routes } from "@angular/router";
import { ReportListComponent } from "./report-list/report-list";
import { ReportDetailComponent } from "./report-detail/report-detail";
import {CreateReportForm} from './create-report-form/create-report-form';

export const reportRoutes: Routes = [
  { path: 'create', component: CreateReportForm },
  { path: '', component: ReportListComponent},
  { path: ':id', component: ReportDetailComponent },
];
