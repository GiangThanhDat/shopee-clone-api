import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { OptionEntity } from '../domain/option.entity';
import type { IOptionRepository } from './interfaces/option-repository.interface';
import { OPTION_REPOSITORY } from './interfaces/option-repository.interface';
import type { IOptionValueRepository } from './interfaces/option-value-repository.interface';
import { OPTION_VALUE_REPOSITORY } from './interfaces/option-value-repository.interface';
import { CreateOptionDto } from './dto/create-option.dto';
import { UpdateOptionDto } from './dto/update-option.dto';
import { CreateOptionValueDto } from './dto/create-option-value.dto';
import { UpdateOptionValueDto } from './dto/update-option-value.dto';

@Injectable()
export class OptionService {
  constructor(
    @Inject(OPTION_REPOSITORY)
    private readonly optionRepository: IOptionRepository,
    @Inject(OPTION_VALUE_REPOSITORY)
    private readonly valueRepository: IOptionValueRepository,
  ) {}

  async findAll() {
    const options = await this.optionRepository.findAll();
    return { options };
  }

  async findById(optionId: number) {
    const option = await this.optionRepository.findById(optionId);
    if (!option) {
      throw new NotFoundException(`Option ${optionId} not found`);
    }
    return { option };
  }

  async createOption(dto: CreateOptionDto) {
    const values = dto.values as unknown as OptionEntity['values'];
    const option = await this.optionRepository.save({
      name: dto.name,
      values,
    });
    return { option };
  }

  async updateOption(optionId: number, dto: UpdateOptionDto) {
    const { option: existing } = await this.findById(optionId);

    if (dto.name) {
      await this.optionRepository.update(optionId, { name: dto.name });
    }

    if (dto.values) {
      await this.syncValues(existing, dto.values);
    }

    const option = await this.optionRepository.findById(optionId);
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

    await this.valueRepository.softRemoveByIds(idsToRemove);
    for (const v of incomingValues) {
      if (v.id) {
        await this.valueRepository.update(Number(v.id), {
          value: v.value,
          imageUrl: v.imageUrl,
        });
        continue;
      }
      await this.valueRepository.save({
        value: v.value,
        imageUrl: v.imageUrl,
        optionId: Number(existing.id),
      });
    }
  }

  async removeOption(optionId: number) {
    const { option } = await this.findById(optionId);
    await this.optionRepository.remove(optionId);
    return { option };
  }

  async createValue(optionId: number, dto: CreateOptionValueDto) {
    await this.findById(optionId);
    const value = await this.valueRepository.save({
      optionId,
      ...dto,
    });
    return { value };
  }

  async findValueById(valueId: number) {
    const value = await this.valueRepository.findById(valueId);
    if (!value) {
      throw new NotFoundException(`Option value ${valueId} not found`);
    }
    return { value };
  }

  async updateValue(valueId: number, dto: UpdateOptionValueDto) {
    await this.findValueById(valueId);
    const value = await this.valueRepository.update(valueId, dto);
    return { value };
  }

  async removeValue(valueId: number) {
    const { value } = await this.findValueById(valueId);
    await this.valueRepository.remove(valueId);
    return { value };
  }
}
