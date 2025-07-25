export interface WebRsRequest {
  id: string;
  name: string; // Optional name for the request
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers: { key: string; value: string }[];
  queryParams: { key: string; value: string }[];
  body: string;
}
