import React, { useState, useEffect } from 'react';
import { Layout } from 'antd';
import './App.css';
import { RequestProvider, useRequestContext } from './context/RequestProvider';
import { RequestHistoryProvider } from './context/RequestHistoryProvider';
import NetworkPanel from './components/NetworkPanel';
import Sidebar from './components/Sidebar';
import AppLayoutPanel from './components/AppLayoutPanel';

const { Content } = Layout;

const App = () => {
  
  return (
    <RequestProvider>
      <RequestHistoryProvider>
        <Layout style={{ height: '100vh' }}>
          <Sidebar />
          <Layout style={{ padding: '16px' }}>
            <Content style={{ background: '#fff', padding: '16px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
              {/* <NetworkPanel
                request={tabs[0]}
                index={0}
                tabs={tabs}
                setTabs={setTabs}
              /> */}
              <AppLayoutPanel />
            </Content>
          </Layout>
        </Layout>
      </RequestHistoryProvider>
    </RequestProvider>
  );
};

export default App;
