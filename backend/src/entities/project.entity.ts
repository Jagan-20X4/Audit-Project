import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { WorkEntryEntity } from './work-entry.entity';

@Entity('projects')
export class ProjectEntity {
  /** PostgreSQL SERIAL (auto-increment integer PK). */
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', default: '' })
  description: string;

  @OneToMany(() => WorkEntryEntity, (w) => w.project)
  workEntries: WorkEntryEntity[];
}
