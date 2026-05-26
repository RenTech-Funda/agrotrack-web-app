export interface Material {
  materialName: string;
  quantity: number;
  unit: string;
}

export class Task {
  taskId?: number;
  assigneeProfileId: number;
  assignedToProfileId: number;
  organizationId: number;
  organizationName?: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  taskStatus: string;
  materialsUsed: Material[];

  constructor(data: Partial<Task> = {}) {
    this.taskId = data.taskId;
    this.assigneeProfileId = data.assigneeProfileId || 0;
    this.assignedToProfileId = data.assignedToProfileId || 0;
    this.organizationId = data.organizationId || 0;
    this.organizationName = data.organizationName;
    this.title = data.title || '';
    this.description = data.description || '';
    this.startDate = data.startDate || '';
    this.endDate = data.endDate || '';
    this.taskStatus = data.taskStatus || 'PENDING';
    this.materialsUsed = data.materialsUsed || [];
  }
}
