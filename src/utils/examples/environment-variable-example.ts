import {
  updateUrl,
  updateHeaders,
  updateParams,
  updateBody,
  updateRequestWithEnvironment,
  updateProtocol
} from '../environment-variable-utils';
import type { Environment } from '../../types/environment.types';

// Example environment data
const exampleEnvironment: Environment = {
  id: "v4yb1mcva",
  name: "local_osc",
  values: [
    {
      key: "tomcat_url",
      value: "localhost",
      type: "default",
      enabled: true,
      currentValue: "localhost.ai"
    },
    {
      key: "osc_token",
      value: "",
      type: "default",
      enabled: true,
      currentValue: "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbiIsImF1ZCI6IndlYiIsImV4cCI6MTc2MjgyMzg2MywiaWF0IjoxNzYyMjE5MDYzfQ.ZG847mZ1-pSEPETpWz5aV_Hw2nEQeUFHVlFMMBMsIItDLIrLj8fdf9j81QVRnyhHIXjTX5FCwUdyicZCj31veg"
    }
  ]
};

// Example usage
export const exampleUsage = () => {
  // Example URL
  const url = "http://{{tomcat_url}}:8080/api/application";
  const updatedUrl = updateUrl(url, exampleEnvironment);
  console.log('URL before:', url);
  console.log('URL after:', updatedUrl);
  // Output: http://localhost.ai:8080/api/application

  // Example URL without protocol
  const urlWithoutProtocol = "{{tomcat_url}}:8080/api/application";
  const urlWithVariablesReplaced = updateUrl(urlWithoutProtocol, exampleEnvironment);
  const urlWithProtocol = updateProtocol(urlWithVariablesReplaced);
  console.log('URL without protocol:', urlWithoutProtocol);
  console.log('URL after variable replacement:', urlWithVariablesReplaced);
  console.log('URL after adding protocol:', urlWithProtocol);
  // Output:
  // URL without protocol: {{tomcat_url}}:8080/api/application
  // URL after variable replacement: localhost.ai:8080/api/application
  // URL after adding protocol: http://localhost.ai:8080/api/application

  // Example headers
  const headers = [
    { key: "Accept", value: "*/*" },
    { key: "Accept-Language", value: "en-GB,en-US;q=0.9,en;q=0.8,ta;q=0.7" },
    { key: "Cache-Control", value: "max-age=0" },
    { key: "Content-Type", value: "application/json" },
    { key: "GMHeader", value: "Bearer {{osc_token}}" }
  ];
  
  const updatedHeaders = updateHeaders(headers, exampleEnvironment);
  console.log('Headers before:', JSON.stringify(headers, null, 2));
  console.log('Headers after:', JSON.stringify(updatedHeaders, null, 2));
  // Output: GMHeader value will be replaced with the actual token

  // Example params
  const params = {
    token: "{{osc_token}}",
    server: "{{tomcat_url}}"
  };
  
  const updatedParams = updateParams(params, exampleEnvironment);
  console.log('Params before:', JSON.stringify(params, null, 2));
  console.log('Params after:', JSON.stringify(updatedParams, null, 2));
  // Output: Both token and server will be replaced with actual values

  // Example body
  const body = {
    username: "admin",
    token: "{{osc_token}}",
    server: "{{tomcat_url}}:8080"
  };
  
  const updatedBody = updateBody(body, exampleEnvironment);
  console.log('Body before:', JSON.stringify(body, null, 2));
  console.log('Body after:', JSON.stringify(updatedBody, null, 2));
  // Output: token and server will be replaced with actual values

  // Example complete request
  const request = {
    url: "http://{{tomcat_url}}:8080/api/application",
    headers: [
      { key: "GMHeader", value: "Bearer {{osc_token}}" }
    ],
    params: {
      token: "{{osc_token}}"
    },
    body: {
      server: "{{tomcat_url}}"
    }
  };
  
  const updatedRequest = updateRequestWithEnvironment(request, exampleEnvironment);
  console.log('Request before:', JSON.stringify(request, null, 2));
  console.log('Request after:', JSON.stringify(updatedRequest, null, 2));
  // Output: All variables in the request will be replaced with actual values

  return {
    updatedUrl,
    updatedHeaders,
    updatedParams,
    updatedBody,
    updatedRequest
  };
};

// Export the example environment for use in other parts of the application
export { exampleEnvironment };