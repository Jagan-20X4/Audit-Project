import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BatchEntity } from '../../entities/batch.entity';
import { CreateBatchDto } from './dto/create-batch.dto';

export interface PaginationMeta {
  take: number;
  itemCount: number;
  pageCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

@Injectable()
export class BatchesService {
  constructor(
    @InjectRepository(BatchEntity)
    private readonly repo: Repository<BatchEntity>,
  ) {}

  async search(take = 10, skip = 0) {
    const [rows, itemCount] = await this.repo.findAndCount({
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
    return {
      data: { rows, meta },
      message: 'OK',
      error: false,
    };
  }

  async statusCounting() {
    const active = await this.repo.count({ where: { status: true } });
    const inactive = await this.repo.count({ where: { status: false } });
    return {
      data: { active, inactive },
      message: 'OK',
      error: false,
    };
  }

  async create(dto: CreateBatchDto) {
    const b = await this.repo.save(
      this.repo.create({
        name: dto.name,
        code: dto.code,
        duration: dto.duration,
        status: dto.status ?? true,
      }),
    );
    return { data: b, message: 'Created', error: false };
  }

  async update(id: number, dto: CreateBatchDto) {
    const existing = await this.repo.findOne({ where: { id } });
    if (!existing) throw new NotFoundException(`Batch ${id} not found`);
    await this.repo.update(id, {
      name: dto.name,
      code: dto.code,
      duration: dto.duration,
      ...(dto.status != null && { status: dto.status }),
    });
    const b = await this.repo.findOne({ where: { id } });
    return { data: b, message: 'Updated', error: false };
  }

  async updateStatus(id: number, status: boolean) {
    const existing = await this.repo.findOne({ where: { id } });
    if (!existing) throw new NotFoundException(`Batch ${id} not found`);
    await this.repo.update(id, { status });
    const b = await this.repo.findOne({ where: { id } });
    return { data: b, message: 'Status updated', error: false };
  }

  async remove(id: number) {
    const r = await this.repo.delete(id);
    if (!r.affected) throw new NotFoundException(`Batch ${id} not found`);
    return { data: null, message: 'Deleted', error: false };
  }
}
