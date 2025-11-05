/**
 * Sample test scripts for the RequestForm component
 * These examples demonstrate how to use the test script API
 */

export const testScriptExamples = {
  // Basic status code check
  basicStatusCheck: `// Test if response status is 200
fz.test("Status code is 200", () => {
  fz.expect(fz.response.status).toBe(200);
});`,

  // JSON response validation
  jsonValidation: `// Test response contains expected JSON structure
fz.test("Response has valid JSON", () => {
  const data = fz.response.json();
  fz.expect(data).toBeDefined();
  fz.expect(data.userId).toBeDefined();
  fz.expect(data.id).toBeDefined();
  fz.expect(data.title).toBeDefined();
  fz.expect(data.completed).toBeDefined();
});

// Test specific values
fz.test("Todo item has correct structure", () => {
  const data = fz.response.json();
  fz.expect(typeof data.userId).toBe("number");
  fz.expect(typeof data.id).toBe("number");
  fz.expect(typeof data.title).toBe("string");
  fz.expect(typeof data.completed).toBe("boolean");
});`,

  // Environment variable extraction
  environmentExtraction: `// Extract values from response and store in environment
const data = fz.response.json();

// Store user ID in environment variable
fz.environment.set("userId", data.userId.toString());

// Store the todo title
fz.environment.set("todoTitle", data.title);

// Store completion status
fz.environment.set("isCompleted", data.completed.toString());

fz.test("Environment variables set", () => {
  fz.expect(fz.environment.get("userId")).toBe("1");
  fz.expect(fz.environment.get("todoTitle")).toBe("delectus aut autem");
  fz.expect(fz.environment.get("isCompleted")).toBe("false");
});`,

  // Header validation
  headerValidation: `// Test response headers
fz.test("Content-Type header exists", () => {
  fz.expect(fz.response.headers["content-type"]).toBeDefined();
  fz.expect(fz.response.headers["content-type"]).toContain("application/json");
});

fz.test("Response has reasonable length", () => {
  const bodyLength = fz.response.body.length;
  fz.expect(bodyLength).toBeGreaterThan(0);
  fz.expect(bodyLength).toBeLessThan(10000); // Reasonable size limit
});`,

  // Complex example with multiple tests
  comprehensiveTest: `// Comprehensive test example for todo API
const data = fz.response.json();

// Test 1: Basic structure validation
fz.test("Response has required fields", () => {
  fz.expect(data).toBeDefined();
  fz.expect(data).toHaveProperty("userId");
  fz.expect(data).toHaveProperty("id");
  fz.expect(data).toHaveProperty("title");
  fz.expect(data).toHaveProperty("completed");
});

// Test 2: Data type validation
fz.test("Fields have correct types", () => {
  fz.expect(typeof data.userId).toBe("number");
  fz.expect(typeof data.id).toBe("number");
  fz.expect(typeof data.title).toBe("string");
  fz.expect(typeof data.completed).toBe("boolean");
});

// Test 3: Business logic validation
fz.test("Todo item has valid values", () => {
  fz.expect(data.userId).toBeGreaterThan(0);
  fz.expect(data.id).toBeGreaterThan(0);
  fz.expect(data.title.length).toBeGreaterThan(0);
});

// Test 4: Environment variable setup
fz.test("Environment variables are set", () => {
  fz.environment.set("currentUserId", data.userId.toString());
  fz.environment.set("currentTodoId", data.id.toString());
  fz.environment.set("todoStatus", data.completed ? "completed" : "pending");
  
  // Verify the variables were set
  fz.expect(fz.environment.get("currentUserId")).toBe(data.userId.toString());
  fz.expect(fz.environment.get("currentTodoId")).toBe(data.id.toString());
  fz.expect(fz.environment.get("todoStatus")).toBeDefined();
});`,

  // Error handling example
  errorHandling: `// Test error responses
fz.test("Error handling", () => {
  if (fz.response.status >= 400) {
    fz.expect(fz.response.status).toBe(404);
    fz.expect(fz.response.body).toContain("Not Found");
  } else {
    fz.expect(fz.response.status).toBe(200);
    const data = fz.response.json();
    fz.expect(data).toBeDefined();
  }
});`,

  // Async-like behavior simulation
  conditionalLogic: `// Conditional test logic based on response
const data = fz.response.json();

if (data.completed) {
  fz.test("Completed todo has valid structure", () => {
    fz.expect(data.completed).toBe(true);
    fz.environment.set("lastCompletedTodo", data.id.toString());
  });
} else {
  fz.test("Pending todo has valid structure", () => {
    fz.expect(data.completed).toBe(false);
    fz.environment.set("lastPendingTodo", data.id.toString());
  });
}

// Common test regardless of status
fz.test("Todo has valid ID", () => {
  fz.expect(data.id).toBeGreaterThan(0);
});`,

  // Environment variable access and update example
  environmentAccessExample: `// Example of accessing and updating environment variables
const data = fz.response.json();

// Get existing environment variable (if it exists)
const existingToken = fz.environment.get("osc_token");
fz.test("Can access existing environment variables", () => {
  if (existingToken) {
    fz.expect(existingToken).toBeDefined();
    fz.expect(typeof existingToken).toBe("string");
  }
});

// Set new environment variable from response
fz.environment.set("osc_token", data.token || "default_token");

// Verify the variable was set correctly
fz.test("Environment variable was set correctly", () => {
  const newToken = fz.environment.get("osc_token");
  fz.expect(newToken).toBeDefined();
  fz.expect(newToken).toBe(data.token || "default_token");
});

// Example of setting multiple variables
fz.environment.set("user_id", data.userId?.toString() || "1");
fz.environment.set("session_id", data.sessionId || "session_" + Date.now());

fz.test("Multiple environment variables set", () => {
  fz.expect(fz.environment.get("user_id")).toBeDefined();
  fz.expect(fz.environment.get("session_id")).toBeDefined();
});`
};

/**
 * Get a sample script for the given example name
 */
export const getSampleScript = (exampleName: keyof typeof testScriptExamples): string => {
  return testScriptExamples[exampleName] || testScriptExamples.basicStatusCheck;
};

/**
 * Get all available example names
 */
export const getExampleNames = (): string[] => {
  return Object.keys(testScriptExamples);
};