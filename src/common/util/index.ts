export const findSubstringInArray = (
  str: string,
  arr: string[],
  i = 0,
): string | null =>
  i > arr.length
    ? null
    : ~str.indexOf(arr[i])
      ? arr[i]
      : findSubstringInArray(str, arr, i + 1);

export const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const fetchRetry = async (req: Request, i = 0): Promise<Response> => {
  const response = await fetch(req);

  if (i >= 3) {
    throw new Error('Reached maximum amount of retries');
  } else if (
    response.status === 500 ||
    response.status === 502 ||
    response.status === 503 ||
    response.status === 504
  ) {
    await sleep(500);
    return fetchRetry(req, i + 1);
  }
  return response;
};
