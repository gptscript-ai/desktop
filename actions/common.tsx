'use server';

import { cookies } from 'next/headers';
import { GATEWAY_URL } from '@/config/env';

export async function list<T>(path: string): Promise<T> {
  return request(undefined, path, 'GET');
}

export async function get<T>(path: string, id: string): Promise<T> {
  if (id !== '') {
    path = `${path}/${id}`;
  }
  return request(undefined, path, 'GET');
}

export async function update<T>(obj: T, path: string): Promise<T> {
  return request(obj, path, 'PATCH');
}

export async function create<T>(obj: T, path: string): Promise<T> {
  return request(obj, path, 'POST');
}

export async function del<T>(id: string, path: string): Promise<any> {
  return request(undefined, `${path}/${id}`, 'DELETE');
}

export async function request<T>(
  obj: T,
  path: string,
  method: string
): Promise<any> {
  const resp = await fetch(`${GATEWAY_URL()}/api/${path}`, {
    method: method,
    headers: {
      'Content-type': 'application/json',
      Authorization: `Bearer ${(cookies().get('gateway_token') || {}).value || ''}`,
    },
    body: obj ? JSON.stringify(obj) : undefined,
  });

  const res = await resp.json();
  if (resp.status < 200 || resp.status >= 400) {
    throw Error(`Unexpected status ${resp.status}: ${res.error}`);
  }

  return res;
}
