import {
  Controller,
  Get,
  Post,
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
import { MediaService } from '../application/media.service';
import { CreateMediaDto } from '../application/dto/create-media.dto';
import {
  MediaSingleResponse,
  MediaListResponse,
} from '../application/dto/media-response.dto';

@ApiTags('Media')
@ApiBearerAuth()
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'List all media' })
  @ApiResponse({ status: 200, type: MediaListResponse })
  @ResponseMessage('Media retrieved successfully')
  findAll() {
    return this.mediaService.findAll();
  }

  @Get(':mediaId')
  @Public()
  @ApiOperation({ summary: 'Get media detail' })
  @ApiResponse({ status: 200, type: MediaSingleResponse })
  @ApiResponse({ status: 404, type: ErrorResponseDto })
  @ResponseMessage('Media retrieved successfully')
  findOne(@Param('mediaId', ParseIntPipe) mediaId: number) {
    return this.mediaService.findById(mediaId);
  }

  @Post()
  @ApiOperation({ summary: 'Upload media' })
  @ApiResponse({ status: 201, type: MediaSingleResponse })
  @ApiResponse({ status: 400, type: ErrorResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ResponseMessage('Media created successfully')
  create(@Body() dto: CreateMediaDto) {
    return this.mediaService.create(dto);
  }

  @Delete(':mediaId')
  @ApiOperation({ summary: 'Delete media' })
  @ApiResponse({ status: 200, type: MediaSingleResponse })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, type: ErrorResponseDto })
  @ResponseMessage('Media deleted successfully')
  remove(@Param('mediaId', ParseIntPipe) mediaId: number) {
    return this.mediaService.remove(mediaId);
  }
}
