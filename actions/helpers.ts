export function createAction<TParams extends any[] = never[], TReturn = void>(
  cb: (...args: TParams) => Promise<TReturn>
) {
  return async (...args: TParams) => {
    try {
      return await cb(...args);
    } catch (e) {
      if (typeof e === 'string') {
        throw new Error(e);
      }
      throw new Error('Uncaught error in server action');
    }
  };
}
