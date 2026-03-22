import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OptionEntity } from './domain/option.entity';
import { OptionValueEntity } from './domain/option-value.entity';
import { OPTION_REPOSITORY } from './application/interfaces/option-repository.interface';
import { OPTION_VALUE_REPOSITORY } from './application/interfaces/option-value-repository.interface';
import { OptionRepository } from './infrastructure/option.repository';
import { OptionValueRepository } from './infrastructure/option-value.repository';
import { OptionService } from './application/option.service';
import { OptionController } from './controllers/option.controller';

@Module({
  imports: [TypeOrmModule.forFeature([OptionEntity, OptionValueEntity])],
  controllers: [OptionController],
  providers: [
    { provide: OPTION_REPOSITORY, useClass: OptionRepository },
    { provide: OPTION_VALUE_REPOSITORY, useClass: OptionValueRepository },
    OptionService,
  ],
  exports: [TypeOrmModule, OPTION_VALUE_REPOSITORY],
})
export class OptionsModule {}
