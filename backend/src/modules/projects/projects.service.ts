import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProjectEntity } from '../../entities/project.entity';
import { CreateProjectDto } from './dto/create-project.dto';

export interface PaginationMeta {
  take: number;
  itemCount: number;
  pageCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(ProjectEntity)
    private readonly projectRepo: Repository<ProjectEntity>,
  ) {}

  findAll() {
    return this.projectRepo.find({ order: { id: 'ASC' } });
  }

  async search(take = 10, skip = 0) {
    const [rows, itemCount] = await this.projectRepo.findAndCount({
      order: { id: 'ASC' },
      take,
      skip,
    });
    const pageCount = Math.max(1, Math.ceil(itemCount / take));
    const page = Math.floor(skip / take);
    const meta: PaginationMeta = {
      take,
      itemCount,
      pageCount,
      hasPreviousPage: page > 0,
      hasNextPage: skip + rows.length < itemCount,
    };
    return { data: { rows, meta }, message: 'OK', error: false };
  }

  async create(dto: CreateProjectDto) {
    const p = await this.projectRepo.save(
      this.projectRepo.create({
        name: dto.name,
        description: dto.description ?? '',
      }),
    );
    return { data: p, message: 'Created', error: false };
  }

  async update(id: number, dto: CreateProjectDto) {
    const existing = await this.projectRepo.findOne({ where: { id } });
    if (!existing) throw new NotFoundException(`Project ${id} not found`);
    await this.projectRepo.update(id, {
      name: dto.name,
      description: dto.description ?? '',
    });
    const p = await this.projectRepo.findOne({ where: { id } });
    return { data: p, message: 'Updated', error: false };
  }

  async remove(id: number) {
    const r = await this.projectRepo.delete(id);
    if (!r.affected) throw new NotFoundException(`Project ${id} not found`);
    return { data: null, message: 'Deleted', error: false };
  }
}
