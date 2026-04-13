import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionEntity } from './entities/permission.entity';
import { RoleEntity } from './entities/role.entity';
import { RolePermissionEntity } from './entities/role-permission.entity';
import { UserEntity } from './entities/user.entity';
import { UserPermissionEntity } from './entities/user-permission.entity';
import { ProjectEntity } from './entities/project.entity';
import { WorkEntryEntity } from './entities/work-entry.entity';
import { BatchEntity } from './entities/batch.entity';
import { UsersModule } from './modules/users/users.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { WorkEntriesModule } from './modules/work-entries/work-entries.module';
import { BatchesModule } from './modules/batches/batches.module';
import { SeedModule } from './database/seed.module';
import { AuthModule } from './modules/auth/auth.module';

const useDbSsl = process.env.DB_SSL === 'true' || process.env.DB_SSL === '1';

function dbHost() {
  return process.env.DB_HOST ?? process.env.PG_HOST ?? 'localhost';
}
function dbPort() {
  return parseInt(
    process.env.DB_PORT ?? process.env.PG_PORT ?? '5432',
    10,
  );
}
function dbUser() {
  return process.env.DB_USER ?? process.env.PG_USER ?? 'postgres';
}
function dbPassword() {
  return process.env.DB_PASSWORD ?? process.env.PG_PASSWORD ?? 'postgres';
}
function dbName() {
  return process.env.DB_NAME ?? process.env.PG_DATABASE ?? 'audit_db';
}

@Module({
  imports: [
    TypeOrmModule.forRoot({
      // Relations use join tables (role_permissions, user_permissions), not JSONB columns.
      type: 'postgres',
      host: dbHost(),
      port: dbPort(),
      username: dbUser(),
      password: dbPassword(),
      database: dbName(),
      ssl: useDbSsl
        ? {
            rejectUnauthorized:
              process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false',
          }
        : false,
      entities: [
        PermissionEntity,
        RoleEntity,
        RolePermissionEntity,
        UserEntity,
        UserPermissionEntity,
        ProjectEntity,
        WorkEntryEntity,
        BatchEntity,
      ],
      synchronize: process.env.TYPEORM_SYNC !== 'false',
      logging: process.env.TYPEORM_LOGGING === 'true',
    }),
    SeedModule,
    AuthModule,
    UsersModule,
    ProjectsModule,
    WorkEntriesModule,
    BatchesModule,
  ],
})
export class AppModule {}
