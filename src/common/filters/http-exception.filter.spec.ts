import { ArgumentsHost, Logger, NotFoundException } from '@nestjs/common';
import { GlobalExceptionFilter } from './http-exception.filter';

const makeHost = () => {
  const json = jest.fn();
  const status = jest.fn().mockReturnValue({ json });
  const host = {
    switchToHttp: () => ({ getResponse: () => ({ status }) }),
  } as unknown as ArgumentsHost;
  return { host, status, json };
};

describe('GlobalExceptionFilter', () => {
  let filter: GlobalExceptionFilter;
  let logError: jest.SpyInstance;

  beforeEach(() => {
    filter = new GlobalExceptionFilter();
    logError = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => undefined);
  });

  afterEach(() => {
    logError.mockRestore();
  });

  it('should log the original error and hide it from the client when an unexpected error occurs', () => {
    // Arrange
    const { host, status, json } = makeHost();
    const error = new Error('db down');

    // Act
    filter.catch(error, host);

    // Assert
    expect(logError).toHaveBeenCalledWith(error.stack);
    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith({
      status: 500,
      message: 'Internal server error',
      data: null,
    });
  });

  it('should not log when the error is an expected HTTP exception', () => {
    // Arrange
    const { host, json } = makeHost();

    // Act
    filter.catch(new NotFoundException('Order 99 not found'), host);

    // Assert
    expect(logError).not.toHaveBeenCalled();
    expect(json).toHaveBeenCalledWith({
      status: 404,
      message: 'Order 99 not found',
      data: null,
    });
  });
});
