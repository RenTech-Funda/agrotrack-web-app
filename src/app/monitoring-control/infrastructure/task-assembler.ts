import { Task } from '../domain/model/task.entity';
import { TaskResource } from './task-resource';

export class TaskAssembler {
  toEntityFromResource(resource: TaskResource): Task {
    return new Task({
      taskId: resource.id || resource.taskId,
      assigneeProfileId: resource.assigneeProfileId,
      assignedToProfileId: resource.assignedToProfileId,
      organizationId: resource.organizationId,
      organizationName: resource.organizationName,
      title: resource.title,
      description: resource.description,
      startDate: resource.startDate,
      endDate: resource.endDate,
      taskStatus: resource.taskStatus,
      materialsUsed: resource.materialsUsed
    });
  }

  toResourceFromEntity(entity: Task): TaskResource {
    return {
      id: entity.taskId,
      taskId: entity.taskId,
      assigneeProfileId: entity.assigneeProfileId,
      assignedToProfileId: entity.assignedToProfileId,
      organizationId: entity.organizationId,
      organizationName: entity.organizationName,
      title: entity.title,
      description: entity.description,
      startDate: entity.startDate,
      endDate: entity.endDate,
      taskStatus: entity.taskStatus,
      materialsUsed: entity.materialsUsed
    };
  }
}
