import { BadRequestException } from '@nestjs/common';
import { findIdsToRemove, rejectForeignIds } from './sync';

describe('sync utils', () => {
  describe('findIdsToRemove', () => {
    it('should return existing ids that are missing from the incoming list', () => {
      // Arrange
      const existing = [{ id: 1 }, { id: 2 }, { id: 3 }];
      const incoming = [{ id: 2 }, {}];

      // Act
      const result = findIdsToRemove(existing, incoming);

      // Assert
      expect(result).toEqual([1, 3]);
    });
  });

  describe('rejectForeignIds', () => {
    it('should accept incoming items when every id belongs to the existing rows', () => {
      // Arrange
      const existing = [{ id: 1 }, { id: 2 }];

      // Act & Assert
      expect(() => rejectForeignIds(existing, [{ id: 1 }, {}])).not.toThrow();
    });

    it('should reject incoming items when an id belongs to another owner', () => {
      // Arrange
      const existing = [{ id: 1 }];

      // Act & Assert
      expect(() => rejectForeignIds(existing, [{ id: 1 }, { id: 99 }])).toThrow(
        new BadRequestException('Items 99 do not belong to this resource'),
      );
    });
  });
});
