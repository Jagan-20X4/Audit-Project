import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { RolePermissionEntity } from './role-permission.entity';
import { UserPermissionEntity } from './user-permission.entity';

@Entity('permissions')
export class PermissionEntity {
  /** PostgreSQL SERIAL (auto-increment integer PK). */
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ type: 'varchar', length: 64, unique: true })
  code: string;

  @OneToMany(() => RolePermissionEntity, (rp) => rp.permission)
  rolePermissions: RolePermissionEntity[];

  @OneToMany(() => UserPermissionEntity, (up) => up.permission)
  userPermissions: UserPermissionEntity[];
}
