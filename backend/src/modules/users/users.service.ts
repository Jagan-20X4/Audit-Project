import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { UserEntity } from '../../entities/user.entity';
import { RoleEntity } from '../../entities/role.entity';
import { PermissionEntity } from '../../entities/permission.entity';
import { RolePermissionEntity } from '../../entities/role-permission.entity';
import { UserPermissionEntity } from '../../entities/user-permission.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

export interface UserResponse {
  id: number;
  name: string;
  email: string;
  department: string;
  role: string;
  permissions: string[];
  status: string;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(RoleEntity)
    private readonly roleRepo: Repository<RoleEntity>,
    @InjectRepository(PermissionEntity)
    private readonly permRepo: Repository<PermissionEntity>,
    @InjectRepository(RolePermissionEntity)
    private readonly rolePermRepo: Repository<RolePermissionEntity>,
    @InjectRepository(UserPermissionEntity)
    private readonly userPermRepo: Repository<UserPermissionEntity>,
  ) {}

  async findAll(): Promise<UserResponse[]> {
    const users = await this.userRepo.find({
      order: { id: 'ASC' },
      relations: ['role'],
    });
    const result: UserResponse[] = [];
    for (const u of users) {
      result.push(await this.toResponse(u));
    }
    return result;
  }

  async findOne(id: number): Promise<UserResponse> {
    const u = await this.userRepo.findOne({
      where: { id },
      relations: ['role'],
    });
    if (!u) throw new NotFoundException(`User ${id} not found`);
    return this.toResponse(u);
  }

  async create(dto: CreateUserDto): Promise<UserResponse> {
    const role = await this.resolveRole(dto.roleId, dto.roleName);
    const dup = await this.userRepo.findOne({ where: { email: dto.email } });
    if (dup) throw new BadRequestException('Email already exists');

    const rawPassword =
      dto.password ?? process.env.DEFAULT_USER_PASSWORD ?? 'ChangeMe@123';
    const passwordHash = await bcrypt.hash(rawPassword, 10);
    const user = await this.userRepo.save(
      this.userRepo.create({
        name: dto.name,
        email: dto.email,
        passwordHash,
        department: dto.department,
        roleId: role.id,
        status: dto.status ?? 'active',
      }),
    );

    if (dto.permissionCodes?.length) {
      await this.setFullUserPermissions(user.id, dto.permissionCodes);
    } else {
      await this.copyRolePermissionsToUser(user.id, role.id);
    }

    const reloaded = await this.userRepo.findOne({
      where: { id: user.id },
      relations: ['role'],
    });
    return this.toResponse(reloaded!);
  }

  async update(id: number, dto: UpdateUserDto): Promise<UserResponse> {
    const u = await this.userRepo.findOne({ where: { id } });
    if (!u) throw new NotFoundException(`User ${id} not found`);

    if (dto.email && dto.email !== u.email) {
      const dup = await this.userRepo.findOne({ where: { email: dto.email } });
      if (dup) throw new BadRequestException('Email already exists');
    }

    let roleId = u.roleId;
    if (dto.roleId != null || dto.roleName) {
      const role = await this.resolveRole(dto.roleId, dto.roleName);
      roleId = role.id;
    }

    const pw = dto.password?.trim();
    const passwordHash =
      pw && pw.length > 0 ? await bcrypt.hash(pw, 10) : undefined;

    await this.userRepo.update(id, {
      ...(dto.name != null && { name: dto.name }),
      ...(dto.email != null && { email: dto.email }),
      ...(dto.department != null && { department: dto.department }),
      roleId,
      ...(dto.status != null && { status: dto.status }),
      ...(passwordHash != null && { passwordHash }),
    });

    if (dto.permissionCodes) {
      await this.setFullUserPermissions(id, dto.permissionCodes);
    } else if (roleId !== u.roleId) {
      await this.copyRolePermissionsToUser(id, roleId);
    }

    const reloaded = await this.userRepo.findOne({
      where: { id },
      relations: ['role'],
    });
    return this.toResponse(reloaded!);
  }

  async remove(id: number): Promise<void> {
    const r = await this.userRepo.delete(id);
    if (!r.affected) throw new NotFoundException(`User ${id} not found`);
  }

  private async resolveRole(
    roleId?: number,
    roleName?: string,
  ): Promise<RoleEntity> {
    if (roleId != null) {
      const r = await this.roleRepo.findOne({ where: { id: roleId } });
      if (!r) throw new BadRequestException('Invalid roleId');
      return r;
    }
    if (roleName) {
      const r = await this.roleRepo.findOne({ where: { name: roleName } });
      if (!r) throw new BadRequestException('Invalid role name');
      return r;
    }
    throw new BadRequestException('roleId or roleName required');
  }

  private async copyRolePermissionsToUser(
    userId: number,
    roleId: number,
  ): Promise<void> {
    await this.userPermRepo.delete({ userId });
    const roleRows = await this.rolePermRepo.find({
      where: { roleId },
      relations: ['permission'],
    });
    for (const r of roleRows) {
      if (!r.permissionId) continue;
      await this.userPermRepo.save(
        this.userPermRepo.create({
          userId,
          permissionId: r.permissionId,
        }),
      );
    }
  }

  private async setFullUserPermissions(
    userId: number,
    codes: string[],
  ): Promise<void> {
    await this.userPermRepo.delete({ userId });
    if (!codes.length) return;
    const perms = await this.permRepo.find({
      where: { code: In(codes) },
    });
    for (const p of perms) {
      await this.userPermRepo.save(
        this.userPermRepo.create({ userId, permissionId: p.id }),
      );
    }
  }

  private async permissionCodesForUser(userId: number, roleId: number) {
    const userRows = await this.userPermRepo.find({
      where: { userId },
      relations: ['permission'],
    });
    if (userRows.length > 0) {
      const codes = new Set<string>();
      for (const r of userRows) {
        if (r.permission) codes.add(r.permission.code);
      }
      return [...codes].sort();
    }
    const roleRows = await this.rolePermRepo.find({
      where: { roleId },
      relations: ['permission'],
    });
    const codes = new Set<string>();
    for (const r of roleRows) {
      if (r.permission) codes.add(r.permission.code);
    }
    return [...codes].sort();
  }

  private async toResponse(u: UserEntity): Promise<UserResponse> {
    const role =
      u.role ?? (await this.roleRepo.findOne({ where: { id: u.roleId } }));
    const permissions = await this.permissionCodesForUser(u.id, u.roleId);
    return {
      id: u.id,
      name: u.name,
      email: u.email,
      department: u.department,
      role: role?.name ?? '',
      permissions,
      status: u.status,
    };
  }
}
