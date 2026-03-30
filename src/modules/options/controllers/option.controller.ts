import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ErrorResponseDto } from '../../../common/dto/api-response.dto';
import { ResponseMessage } from '../../../common/decorators/response-message.decorator';
import { Public } from '../../../common/decorators/public.decorator';
import { OptionService } from '../application/option.service';
import { CreateOptionDto } from '../application/dto/create-option.dto';
import { UpdateOptionDto } from '../application/dto/update-option.dto';
import { CreateOptionValueDto } from '../application/dto/create-option-value.dto';
import { UpdateOptionValueDto } from '../application/dto/update-option-value.dto';
import {
  OptionDataDto,
  OptionListDataDto,
  OptionValueDataDto,
} from '../application/dto/option-response.dto';

@ApiTags('Options')
@ApiBearerAuth()
@Controller('options')
export class OptionController {
  constructor(private readonly optionService: OptionService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'List all options' })
  @ApiResponse({ status: 200, type: OptionListDataDto })
  @ResponseMessage('Options retrieved successfully')
  findAll() {
    return this.optionService.findAll();
  }

  @Get(':optionId')
  @Public()
  @ApiOperation({ summary: 'Get option detail' })
  @ApiResponse({ status: 200, type: OptionDataDto })
  @ApiResponse({ status: 404, type: ErrorResponseDto })
  @ResponseMessage('Option retrieved successfully')
  findOne(@Param('optionId', ParseIntPipe) optionId: number) {
    return this.optionService.findById(optionId);
  }

  @Post()
  @ApiOperation({ summary: 'Create option' })
  @ApiResponse({ status: 201, type: OptionDataDto })
  @ApiResponse({ status: 400, type: ErrorResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ResponseMessage('Option created successfully')
  create(@Body() dto: CreateOptionDto) {
    return this.optionService.createOption(dto);
  }

  @Patch(':optionId')
  @ApiOperation({ summary: 'Update option' })
  @ApiResponse({ status: 200, type: OptionDataDto })
  @ApiResponse({ status: 400, type: ErrorResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, type: ErrorResponseDto })
  @ResponseMessage('Option updated successfully')
  update(
    @Param('optionId', ParseIntPipe) optionId: number,
    @Body() dto: UpdateOptionDto,
  ) {
    return this.optionService.updateOption(optionId, dto);
  }

  @Delete(':optionId')
  @ApiOperation({ summary: 'Delete option' })
  @ApiResponse({ status: 200, type: OptionDataDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, type: ErrorResponseDto })
  @ResponseMessage('Option deleted successfully')
  remove(@Param('optionId', ParseIntPipe) optionId: number) {
    return this.optionService.removeOption(optionId);
  }

  @Post(':optionId/values')
  @ApiOperation({ summary: 'Add option value' })
  @ApiResponse({ status: 201, type: OptionValueDataDto })
  @ApiResponse({ status: 400, type: ErrorResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, type: ErrorResponseDto })
  @ResponseMessage('Option value created successfully')
  createValue(
    @Param('optionId', ParseIntPipe) optionId: number,
    @Body() dto: CreateOptionValueDto,
  ) {
    return this.optionService.createValue(optionId, dto);
  }

  @Patch(':optionId/values/:valueId')
  @ApiOperation({ summary: 'Update option value' })
  @ApiResponse({ status: 200, type: OptionValueDataDto })
  @ApiResponse({ status: 400, type: ErrorResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, type: ErrorResponseDto })
  @ResponseMessage('Option value updated successfully')
  updateValue(
    @Param('valueId', ParseIntPipe) valueId: number,
    @Body() dto: UpdateOptionValueDto,
  ) {
    return this.optionService.updateValue(valueId, dto);
  }

  @Delete(':optionId/values/:valueId')
  @ApiOperation({ summary: 'Delete option value' })
  @ApiResponse({ status: 200, type: OptionValueDataDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, type: ErrorResponseDto })
  @ResponseMessage('Option value deleted successfully')
  removeValue(@Param('valueId', ParseIntPipe) valueId: number) {
    return this.optionService.removeValue(valueId);
  }
}
