import React, { useState } from 'react';
import { allExpanded, JsonView, defaultStyles } from 'react-json-view-lite';
import 'react-json-view-lite/dist/index.css';
import { Card, Switch } from 'antd';

interface ResponsePanelProps {
  response: any;
}

const ResponsePanel: React.FC<ResponsePanelProps> = ({ response }) => {
  const [isJsonView, setIsJsonView] = useState(true);

  if (!response) {
    return <p>No response yet</p>;
  }

  if (response.error) {
    return <p>Error: {response.error}</p>;
  }

  return (
    <Card title="Response Details" style={{ marginTop: '16px' }}

    extra={[
        <Switch
        checked={isJsonView}
        onChange={() => setIsJsonView(!isJsonView)}
        checkedChildren="JSON View"
        unCheckedChildren="Text View"
        // style={{ marginBottom: '16px' }}
      />
    ]}
    

    
    >
      {/* <Card.Meta description="Response Details" style={{ marginBottom: '16px' }} /> */}
      
      <div style={{ padding: '8px', maxHeight: '400px', overflowY: 'auto' }}>
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
    </Card>
  );
};

export default ResponsePanel;
