import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateWorkEntryDto } from './create-work-entry.dto';

/** PATCH: cannot change owning userId. */
export class UpdateWorkEntryDto extends PartialType(
  OmitType(CreateWorkEntryDto, ['userId'] as const),
) {}
