import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { WorkEntriesService } from './work-entries.service';
import { CreateWorkEntryDto } from './dto/create-work-entry.dto';
import { UpdateWorkEntryDto } from './dto/update-work-entry.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('work-entries')
@UseGuards(JwtAuthGuard)
export class WorkEntriesController {
  constructor(private readonly workEntriesService: WorkEntriesService) {}

  @Get()
  findAll() {
    return this.workEntriesService.findAll();
  }

  @Post()
  create(@Body() dto: CreateWorkEntryDto) {
    return this.workEntriesService.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateWorkEntryDto,
  ) {
    return this.workEntriesService.update(id, dto);
  }
}
