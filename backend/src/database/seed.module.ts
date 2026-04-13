import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionEntity } from '../entities/permission.entity';
import { RoleEntity } from '../entities/role.entity';
import { RolePermissionEntity } from '../entities/role-permission.entity';
import { UserEntity } from '../entities/user.entity';
import { UserPermissionEntity } from '../entities/user-permission.entity';
import { ProjectEntity } from '../entities/project.entity';
import { WorkEntryEntity } from '../entities/work-entry.entity';
import { BatchEntity } from '../entities/batch.entity';
import { SeedService } from './seed.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PermissionEntity,
      RoleEntity,
      RolePermissionEntity,
      UserEntity,
      UserPermissionEntity,
      ProjectEntity,
      WorkEntryEntity,
      BatchEntity,
    ]),
  ],
  providers: [SeedService],
  exports: [SeedService],
})
export class SeedModule {}
