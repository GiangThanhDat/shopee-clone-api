import { Controller, Get, Patch, Body } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ErrorResponseDto } from '../../common/dto/api-response.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';
import { UserProfileService } from './application/user-profile.service';
import { UpdateProfileDto } from './application/dto/update-profile.dto';
import { UserProfileDataDto } from './application/dto/user-profile-response.dto';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UserProfileController {
  constructor(private readonly profileService: UserProfileService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'Profile retrieved successfully',
    type: UserProfileDataDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    type: ErrorResponseDto,
  })
  @ResponseMessage('Profile retrieved successfully')
  async getProfile(
    @CurrentUser('userId') userId: number,
  ): Promise<UserProfileDataDto> {
    return this.profileService.getProfile(userId);
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({
    status: 200,
    description: 'Profile updated successfully',
    type: UserProfileDataDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation failed',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    type: ErrorResponseDto,
  })
  @ResponseMessage('Profile updated successfully')
  async updateProfile(
    @CurrentUser('userId') userId: number,
    @Body() dto: UpdateProfileDto,
  ): Promise<UserProfileDataDto> {
    return this.profileService.updateProfile(userId, dto);
  }
}
