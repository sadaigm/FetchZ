import type { WebRsRequest } from "../types/request.types";
import { v4 as uuidv4 } from 'uuid';

export function parseCurlScript(curlScript: string): WebRsRequest {
  const lines = curlScript
    .replace(/\\\\/g, '') // Remove backslashes used for line continuation
    .split(/\s+-/g) // Split by spaces followed by a dash
    .map((line) => `-${line.trim()}`) // Re-add the dash to each line
    .filter((line) => line.trim().length > 0); // Remove empty lines

  const urlMatch = lines[0].match(/curl '(.*?)'/);
  if (!urlMatch) {
    throw new Error('Invalid cURL script: URL not found');
  }

  const url = urlMatch[1];
  const allowedMethods = ['GET', 'POST', 'PUT', 'DELETE'] as const;
  const methodLine = lines.find((line) => line.includes('-X'));
  let method: "GET" | "POST" | "PUT" | "DELETE" = "GET";
  if (methodLine) {
    const extracted = methodLine.split(' ')[1]?.toUpperCase();
    if (allowedMethods.includes(extracted as any)) {
      method = extracted as typeof allowedMethods[number];
    }
  }

  const headers: { key: string; value: string }[] = [];
  lines
    .filter((line) => line.startsWith("-H")) // Ensure we only process header lines
    .forEach((line) => {
      const headerMatch = line.match(/-H\s+'([^:]+):\s*(.+?)'/);
      if (headerMatch) {
        headers.push({ key: headerMatch[1], value: headerMatch[2] });
      }
    });

  const bodyLine = lines.find((line) => line.startsWith("--data"));
  const body = bodyLine ? bodyLine.split("'")[1] : '';

  return {
    id: uuidv4(), // Provide a unique id if needed
    name: url, // Provide a name if needed
    url,
    method,
    headers,
    body,
    queryParams: [] // Provide actual query params if needed
  };
}


// curl 'http://192.168.2.126:8080/api/application' \
//   -H 'Accept: */*' \
//   -H 'Accept-Language: en-GB,en-US;q=0.9,en;q=0.8,ta;q=0.7' \
//   -H 'Cache-Control: max-age=0' \
//   -H 'Connection: keep-alive' \
//   -H 'Content-Type: application/json' \
//   -H 'GMHeader: Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJobXNjdXN0MSIsImF1ZCI6IndlYiIsImV4cCI6MTc1NDAwMjg3MiwiaWF0IjoxNzUzMzk4MDcyfQ.yfs7vIxYalXtRhNsbVHajCP5dAlTOuBJP_BqVyXfwUD4cMRBvFTXlbJfJ6aZmGMT45znU1dU2QIOUxQ52VLyXg' \
//   -H 'Origin: http://localhost:5173' \
//   -H 'User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36' \
//   --insecure