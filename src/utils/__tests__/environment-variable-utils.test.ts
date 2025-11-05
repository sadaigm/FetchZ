import {
  replaceVariables,
  updateUrl,
  updateHeaders,
  updateParams,
  updateBody,
  updateRequestWithEnvironment,
  updateProtocol
} from '../environment-variable-utils';
import type { Environment } from '../../types/environment.types';

// Mock environment data (similar to the example in the task)
const mockEnvironment: Environment = {
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

// Test cases
describe('Environment Variable Utils', () => {
  describe('replaceVariables', () => {
    it('should replace variables with current values', () => {
      const text = 'http://{{tomcat_url}}:8080/api';
      const result = replaceVariables(text, mockEnvironment);
      expect(result).toBe('http://localhost.ai:8080/api');
    });

    it('should handle multiple variables', () => {
      const text = 'Bearer {{osc_token}} at {{tomcat_url}}';
      const result = replaceVariables(text, mockEnvironment);
      expect(result).toBe('Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbiIsImF1ZCI6IndlYiIsImV4cCI6MTc2MjgyMzg2MywiaWF0IjoxNzYyMjE5MDYzfQ.ZG847mZ1-pSEPETpWz5aV_Hw2nEQeUFHVlFMMBMsIItDLIrLj8fdf9j81QVRnyhHIXjTX5FCwUdyicZCj31veg at localhost.ai');
    });

    it('should leave unknown variables unchanged', () => {
      const text = 'http://{{unknown_var}}:8080/api';
      const result = replaceVariables(text, mockEnvironment);
      expect(result).toBe('http://{{unknown_var}}:8080/api');
    });

    it('should handle null environment', () => {
      const text = 'http://{{tomcat_url}}:8080/api';
      const result = replaceVariables(text, null);
      expect(result).toBe(text);
    });
  });

  describe('updateUrl', () => {
    it('should update URL with environment variables', () => {
      const url = "http://{{tomcat_url}}:8080/api/application";
      const result = updateUrl(url, mockEnvironment);
      expect(result).toBe("http://localhost.ai:8080/api/application");
    });
  });

  describe('updateProtocol', () => {
    it('should add http:// protocol to URL without protocol', () => {
      const url = 'localhost:8080/api/application';
      const result = updateProtocol(url);
      expect(result).toBe('http://localhost:8080/api/application');
    });

    it('should add custom protocol to URL without protocol', () => {
      const url = 'localhost:8080/api/application';
      const result = updateProtocol(url, 'https://');
      expect(result).toBe('https://localhost:8080/api/application');
    });

    it('should not modify URL that already has http:// protocol', () => {
      const url = 'http://localhost:8080/api/application';
      const result = updateProtocol(url);
      expect(result).toBe('http://localhost:8080/api/application');
    });

    it('should not modify URL that already has https:// protocol', () => {
      const url = 'https://api.example.com/data';
      const result = updateProtocol(url);
      expect(result).toBe('https://api.example.com/data');
    });

    it('should not modify URL with other protocols', () => {
      const url = 'ftp://files.example.com/data';
      const result = updateProtocol(url);
      expect(result).toBe('ftp://files.example.com/data');
    });

    it('should handle empty string', () => {
      const url = '';
      const result = updateProtocol(url);
      expect(result).toBe('');
    });

    it('should handle null/undefined input', () => {
      const result1 = updateProtocol(null as any);
      const result2 = updateProtocol(undefined as any);
      expect(result1).toBe(null);
      expect(result2).toBe(undefined);
    });
  });

  describe('updateHeaders', () => {
    it('should update headers with environment variables', () => {
      const headers = [
        { key: "Accept", value: "*/*" },
        { key: "Content-Type", value: "application/json" },
        { key: "GMHeader", value: "Bearer {{osc_token}}" }
      ];
      
      const expected = [
        { key: "Accept", value: "*/*" },
        { key: "Content-Type", value: "application/json" },
        { key: "GMHeader", value: "Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbiIsImF1ZCI6IndlYiIsImV4cCI6MTc2MjgyMzg2MywiaWF0IjoxNzYyMjE5MDYzfQ.ZG847mZ1-pSEPETpWz5aV_Hw2nEQeUFHVlFMMBMsIItDLIrLj8fdf9j81QVRnyhHIXjTX5FCwUdyicZCj31veg" }
      ];
      
      const result = updateHeaders(headers, mockEnvironment);
      expect(result).toEqual(expected);
    });
  });

  describe('updateParams', () => {
    it('should update params with environment variables', () => {
      const params = {
        token: "{{osc_token}}",
        server: "{{tomcat_url}}"
      };
      
      const expected = {
        token: "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbiIsImF1ZCI6IndlYiIsImV4cCI6MTc2MjgyMzg2MywiaWF0IjoxNzYyMjE5MDYzfQ.ZG847mZ1-pSEPETpWz5aV_Hw2nEQeUFHVlFMMBMsIItDLIrLj8fdf9j81QVRnyhHIXjTX5FCwUdyicZCj31veg",
        server: "localhost.ai"
      };
      
      const result = updateParams(params, mockEnvironment);
      expect(result).toEqual(expected);
    });
  });

  describe('updateBody', () => {
    it('should update string body with environment variables', () => {
      const body = '{"token": "{{osc_token}}", "server": "{{tomcat_url}}"}';
      const result = updateBody(body, mockEnvironment);
      expect(result).toBe('{"token": "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbiIsImF1ZCI6IndlYiIsImV4cCI6MTc2MjgyMzg2MywiaWF0IjoxNzYyMjE5MDYzfQ.ZG847mZ1-pSEPETpWz5aV_Hw2nEQeUFHVlFMMBMsIItDLIrLj8fdf9j81QVRnyhHIXjTX5FCwUdyicZCj31veg", "server": "localhost.ai"}');
    });

    it('should update object body with environment variables', () => {
      const body = {
        username: "admin",
        token: "{{osc_token}}",
        server: "{{tomcat_url}}:8080"
      };
      
      const expected = {
        username: "admin",
        token: "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbiIsImF1ZCI6IndlYiIsImV4cCI6MTc2MjgyMzg2MywiaWF0IjoxNzYyMjE5MDYzfQ.ZG847mZ1-pSEPETpWz5aV_Hw2nEQeUFHVlFMMBMsIItDLIrLj8fdf9j81QVRnyhHIXjTX5FCwUdyicZCj31veg",
        server: "localhost.ai:8080"
      };
      
      const result = updateBody(body, mockEnvironment);
      expect(result).toEqual(expected);
    });

    it('should update array body with environment variables', () => {
      const body = [
        { name: "server1", url: "{{tomcat_url}}:8080" },
        { name: "server2", url: "{{tomcat_url}}:8081" }
      ];
      
      const expected = [
        { name: "server1", url: "localhost.ai:8080" },
        { name: "server2", url: "localhost.ai:8081" }
      ];
      
      const result = updateBody(body, mockEnvironment);
      expect(result).toEqual(expected);
    });
  });

  describe('updateRequestWithEnvironment', () => {
    it('should update all request components with environment variables', () => {
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
      
      const expected = {
        url: "http://localhost.ai:8080/api/application",
        headers: [
          { key: "GMHeader", value: "Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbiIsImF1ZCI6IndlYiIsImV4cCI6MTc2MjgyMzg2MywiaWF0IjoxNzYyMjE5MDYzfQ.ZG847mZ1-pSEPETpWz5aV_Hw2nEQeUFHVlFMMBMsIItDLIrLj8fdf9j81QVRnyhHIXjTX5FCwUdyicZCj31veg" }
        ],
        params: {
          token: "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbiIsImF1ZCI6IndlYiIsImV4cCI6MTc2MjgyMzg2MywiaWF0IjoxNzYyMjE5MDYzfQ.ZG847mZ1-pSEPETpWz5aV_Hw2nEQeUFHVlFMMBMsIItDLIrLj8fdf9j81QVRnyhHIXjTX5FCwUdyicZCj31veg"
        },
        body: {
          server: "localhost.ai"
        }
      };
      
      const result = updateRequestWithEnvironment(request, mockEnvironment);
      expect(result).toEqual(expected);
    });
  });
});