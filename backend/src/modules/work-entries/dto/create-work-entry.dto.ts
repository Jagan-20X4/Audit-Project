import { IsDateString, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateWorkEntryDto {
  @IsInt()
  @Min(1)
  userId: number;

  @IsInt()
  @Min(1)
  projectId: number;

  @IsOptional()
  @IsString()
  taskNo?: string;

  @IsOptional()
  @IsString()
  taskTitle?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  hours: string;

  @IsOptional()
  @IsString()
  taskType?: string;

  @IsDateString()
  date: string;
}
