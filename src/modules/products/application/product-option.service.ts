import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { IProductOptionRepository } from './interfaces/product-option-repository.interface';
import { PRODUCT_OPTION_REPOSITORY } from './interfaces/product-option-repository.interface';
import type { IOptionValueRepository } from './interfaces/option-value-repository.interface';
import { OPTION_VALUE_REPOSITORY } from './interfaces/option-value-repository.interface';
import { CreateProductOptionDto } from './dto/create-product-option.dto';
import { UpdateProductOptionDto } from './dto/update-product-option.dto';
import { CreateOptionValueDto } from './dto/create-option-value.dto';
import { UpdateOptionValueDto } from './dto/update-option-value.dto';

@Injectable()
export class ProductOptionService {
  constructor(
    @Inject(PRODUCT_OPTION_REPOSITORY)
    private readonly optionRepository: IProductOptionRepository,
    @Inject(OPTION_VALUE_REPOSITORY)
    private readonly valueRepository: IOptionValueRepository,
  ) {}

  async findByProductId(productId: number) {
    const options = await this.optionRepository.findByProductId(productId);
    return { options };
  }

  async findById(optionId: number) {
    const option = await this.findOptionOrFail(optionId);
    return { option };
  }

  async createOption(productId: number, dto: CreateProductOptionDto) {
    const option = await this.optionRepository.save({
      productId,
      name: dto.name,
    });
    return { option };
  }

  async updateOption(optionId: number, dto: UpdateProductOptionDto) {
    const option = await this.optionRepository.update(optionId, dto);
    if (!option) {
      throw new NotFoundException(`Option ${optionId} not found`);
    }
    return { option };
  }

  async removeOption(optionId: number): Promise<void> {
    await this.findOptionOrFail(optionId);
    await this.optionRepository.remove(optionId);
  }

  async createValue(optionId: number, dto: CreateOptionValueDto) {
    await this.findOptionOrFail(optionId);
    const value = await this.valueRepository.save({
      productOptionId: optionId,
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
