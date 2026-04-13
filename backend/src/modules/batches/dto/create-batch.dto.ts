import { IsBoolean, IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class CreateBatchDto {
  @IsOptional()
  @IsInt()
  id?: number;

  @IsString()
  @MinLength(1)
  name: string;

  @IsString()
  @MinLength(1)
  code: string;

  @IsInt()
  @Min(1)
  duration: number;

  @IsOptional()
  @IsBoolean()
  status?: boolean;
}
