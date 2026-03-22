import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { OptionEntity } from '../domain/option.entity';
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
    const option = await this.findOptionOrFail(optionId);
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
    await this.findOptionOrFail(optionId);
    const option = await this.optionRepository.update(optionId, {
      name: dto.name,
    });
    return { option };
  }

  async removeOption(optionId: number): Promise<void> {
    await this.findOptionOrFail(optionId);
    await this.optionRepository.remove(optionId);
  }

  async createValue(optionId: number, dto: CreateOptionValueDto) {
    await this.findOptionOrFail(optionId);
    const value = await this.valueRepository.save({
      optionId,
      ...dto,
    });
    return { value };
  }

  async updateValue(valueId: number, dto: UpdateOptionValueDto) {
    const value = await this.valueRepository.update(valueId, dto);
    if (!value) {
      throw new NotFoundException(`Option value ${valueId} not found`);
    }
    return { value };
  }

  async removeValue(valueId: number): Promise<void> {
    const value = await this.valueRepository.findById(valueId);
    if (!value) {
      throw new NotFoundException(`Option value ${valueId} not found`);
    }
    await this.valueRepository.remove(valueId);
  }

  private async findOptionOrFail(optionId: number) {
    const option = await this.optionRepository.findById(optionId);
    if (!option) {
      throw new NotFoundException(`Option ${optionId} not found`);
    }
    return option;
  }
}
