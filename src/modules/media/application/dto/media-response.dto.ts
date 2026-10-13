import { ApiProperty } from '@nestjs/swagger';

export class MediaResponse {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'https://cdn.example.com/image.jpg' })
  url!: string;

  @ApiProperty({ example: 204800 })
  size!: number;

  @ApiProperty({ example: 'image.jpg' })
  fileName!: string;
}

export class MediaSingleResponse {
  @ApiProperty({ type: MediaResponse })
  media!: MediaResponse;
}

export class MediaListResponse {
  @ApiProperty({ type: [MediaResponse] })
  mediaList!: MediaResponse[];
}
