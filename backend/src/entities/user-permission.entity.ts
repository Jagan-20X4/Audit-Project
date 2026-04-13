import {
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Column,
  Unique,
} from 'typeorm';
import { UserEntity } from './user.entity';
import { PermissionEntity } from './permission.entity';

/** Pivot: user-specific permission grants (extends role defaults). */
@Entity('user_permissions')
@Unique(['userId', 'permissionId'])
export class UserPermissionEntity {
  /** PostgreSQL SERIAL (auto-increment integer PK). */
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'permission_id' })
  permissionId: number;

  @ManyToOne(() => UserEntity, (u) => u.userPermissions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @ManyToOne(() => PermissionEntity, (p) => p.userPermissions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'permission_id' })
  permission: PermissionEntity;
}
