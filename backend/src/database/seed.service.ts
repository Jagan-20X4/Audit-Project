import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PermissionEntity } from '../entities/permission.entity';
import { RoleEntity } from '../entities/role.entity';
import { RolePermissionEntity } from '../entities/role-permission.entity';
import { UserEntity } from '../entities/user.entity';
import { UserPermissionEntity } from '../entities/user-permission.entity';
import { ProjectEntity } from '../entities/project.entity';
import { WorkEntryEntity } from '../entities/work-entry.entity';
import { BatchEntity } from '../entities/batch.entity';
import * as bcrypt from 'bcryptjs';

const PERMISSION_CODES = [
  'view',
  'create',
  'edit',
  'delete',
  'approve',
  'reports',
  'manage',
] as const;

const ROLE_DEFAULTS: Record<string, string[]> = {
  Admin: ['view', 'create', 'edit', 'delete', 'approve', 'reports', 'manage'],
  Manager: ['view', 'create', 'edit', 'approve', 'reports'],
  'Team Lead': ['view', 'create', 'edit', 'approve'],
  Employee: ['view', 'create', 'edit'],
  Viewer: ['view'],
};

/** Seed/demo logins; used only when FORCE_SEED_EMAIL_PASSWORDS=true. */
const SEED_LOGIN_EMAILS = [
  'rajesh@company.com',
  'priya@company.com',
  'amit@company.com',
  'neha@company.com',
  'vikram@company.com',
  'brijesh@company.com',
] as const;

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(
    @InjectRepository(PermissionEntity)
    private readonly permRepo: Repository<PermissionEntity>,
    @InjectRepository(RoleEntity)
    private readonly roleRepo: Repository<RoleEntity>,
    @InjectRepository(RolePermissionEntity)
    private readonly rolePermRepo: Repository<RolePermissionEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(UserPermissionEntity)
    private readonly userPermRepo: Repository<UserPermissionEntity>,
    @InjectRepository(ProjectEntity)
    private readonly projectRepo: Repository<ProjectEntity>,
    @InjectRepository(WorkEntryEntity)
    private readonly workRepo: Repository<WorkEntryEntity>,
    @InjectRepository(BatchEntity)
    private readonly batchRepo: Repository<BatchEntity>,
  ) {}

  async onModuleInit() {
    if (process.env.RUN_SEED === 'false') return;

    /** Safe for prod: only sets password when hash is missing (e.g. pre-auth DB rows). */
    await this.backfillMissingPasswordHashes();
    /** Dev escape hatch: overwrites password for seed emails (set only when needed). */
    await this.forceSeedEmailPasswordsIfRequested();

    const count = await this.roleRepo.count();
    if (count > 0) {
      await this.ensureBrijeshIfMissing();
      return;
    }

    const perms = await this.ensurePermissions();
    const roles = await this.ensureRoles();
    await this.linkRolePermissions(perms, roles);
    await this.ensureProjects();
    await this.ensureUsers(roles, perms);
    await this.ensureWorkEntries();
    await this.ensureBatches();
  }

  private getDefaultSeedPassword(): string {
    return (
      process.env.DEFAULT_USER_PASSWORD ??
      process.env.SEED_DEFAULT_PASSWORD ??
      'Password@123'
    );
  }

  /**
   * Users created before `password_hash` existed (or imported rows) get a usable login.
   * Does not overwrite non-empty hashes.
   */
  private async backfillMissingPasswordHashes(): Promise<void> {
    if (process.env.SKIP_PASSWORD_BACKFILL === 'true') return;

    const hash = await bcrypt.hash(this.getDefaultSeedPassword(), 10);
    await this.userRepo
      .createQueryBuilder()
      .update(UserEntity)
      .set({ passwordHash: hash })
      .where('(password_hash IS NULL OR password_hash = :empty)', { empty: '' })
      .execute();
  }

  /**
   * When FORCE_SEED_EMAIL_PASSWORDS=true, sets password for known seed addresses
   * to DEFAULT_USER_PASSWORD / SEED_DEFAULT_PASSWORD / Password@123.
   * Do not enable in shared production.
   */
  private async forceSeedEmailPasswordsIfRequested(): Promise<void> {
    if (process.env.FORCE_SEED_EMAIL_PASSWORDS !== 'true') return;

    const hash = await bcrypt.hash(this.getDefaultSeedPassword(), 10);
    await this.userRepo
      .createQueryBuilder()
      .update(UserEntity)
      .set({ passwordHash: hash })
      .where('email IN (:...emails)', { emails: [...SEED_LOGIN_EMAILS] })
      .execute();
  }

  /** When roles already exist, full seed is skipped; still create Brijesh if absent. */
  private async ensureBrijeshIfMissing(): Promise<void> {
    const emp = await this.roleRepo.findOne({ where: { name: 'Employee' } });
    if (!emp) return;

    const existing = await this.userRepo.findOne({
      where: { email: 'brijesh@company.com' },
    });
    if (existing) return;

    const defaultPwHash = await bcrypt.hash(this.getDefaultSeedPassword(), 10);
    const brijesh = await this.userRepo.save(
      this.userRepo.create({
        name: 'Patoliya Brijesh',
        email: 'brijesh@company.com',
        department: 'Development',
        roleId: emp.id,
        status: 'active',
        passwordHash: defaultPwHash,
      }),
    );
    await this.syncUserPermsFromRole(brijesh.id, emp.id);
  }

  private async ensurePermissions(): Promise<Map<string, PermissionEntity>> {
    const map = new Map<string, PermissionEntity>();
    for (const code of PERMISSION_CODES) {
      let p = await this.permRepo.findOne({ where: { code } });
      if (!p) {
        p = await this.permRepo.save(this.permRepo.create({ code }));
      }
      map.set(code, p);
    }
    return map;
  }

  private async ensureRoles(): Promise<Map<string, RoleEntity>> {
    const names = Object.keys(ROLE_DEFAULTS);
    const map = new Map<string, RoleEntity>();
    for (const name of names) {
      let r = await this.roleRepo.findOne({ where: { name } });
      if (!r) {
        r = await this.roleRepo.save(this.roleRepo.create({ name }));
      }
      map.set(name, r);
    }
    return map;
  }

  private async linkRolePermissions(
    perms: Map<string, PermissionEntity>,
    roles: Map<string, RoleEntity>,
  ) {
    for (const [roleName, codes] of Object.entries(ROLE_DEFAULTS)) {
      const role = roles.get(roleName);
      if (!role) continue;
      for (const code of codes) {
        const p = perms.get(code);
        if (!p) continue;
        const exists = await this.rolePermRepo.findOne({
          where: { roleId: role.id, permissionId: p.id },
        });
        if (!exists) {
          await this.rolePermRepo.save(
            this.rolePermRepo.create({
              roleId: role.id,
              permissionId: p.id,
            }),
          );
        }
      }
    }
  }

  private async ensureProjects() {
    const names = [
      'Bench',
      'Boilerplate - SaaS',
      'Happy Flow',
      'HR Activities',
      'Miscellaneous',
      'Sales Crawler',
      'Work Time',
      'Office Time',
    ];
    for (const name of names) {
      const exists = await this.projectRepo.findOne({ where: { name } });
      if (!exists) {
        await this.projectRepo.save(this.projectRepo.create({ name }));
      }
    }
  }

  private async ensureUsers(
    roles: Map<string, RoleEntity>,
    perms: Map<string, PermissionEntity>,
  ) {
    const defaultPw =
      process.env.DEFAULT_USER_PASSWORD ?? process.env.SEED_DEFAULT_PASSWORD ?? 'Password@123';
    const defaultPwHash = await bcrypt.hash(defaultPw, 10);
    const samples = [
      {
        name: 'Rajesh Kumar',
        email: 'rajesh@company.com',
        department: 'IT',
        roleName: 'Admin' as const,
        status: 'active' as const,
        extraPerms: [] as string[],
      },
      {
        name: 'Priya Sharma',
        email: 'priya@company.com',
        department: 'HR',
        roleName: 'Manager' as const,
        status: 'active' as const,
        extraPerms: [] as string[],
      },
      {
        name: 'Amit Patel',
        email: 'amit@company.com',
        department: 'Development',
        roleName: 'Employee' as const,
        status: 'active' as const,
        extraPerms: [] as string[],
      },
      {
        name: 'Neha Singh',
        email: 'neha@company.com',
        department: 'Development',
        roleName: 'Employee' as const,
        status: 'inactive' as const,
        extraPerms: [] as string[],
      },
      {
        name: 'Vikram Joshi',
        email: 'vikram@company.com',
        department: 'Development',
        roleName: 'Team Lead' as const,
        status: 'active' as const,
        extraPerms: ['manage'] as string[],
      },
    ];

    for (const s of samples) {
      let u = await this.userRepo.findOne({ where: { email: s.email } });
      const role = roles.get(s.roleName);
      if (!role) continue;
      if (!u) {
        u = await this.userRepo.save(
          this.userRepo.create({
            name: s.name,
            email: s.email,
            department: s.department,
            roleId: role.id,
            status: s.status,
            passwordHash: defaultPwHash,
          }),
        );
      }
      await this.syncUserPermsFromRole(u.id, role.id);
      for (const code of s.extraPerms) {
        const p = perms.get(code);
        if (!p) continue;
        const exists = await this.userPermRepo.findOne({
          where: { userId: u.id, permissionId: p.id },
        });
        if (!exists) {
          await this.userPermRepo.save(
            this.userPermRepo.create({
              userId: u.id,
              permissionId: p.id,
            }),
          );
        }
      }
    }

    let brijesh = await this.userRepo.findOne({
      where: { email: 'brijesh@company.com' },
    });
    const emp = roles.get('Employee');
    if (!brijesh && emp) {
      brijesh = await this.userRepo.save(
        this.userRepo.create({
          name: 'Patoliya Brijesh',
          email: 'brijesh@company.com',
          department: 'Development',
          roleId: emp.id,
          status: 'active',
          passwordHash: defaultPwHash,
        }),
      );
    }
    if (brijesh && emp) {
      await this.syncUserPermsFromRole(brijesh.id, emp.id);
    }
  }

  private async syncUserPermsFromRole(userId: number, roleId: number) {
    await this.userPermRepo.delete({ userId });
    const rps = await this.rolePermRepo.find({ where: { roleId } });
    for (const rp of rps) {
      await this.userPermRepo.save(
        this.userPermRepo.create({
          userId,
          permissionId: rp.permissionId,
        }),
      );
    }
  }

  private async ensureWorkEntries() {
    const brijesh = await this.userRepo.findOne({
      where: { email: 'brijesh@company.com' },
    });
    if (!brijesh) return;
    const existing = await this.workRepo.count({ where: { userId: brijesh.id } });
    if (existing > 0) return;

    const happyFlow = await this.projectRepo.findOne({
      where: { name: 'Happy Flow' },
    });
    if (!happyFlow) return;

    const rows = [
      {
        taskNo: '-',
        taskTitle: 'Meeting',
        description: 'Standup Meeting Discussion',
        hours: '0:12',
        taskType: '-',
        date: '2026-04-06',
      },
      {
        taskNo: '-',
        taskTitle: 'General Testing',
        description: 'Work: - Faced typescript issues',
        hours: '0:30',
        taskType: '-',
        date: '2026-04-06',
      },
      {
        taskNo: '253',
        taskTitle: '',
        description: 'Implement UI for Tracking',
        hours: '4:30',
        taskType: 'FEATURE',
        date: '2026-04-06',
      },
      {
        taskNo: '253',
        taskTitle: '',
        description: 'Implement UI for Tracking',
        hours: '3:12',
        taskType: 'FEATURE',
        date: '2026-04-06',
      },
    ];

    for (const r of rows) {
      await this.workRepo.save(
        this.workRepo.create({
          userId: brijesh.id,
          projectId: happyFlow.id,
          taskNo: r.taskNo,
          taskTitle: r.taskTitle,
          description: r.description,
          hours: r.hours,
          taskType: r.taskType,
          date: r.date,
        }),
      );
    }
  }

  private async ensureBatches() {
    const n = await this.batchRepo.count();
    if (n > 0) return;
    await this.batchRepo.save([
      this.batchRepo.create({
        name: 'Spring 2026',
        code: 'SP26',
        duration: 6,
        status: true,
      }),
      this.batchRepo.create({
        name: 'Fall 2026',
        code: 'FA26',
        duration: 6,
        status: true,
      }),
    ]);
  }
}
