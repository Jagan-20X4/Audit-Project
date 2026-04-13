import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkEntryEntity } from '../../entities/work-entry.entity';
import { WorkEntriesService } from './work-entries.service';
import { WorkEntriesController } from './work-entries.controller';

@Module({
  imports: [TypeOrmModule.forFeature([WorkEntryEntity])],
  controllers: [WorkEntriesController],
  providers: [WorkEntriesService],
})
export class WorkEntriesModule {}
