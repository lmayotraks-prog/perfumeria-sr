export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || '';
export const IS_STATIC_EXPORT = process.env.NEXT_PUBLIC_STATIC_EXPORT === 'true';

export function withBasePath(path: string): string {
  if (!path || /^https?:\/\//i.test(path) || path.startsWith('data:')) return path;
  if (BASE_PATH && path.startsWith(`${BASE_PATH}/`)) return path;
  return `${BASE_PATH}${path.startsWith('/') ? path : `/${path}`}`;
}
