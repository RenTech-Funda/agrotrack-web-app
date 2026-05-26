export interface MaterialResource {
  materialName: string;
  quantity: number;
  unit: string;
}

export interface TaskResource {
  id?: number;
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
  materialsUsed: MaterialResource[];
}

export type TasksResponse = TaskResource[];
