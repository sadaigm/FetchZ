import React, { useState } from 'react';
import { allExpanded, JsonView, defaultStyles } from 'react-json-view-lite';
import 'react-json-view-lite/dist/index.css';
import TestResults from './TestResults';
import type { TestScriptResult } from '../services/testScriptExecutor';

interface CurrentResponseProps {
  response: any;
  isJsonView: boolean;
  testResults?: TestScriptResult | null;
  timeTaken?: number;
}

const CurrentResponse: React.FC<CurrentResponseProps> = ({ response, isJsonView, testResults, timeTaken }) => {
  const [activeTab, setActiveTab] = useState<'body' | 'cookies' | 'headers' | 'testResults'>('body');

  if (!response) {
    return <p>No response yet</p>;
  }

  if (response.error) {
    return <p>Error: {response.error}</p>;
  }

  const renderHeadersTable = () => {
    if (!response.headers) {
      return <p>No headers available</p>;
    }

    const headers = Object.entries(response.headers);
    
    return (
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #ccc' }}>
            <th style={{ padding: '8px', textAlign: 'left' }}>Key</th>
            <th style={{ padding: '8px', textAlign: 'left' }}>Value</th>
          </tr>
        </thead>
        <tbody>
          {headers.map(([key, value]) => (
            <tr key={key} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '8px', fontFamily: 'monospace' }}>{key}</td>
              <td style={{ padding: '8px', wordBreak: 'break-word' }}>{String(value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  const renderCookies = () => {
    if (!response.headers || !response.headers['set-cookie']) {
      return <p>No cookies available</p>;
    }

    const cookies = Array.isArray(response.headers['set-cookie'])
      ? response.headers['set-cookie']
      : [response.headers['set-cookie']];
    
    return (
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #ccc' }}>
            <th style={{ padding: '8px', textAlign: 'left' }}>Cookie</th>
          </tr>
        </thead>
        <tbody>
          {cookies.map((cookie, index) => (
            <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '8px', wordBreak: 'break-word' }}>{cookie}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  const renderTestResults = () => {
    if (!testResults) {
      return <p>No test results available</p>;
    }

    return <TestResults result={testResults} visible={true} />;
  };

  const getStatusInfo = () => {
    if (!response) return null;
    
    const status = response.status || 'N/A';
    const statusText = response.statusText || '';
    const size = response.headers ?
      JSON.stringify(response).length :
      JSON.stringify(response).length;
    
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        padding: '4px 0',
        borderBottom: '1px solid #eee',
        fontSize: '12px',
        color: '#666'
      }}>
        <div>
          Status: <span style={{
            color: status >= 200 && status < 300 ? '#52c41a' :
                   status >= 400 ? '#ff4d4f' : '#1890ff',
            fontWeight: 'bold'
          }}>{status} {statusText}</span>
        </div>
        <div>
          Time: <span>{timeTaken ? `${timeTaken}ms` : 'N/A'}</span>
        </div>
        <div>
          Size: <span>{size} bytes</span>
        </div>
      </div>
    );
  };


  const renderBody = () => {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flexGrow: 1, overflowY: 'auto' }}>
          {isJsonView ? (
            <JsonView data={response} shouldExpandNode={allExpanded} style={defaultStyles} />
          ) : (
            <textarea
              rows={20}
              style={{ width: '100%', maxHeight: '100%', resize: 'none', border: 'none', background: '#aba8a82b', color: 'inherit', fontFamily: 'inherit', fontSize: 'inherit' }}
              value={JSON.stringify(response, null, 2)}
              readOnly
            />
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {getStatusInfo()}
      <div style={{ display: 'flex', borderBottom: '1px solid #ccc' }}>
        <button
          onClick={() => setActiveTab('body')}
          style={{
            padding: '6px 12px',
            background: activeTab === 'body' ? '#f0f0f0' : 'transparent',
            border: 'none',
            cursor: 'pointer',
            borderBottom: activeTab === 'body' ? '2px solid #007acc' : 'none'
          }}
        >
          Body
        </button>
        <button
          onClick={() => setActiveTab('cookies')}
          style={{
            padding: '6px 12px',
            background: activeTab === 'cookies' ? '#f0f0f0' : 'transparent',
            border: 'none',
            cursor: 'pointer',
            borderBottom: activeTab === 'cookies' ? '2px solid #007acc' : 'none'
          }}
        >
          Cookies
        </button>
        <button
          onClick={() => setActiveTab('headers')}
          style={{
            padding: '6px 12px',
            background: activeTab === 'headers' ? '#f0f0f0' : 'transparent',
            border: 'none',
            cursor: 'pointer',
            borderBottom: activeTab === 'headers' ? '2px solid #007acc' : 'none'
          }}
        >
          Headers
        </button>
        {testResults && (
          <button
            onClick={() => setActiveTab('testResults')}
            style={{
              padding: '6px 12px',
              background: activeTab === 'testResults' ? '#f0f0f0' : 'transparent',
              border: 'none',
              cursor: 'pointer',
              borderBottom: activeTab === 'testResults' ? '2px solid #007acc' : 'none'
            }}
          >
            Test Results
          </button>
        )}
      </div>
      {/* always use maxHeight: 280px */}
      <div style={{ padding: '4px', flexGrow: 1, overflow: 'auto', maxHeight:'280px' }}>
        {activeTab === 'body' && renderBody()}
        {activeTab === 'cookies' && renderCookies()}
        {activeTab === 'headers' && renderHeadersTable()}
        {activeTab === 'testResults' && renderTestResults()}
      </div>
    </div>
  );
};

export default CurrentResponse;