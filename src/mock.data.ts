import type { WebRsRequest } from './types/request.types';

export const mockRequests: WebRsRequest[] = [
  {
    id: '1',
    name: 'Get Posts',
    url: 'https://jsonplaceholder.typicode.com/posts',
    method: 'GET',
    headers: [
      { key: 'Content-Type', value: 'application/json' },
    ],
    queryParams: [],
    body: '',
  },
  {
    id: '2',
    name: 'Create Post',
    url: 'https://jsonplaceholder.typicode.com/posts',
    method: 'POST',
    headers: [
      { key: 'Content-Type', value: 'application/json' },
    ],
    queryParams: [],
    body: '{ "title": "foo", "body": "bar", "userId": 1 }',
  },
  {
    id: '3',
    name: 'Update Post',
    url: 'https://jsonplaceholder.typicode.com/posts/1',
    method: 'PUT',
    headers: [
      { key: 'Content-Type', value: 'application/json' },
    ],
    queryParams: [],
    body: '{ "id": 1, "title": "foo", "body": "bar", "userId": 1 }',
  },
];
