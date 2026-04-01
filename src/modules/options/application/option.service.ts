import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { OptionEntity } from '../domain/option.entity';
import type {
  IOptionQueryRepository,
  IOptionCommandRepository,
} from './interfaces/option-repository.interface';
import {
  OPTION_QUERY_REPOSITORY,
  OPTION_COMMAND_REPOSITORY,
} from './interfaces/option-repository.interface';
import type {
  IOptionValueQueryRepository,
  IOptionValueCommandRepository,
} from './interfaces/option-value-repository.interface';
import {
  OPTION_VALUE_QUERY_REPOSITORY,
  OPTION_VALUE_COMMAND_REPOSITORY,
} from './interfaces/option-value-repository.interface';
import { CreateOptionDto } from './dto/create-option.dto';
import { UpdateOptionDto } from './dto/update-option.dto';
import { CreateOptionValueDto } from './dto/create-option-value.dto';
import { UpdateOptionValueDto } from './dto/update-option-value.dto';

@Injectable()
export class OptionService {
  constructor(
    @Inject(OPTION_QUERY_REPOSITORY)
    private readonly optionQueryRepository: IOptionQueryRepository,
    @Inject(OPTION_COMMAND_REPOSITORY)
    private readonly optionCommandRepository: IOptionCommandRepository,
    @Inject(OPTION_VALUE_QUERY_REPOSITORY)
    private readonly valueQueryRepository: IOptionValueQueryRepository,
    @Inject(OPTION_VALUE_COMMAND_REPOSITORY)
    private readonly valueCommandRepository: IOptionValueCommandRepository,
  ) {}

  async findAll() {
    const options = await this.optionQueryRepository.findAll();
    return { options };
  }

  async findById(optionId: number) {
    const option = await this.optionQueryRepository.findById(optionId);
    if (!option) {
      throw new NotFoundException(`Option ${optionId} not found`);
    }
    return { option };
  }

  async createOption(dto: CreateOptionDto) {
    const values = dto.values as unknown as OptionEntity['values'];
    const option = await this.optionCommandRepository.save({
      name: dto.name,
      values,
    });
    return { option };
  }

  async updateOption(optionId: number, dto: UpdateOptionDto) {
    const { option: existing } = await this.findById(optionId);

    if (dto.name) {
      await this.optionCommandRepository.update(optionId, { name: dto.name });
    }

    if (dto.values) {
      await this.syncValues(existing, dto.values);
    }

    const option = await this.optionQueryRepository.findById(optionId);
    return { option };
  }

  private async syncValues(
    existing: OptionEntity,
    incomingValues: CreateOptionValueDto[],
  ) {
    const existingIds = existing.values.map((v) => Number(v.id));
    const incomingIds = incomingValues
      .filter((v) => v.id)
      .map((v) => Number(v.id));
    const idsToRemove = existingIds.filter((id) => !incomingIds.includes(id));

    await this.valueCommandRepository.softRemoveByIds(idsToRemove);
    for (const v of incomingValues) {
      if (v.id) {
        await this.valueCommandRepository.update(Number(v.id), {
          value: v.value,
          imageUrl: v.imageUrl,
        });
        continue;
      }
      await this.valueCommandRepository.save({
        value: v.value,
        imageUrl: v.imageUrl,
        optionId: Number(existing.id),
      });
    }
  }

  async removeOption(optionId: number) {
    const { option } = await this.findById(optionId);
    await this.optionCommandRepository.remove(optionId);
    return { option };
  }

  async createValue(optionId: number, dto: CreateOptionValueDto) {
    await this.findById(optionId);
    const value = await this.valueCommandRepository.save({
      optionId,
      ...dto,
    });
    return { value };
  }

  async findValueById(valueId: number) {
    const value = await this.valueQueryRepository.findById(valueId);
    if (!value) {
      throw new NotFoundException(`Option value ${valueId} not found`);
    }
    return { value };
  }

  async updateValue(valueId: number, dto: UpdateOptionValueDto) {
    await this.findValueById(valueId);
    const value = await this.valueCommandRepository.update(valueId, dto);
    return { value };
  }

  async removeValue(valueId: number) {
    const { value } = await this.findValueById(valueId);
    await this.valueCommandRepository.remove(valueId);
    return { value };
  }
}
