import React from 'react';
import { allExpanded, JsonView, defaultStyles } from 'react-json-view-lite';
import 'react-json-view-lite/dist/index.css';

interface CurrentResponseProps {
  response: any;
  isJsonView: boolean;
}

const CurrentResponse: React.FC<CurrentResponseProps> = ({ response, isJsonView }) => {
  if (!response) {
    return <p>No response yet</p>;
  }

  if (response.error) {
    return <p>Error: {response.error}</p>;
  }

  return (
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
  );
};

export default CurrentResponse;