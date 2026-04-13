import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';
import { ProjectEntity } from './project.entity';

@Entity('work_entries')
export class WorkEntryEntity {
  /** PostgreSQL SERIAL (auto-increment integer PK). */
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @ManyToOne(() => UserEntity, (u) => u.workEntries, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({ name: 'project_id' })
  projectId: number;

  @ManyToOne(() => ProjectEntity, (p) => p.workEntries, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project: ProjectEntity;

  @Column({ name: 'task_no', type: 'varchar', length: 64, default: '-' })
  taskNo: string;

  @Column({ name: 'task_title', type: 'varchar', length: 512, default: '' })
  taskTitle: string;

  @Column({ type: 'text', default: '' })
  description: string;

  @Column({ type: 'varchar', length: 16 })
  hours: string;

  @Column({ name: 'task_type', type: 'varchar', length: 64, default: '-' })
  taskType: string;

  @Column({ type: 'date' })
  date: string;
}
