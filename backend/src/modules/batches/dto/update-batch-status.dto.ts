import { IsBoolean, IsOptional, IsInt, Min } from 'class-validator';

export class UpdateBatchStatusDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  id?: number;

  @IsBoolean()
  status: boolean;
}
