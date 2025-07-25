import React, { useState } from 'react';
import { Layout } from 'antd';
import './App.css';
import { sendRequest } from './apiClient';
import RequestPanel from './components/RequestPanel';
import ResponsePanel from './components/ResponsePanel';
import Sidebar from './components/Sidebar';
import { RequestProvider, useRequestContext } from './context/RequestProvider';
import type { WebRsRequest } from './types/request.types';

const { Content } = Layout;

const App = () => {
  const [response, setResponse] = useState<any>(null);
  
  const handleSendRequest = async (
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    url: string,
    body: any,
    headers: Record<string, string>,
    params: Record<string, string>
  ) => {
    try {
      const res = await sendRequest(method, url, body, headers, params);
      setResponse(res);
    } catch (error: any) {
      console.error('Request failed:', error);
      setResponse({ error: error.message });
    }
  };


  return (
    <RequestProvider>
      <Layout style={{ height: '100vh' }}>
        <Sidebar />
        <Layout style={{ padding: '16px' }}>
          <Content style={{ background: '#fff', padding: '16px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
            <RequestPanel onSendRequest={handleSendRequest} />
            <ResponsePanel response={response} />
          </Content>
        </Layout>
      </Layout>
    </RequestProvider>
  );
};

export default App;
