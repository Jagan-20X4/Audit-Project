import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkEntryEntity } from '../../entities/work-entry.entity';
import { CreateWorkEntryDto } from './dto/create-work-entry.dto';
import { UpdateWorkEntryDto } from './dto/update-work-entry.dto';

export interface WorkEntryResponse {
  id: number;
  userId: number;
  user: string;
  projectId: number;
  taskNo: string;
  taskTitle: string;
  description: string;
  hours: string;
  taskType: string;
  date: string;
}

@Injectable()
export class WorkEntriesService {
  constructor(
    @InjectRepository(WorkEntryEntity)
    private readonly repo: Repository<WorkEntryEntity>,
  ) {}

  private formatDate(d: string | Date): string {
    if (typeof d === 'string') return d.slice(0, 10);
    return d.toISOString().slice(0, 10);
  }

  private toRow(e: WorkEntryEntity): WorkEntryResponse {
    return {
      id: e.id,
      userId: e.userId,
      user: e.user?.name ?? '',
      projectId: e.projectId,
      taskNo: e.taskNo,
      taskTitle: e.taskTitle,
      description: e.description,
      hours: e.hours,
      taskType: e.taskType,
      date: this.formatDate(e.date as unknown as string),
    };
  }

  async findAll(): Promise<WorkEntryResponse[]> {
    const rows = await this.repo.find({
      relations: ['user', 'project'],
      order: { id: 'DESC' },
    });
    return rows.map((e) => this.toRow(e));
  }

  async create(dto: CreateWorkEntryDto): Promise<WorkEntryResponse> {
    const saved = await this.repo.save(
      this.repo.create({
        userId: dto.userId,
        projectId: dto.projectId,
        taskNo: dto.taskNo ?? '-',
        taskTitle: dto.taskTitle ?? '',
        description: dto.description ?? '',
        hours: dto.hours,
        taskType: dto.taskType ?? '-',
        date: dto.date,
      }),
    );
    const full = await this.repo.findOne({
      where: { id: saved.id },
      relations: ['user', 'project'],
    });
    if (!full) throw new NotFoundException();
    return this.toRow(full);
  }

  async update(id: number, dto: UpdateWorkEntryDto): Promise<WorkEntryResponse> {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) throw new NotFoundException(`Work entry ${id} not found`);

    if (dto.projectId != null) row.projectId = dto.projectId;
    if (dto.taskNo != null) row.taskNo = dto.taskNo;
    if (dto.taskTitle != null) row.taskTitle = dto.taskTitle;
    if (dto.description != null) row.description = dto.description;
    if (dto.hours != null) row.hours = dto.hours;
    if (dto.taskType != null) row.taskType = dto.taskType;
    if (dto.date != null) (row as { date: string }).date = dto.date;

    await this.repo.save(row);
    const full = await this.repo.findOne({
      where: { id },
      relations: ['user', 'project'],
    });
    if (!full) throw new NotFoundException();
    return this.toRow(full);
  }
}
