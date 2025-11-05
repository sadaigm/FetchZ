import React from 'react';
import { Card, List, Tag, Typography, Space, Alert } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import type { TestScriptResult } from '../services/testScriptExecutor';

const { Text, Title } = Typography;

interface TestResultsProps {
  result: TestScriptResult | null;
  visible: boolean;
}

const TestResults: React.FC<TestResultsProps> = ({ result, visible }) => {
  if (!visible || !result) {
    return null;
  }

  const passedTests = result.tests.filter(test => test.passed);
  const failedTests = result.tests.filter(test => !test.passed);

  return (
    <Card
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={5} style={{ margin: 0 }}>Test Results</Title>
          <Space>
            <Tag color={result.error ? 'red' : failedTests.length > 0 ? 'orange' : 'green'}>
              {result.error ? 'Error' : failedTests.length > 0 ? 'Failed' : 'Passed'}
            </Tag>
            <Text type="secondary">
              {passedTests.length} passed
              {failedTests.length > 0 && (
                <>
                  <span style={{ margin: '0 8px' }}>•</span>
                  <Text type="danger">{failedTests.length} failed</Text>
                </>
              )}
              <span style={{ margin: '0 8px' }}>•</span>
              Total: {result.tests.length} tests
            </Text>
          </Space>
        </div>
      }
      size="small"
      style={{ marginTop: 16 }}
    >
      {/* Script Error Display */}
      {result.error && (
        <Alert
          message="Script Execution Error"
          description={result.error}
          type="error"
          showIcon
          icon={<InfoCircleOutlined />}
          style={{ marginBottom: 16 }}
        />
      )}


      {/* Individual Test Results */}
      {result.tests.length > 0 && (
        <List
          size="small"
          dataSource={result.tests}
          renderItem={(test) => (
            <List.Item style={{ padding: '8px 0' }}>
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <Space>
                  {test.passed ? (
                    <CheckCircleOutlined style={{ color: '#52c41a' }} />
                  ) : (
                    <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
                  )}
                  <Text strong={test.passed} type={test.passed ? 'success' : 'danger'}>
                    {test.name}
                  </Text>
                </Space>
                {test.error && (
                  <Text type="danger" style={{ fontSize: '12px', marginLeft: '20px' }}>
                    {test.error}
                  </Text>
                )}
              </Space>
            </List.Item>
          )}
        />
      )}

      {/* Environment Changes */}
      {result.environmentChanges.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <Title level={5}>Environment Variables Updated</Title>
          <List
            size="small"
            dataSource={result.environmentChanges}
            renderItem={(change) => (
              <List.Item style={{ padding: '4px 0' }}>
                <Space>
                  <Text code>{change.key}</Text>
                  <Text>=</Text>
                  <Text>{change.value}</Text>
                </Space>
              </List.Item>
            )}
          />
        </div>
      )}

      {/* No Tests Run */}
      {result.tests.length === 0 && !result.error && (
        <Text type="secondary">No tests were executed</Text>
      )}
    </Card>
  );
};

export default TestResults;