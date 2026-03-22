import { ApiProperty } from '@nestjs/swagger';

export class OptionValueResponse {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Red' })
  value: string;

  @ApiProperty({ example: 'https://cdn.example.com/red.jpg' })
  imageUrl: string;
}

export class OptionResponse {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Color' })
  name: string;

  @ApiProperty({ type: [OptionValueResponse] })
  values: OptionValueResponse[];
}

export class OptionDataDto {
  @ApiProperty({ type: OptionResponse })
  option: OptionResponse;
}

export class OptionListDataDto {
  @ApiProperty({ type: [OptionResponse] })
  options: OptionResponse[];
}

export class OptionValueDataDto {
  @ApiProperty({ type: OptionValueResponse })
  value: OptionValueResponse;
}
