export interface TestScriptContext {
  response: {
    status: number;
    headers: Record<string, string>;
    body: string;
    json: () => any;
  };
  environment: {
    set: (key: string, value: string) => void;
    get: (key: string) => string | undefined;
  };
  test: (name: string, fn: () => void) => void;
  expect: (actual: any) => any;
}

export interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

export interface TestScriptResult {
  tests: TestResult[];
  environmentChanges: { key: string; value: string }[];
  error?: string;
}

/**
 * Creates a response object for test scripts
 */
const createResponseObject = (response: any) => {
  let parsedBody = null;
  let statusCode = 200;
  let responseHeaders = {};
  
  // Handle different response structures
  if (response && typeof response === 'object') {
    // If response has status property (like axios response)
    if (response.status !== undefined) {
      statusCode = response.status;
    }
    
    // If response has headers property
    if (response.headers !== undefined) {
      responseHeaders = response.headers;
    }
    
    // Try to extract data from different possible structures
    let dataToParse = response;
    
    // Handle axios response structure
    if (response.data !== undefined) {
      dataToParse = response.data;
    }
    
    // Parse the data
    try {
      if (typeof dataToParse === 'string') {
        parsedBody = JSON.parse(dataToParse);
      } else if (typeof dataToParse === 'object' && dataToParse !== null) {
        parsedBody = dataToParse;
      } else {
        // For other types, use as-is
        parsedBody = dataToParse;
      }
    } catch (e) {
      // If parsing fails, use the raw data
      parsedBody = dataToParse;
    }
  } else {
    // If response is not an object, use it directly
    parsedBody = response;
  }

  return {
    status: statusCode,
    headers: responseHeaders,
    body: JSON.stringify(parsedBody),
    json: () => parsedBody
  };
};

/**
 * Creates an environment API object for test scripts
 */
const createEnvironmentAPI = (
  environmentId: string,
  updateEnvironmentValue: (envId: string, key: string, value: string) => void,
  getCurrentEnvironment: () => any,
  updateCurrentValue: (envId: string, key: string, value: string) => void,
  getCurrentValues: () => Map<string, Map<string, string>>
) => {
  const environmentChanges: { key: string; value: string }[] = [];

  return {
    set: (key: string, value: string) => {
      environmentChanges.push({ key, value });
      // Update the current value in the EnvironmentProvider context
      updateCurrentValue(environmentId, key, value);
      // Also update the persistent environment value
      updateEnvironmentValue(environmentId, key, value);
    },
    get: (key: string) => {
      // First check current values (runtime values)
      const currentValues = getCurrentValues();
      const envCurrentValues = currentValues.get(environmentId);
      if (envCurrentValues && envCurrentValues.has(key)) {
        return envCurrentValues.get(key);
      }
      
      // If not in current values, check the environment definition
      const env = getCurrentEnvironment();
      if (!env) return undefined;
      
      const envValue = env.values?.find((v: any) => v.key === key);
      return envValue?.value || envValue?.currentValue;
    },
    _getChanges: () => environmentChanges // Internal method to track changes
  };
};

/**
 * Simple test assertion implementation
 */
const createTestAPI = () => {
  const tests: TestResult[] = [];

  const test = (name: string, fn: () => void) => {
    try {
      fn();
      tests.push({ name, passed: true });
    } catch (error: any) {
      tests.push({ name, passed: false, error: error.message });
    }
  };

  const expect = (actual: any) => {
    return {
      toBe: (expected: any) => {
        if (actual !== expected) {
          throw new Error(`Expected ${expected}, but got ${actual}`);
        }
      },
      toEqual: (expected: any) => {
        if (JSON.stringify(actual) !== JSON.stringify(expected)) {
          throw new Error(`Expected ${JSON.stringify(expected)}, but got ${JSON.stringify(actual)}`);
        }
      },
      toContain: (expected: any) => {
        if (!actual.includes(expected)) {
          throw new Error(`Expected ${actual} to contain ${expected}`);
        }
      },
      toBeDefined: () => {
        if (actual === undefined) {
          throw new Error(`Expected value to be defined`);
        }
      },
      toBeNull: () => {
        if (actual !== null) {
          throw new Error(`Expected ${actual} to be null`);
        }
      },
      toBeTruthy: () => {
        if (!actual) {
          throw new Error(`Expected ${actual} to be truthy`);
        }
      },
      toBeFalsy: () => {
        if (actual) {
          throw new Error(`Expected ${actual} to be falsy`);
        }
      }
    };
  };

  return { test, expect, _getTests: () => tests };
};

/**
 * Executes a test script with the provided context
 */
export const executeTestScript = (
  script: string,
  response: any,
  environmentId: string,
  updateEnvironmentValue: (envId: string, key: string, value: string) => void,
  getCurrentEnvironment: () => any,
  updateCurrentValue: (envId: string, key: string, value: string) => void,
  getCurrentValues: () => Map<string, Map<string, string>>
): TestScriptResult => {
  const result: TestScriptResult = {
    tests: [],
    environmentChanges: []
  };

  try {
    // Create the script context
    const responseObj = createResponseObject(response);
    const environmentAPI = createEnvironmentAPI(environmentId, updateEnvironmentValue, getCurrentEnvironment, updateCurrentValue, getCurrentValues);
    const { test, expect, _getTests } = createTestAPI();

    // Create the fz object that will be available to the script
    const fz = {
      response: responseObj,
      environment: environmentAPI,
      test,
      expect
    };

    // Create a safe execution context
    const scriptFunction = new Function('fz', script);
    
    // Execute the script with timeout
    const timeoutId = setTimeout(() => {
      throw new Error('Script execution timeout (5000ms)');
    }, 5000);

    try {
      scriptFunction(fz);
      clearTimeout(timeoutId);
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }

    // Collect results
    result.tests = _getTests();
    result.environmentChanges = environmentAPI._getChanges();

  } catch (error: any) {
    result.error = error.message;
    console.error('Test script execution failed:', error);
  }

  return result;
};