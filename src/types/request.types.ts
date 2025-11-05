export interface SavedResponse {
  id: string;
  name: string;
  content: string; // Stringified JSON or error message
  timestamp: string; // ISO string for when the response was saved
}

export interface WebRsRequest {
  id: string;
  name: string; // Optional name for the request
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers: { key: string; value: string }[];
  queryParams: { key: string; value: string }[];
  body: string;
  description?: string; // Optional description for the request
  savedResponses: SavedResponse[]; // Array to store saved responses
  testScript?: string; // JavaScript code to execute after response
}

export interface Collection {
  id: string;
  name: string;
  requests: WebRsRequest[];
  folders?: CollectionFolder[];
}

export interface CollectionFolder {
  id: string;
  name: string;
  requests: WebRsRequest[];
  folders?: CollectionFolder[];
}

export interface RequestHistory {
  id: string;
  request: WebRsRequest;
  response: any; // Replace `any` with a specific type if the response structure is known
  timestamp: string; // ISO string for when the request was made
}
