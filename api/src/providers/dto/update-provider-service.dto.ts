import { PartialType } from '@nestjs/mapped-types';
import { CreateProviderServiceDto } from './create-service.dto';

export class UpdateProviderServiceDto extends PartialType(CreateProviderServiceDto) { }