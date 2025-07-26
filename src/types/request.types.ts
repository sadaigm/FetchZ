export interface WebRsRequest {
  id: string;
  name: string; // Optional name for the request
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers: { key: string; value: string }[];
  queryParams: { key: string; value: string }[];
  body: string;
  description?: string; // Optional description for the request
}

export interface Collection {
  id: string;
  name: string;
  requests: WebRsRequest[];
}

export interface RequestHistory {
  id: string;
  request: WebRsRequest;
  response: any; // Replace `any` with a specific type if the response structure is known
  timestamp: string; // ISO string for when the request was made
}
