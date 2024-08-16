import * as utilModule from './index';

describe('findSubstringInArray', () => {
  test('should find the substring in the array', () => {
    const str = 'hello';
    const arr = ['world', 'hello', 'goodbye'];
    expect(utilModule.findSubstringInArray(str, arr)).toBe('hello');
  });

  test('should return null if substring is not found in the array', () => {
    const str = 'foo';
    const arr = ['bar', 'baz', 'qux'];
    expect(utilModule.findSubstringInArray(str, arr)).toBeNull();
  });

  test('should return null if the array is empty', () => {
    const str = 'hello';
    const arr: string[] = [];
    expect(utilModule.findSubstringInArray(str, arr)).toBeNull();
  });

  test('should return the first match if array contains duplicate substrings', () => {
    const str = 'hello_one';
    const arr = ['world', 'hello', 'hello_o', 'goodbye'];
    expect(utilModule.findSubstringInArray(str, arr)).toBe('hello');
  });
});

describe('sleep', () => {
  jest.useFakeTimers();

  afterEach(() => {
    jest.clearAllTimers();
    jest.clearAllMocks();
  });

  test('sleep function delays execution', async () => {
    // Mocking Date.now() to control the flow of time
    const delay = 1000; // 1 second

    const start = Date.now();
    const sleepPromise = utilModule.sleep(delay);

    // Fast-forward time
    jest.advanceTimersByTime(delay);

    await sleepPromise;
    const end = Date.now();

    // Validate the elapsed time
    expect(end - start).toBeGreaterThanOrEqual(delay);
    expect(end - start).toBeLessThanOrEqual(delay + 50); // Allow some margin for timing inaccuracy
  });
});

describe('fetchRetry', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should succeed on the first attempt', async () => {
    const mockResponse = { status: 200 };
    const mockFetch = jest.fn().mockResolvedValueOnce(mockResponse);
    global.fetch = mockFetch;

    const spy = jest.spyOn(utilModule, 'sleep');

    const req = new Request('https://example.com');
    const response = await utilModule.fetchRetry(req);

    expect(response).toEqual(mockResponse);
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(spy).not.toHaveBeenCalled();
  });

  test('should retry on temporary server errors', async () => {
    const mockResponse = { status: 500 };
    const mockResponseSuccess = { status: 200 };
    const mockFetch = jest
      .fn()
      .mockResolvedValueOnce(mockResponse)
      .mockResolvedValueOnce(mockResponse)
      .mockResolvedValue(mockResponseSuccess);
    global.fetch = mockFetch;

    const sleepSpy = jest
      .spyOn(utilModule, 'sleep')
      .mockImplementation(() => Promise.resolve());

    const req = new Request('https://example.com');
    const response = await utilModule.fetchRetry(req);

    expect(response).toEqual(mockResponseSuccess);
    expect(mockFetch).toHaveBeenCalledTimes(3);
    expect(sleepSpy).toHaveBeenCalledTimes(2); // Two retries, so two calls to sleep
    expect(sleepSpy).toHaveBeenLastCalledWith(500); // Ensure the last sleep call waited for 500ms
  });

  test('should throw after 3 reties', async () => {
    const mockResponse = { status: 502 };
    const mockFetch = jest.fn().mockResolvedValue(mockResponse);
    global.fetch = mockFetch;

    const sleepSpy = jest
      .spyOn(utilModule, 'sleep')
      .mockImplementation(() => Promise.resolve());

    const req = new Request('https://example.com');
    try {
      await utilModule.fetchRetry(req);
    } catch (err) {
      expect(err.message).toEqual('Reached maximum amount of retries');
      expect(mockFetch).toHaveBeenCalledTimes(4);
      expect(sleepSpy).toHaveBeenCalledTimes(3); // Two retries, so two calls to sleep
      expect(sleepSpy).toHaveBeenLastCalledWith(500); // Ensure the last sleep call waited for 500ms
    }
  });

  test('should not retry on permanent server errors', async () => {
    const mockResponse = { status: 400 };
    const mockFetch = jest.fn().mockResolvedValueOnce(mockResponse);
    global.fetch = mockFetch;

    const req = new Request('https://example.com');
    const response = await utilModule.fetchRetry(req);

    expect(response).toEqual(mockResponse);
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(utilModule.sleep).not.toHaveBeenCalled();
  });
});
