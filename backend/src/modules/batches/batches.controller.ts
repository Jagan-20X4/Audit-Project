import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BatchesService } from './batches.service';
import { CreateBatchDto } from './dto/create-batch.dto';
import { UpdateBatchStatusDto } from './dto/update-batch-status.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('masters/batches')
@UseGuards(JwtAuthGuard)
export class BatchesController {
  constructor(private readonly batchesService: BatchesService) {}

  @Get()
  search(
    @Query('take') takeStr?: string,
    @Query('skip') skipStr?: string,
  ) {
    const take = Math.min(100, Math.max(1, parseInt(takeStr ?? '10', 10) || 10));
    const skip = Math.max(0, parseInt(skipStr ?? '0', 10) || 0);
    return this.batchesService.search(take, skip);
  }

  @Get('status-counting')
  statusCounting() {
    return this.batchesService.statusCounting();
  }

  @Post()
  create(@Body() dto: CreateBatchDto) {
    return this.batchesService.create(dto);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: CreateBatchDto) {
    return this.batchesService.update(id, dto);
  }

  @Patch('status/:id')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateBatchStatusDto,
  ) {
    return this.batchesService.updateStatus(id, dto.status);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.batchesService.remove(id);
  }
}
