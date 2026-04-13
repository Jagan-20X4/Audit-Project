import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('batches')
export class BatchEntity {
  /** PostgreSQL SERIAL (auto-increment integer PK). */
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 64, unique: true })
  code: string;

  @Column({ type: 'int' })
  duration: number;

  @Column({ type: 'boolean', default: true })
  status: boolean;
}
