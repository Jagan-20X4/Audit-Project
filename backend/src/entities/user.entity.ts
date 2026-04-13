import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { RoleEntity } from './role.entity';
import { UserPermissionEntity } from './user-permission.entity';
import { WorkEntryEntity } from './work-entry.entity';

export type UserStatus = 'active' | 'inactive';

@Entity('users')
export class UserEntity {
  /** PostgreSQL SERIAL (auto-increment integer PK). */
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  /**
   * Hashed password (bcrypt). Never return this in API responses.
   * `select: false` prevents accidental loading unless explicitly requested.
   */
  @Column({ name: 'password_hash', type: 'varchar', length: 255, select: false })
  passwordHash: string;

  @Column({ type: 'varchar', length: 128 })
  department: string;

  @Column({ name: 'role_id' })
  roleId: number;

  @ManyToOne(() => RoleEntity, (r) => r.users)
  @JoinColumn({ name: 'role_id' })
  role: RoleEntity;

  @Column({ type: 'varchar', length: 32, default: 'active' })
  status: UserStatus;

  @OneToMany(() => UserPermissionEntity, (up) => up.user, { cascade: true })
  userPermissions: UserPermissionEntity[];

  @OneToMany(() => WorkEntryEntity, (w) => w.user)
  workEntries: WorkEntryEntity[];
}
