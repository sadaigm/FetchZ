import React, { useState } from 'react';
import { Button, Modal, Input } from 'antd';
import { ImportOutlined } from '@ant-design/icons';
import { parseCurlScript } from '../../utils/curl-parser';
import { useRequestContext } from '../../context/RequestProvider';

const ImportCurlButton: React.FC = () => {
  const { addRequest, setSelectedRequestId } = useRequestContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [curlScript, setCurlScript] = useState('');

  const handleImportCurl = () => {
    try {
      const parsedRequest = parseCurlScript(curlScript);
      addRequest(parsedRequest);
        setSelectedRequestId && setSelectedRequestId(parsedRequest.id.toString());
      console.log('Request imported successfully:', parsedRequest);
      setIsModalOpen(false);
      setCurlScript('');
    } catch (error) {
      console.error('Failed to parse cURL script:', error);
      alert('Invalid cURL script. Please try again.');
    }
  };

  // const curl_sample = `
  // curl 'http://192.168.2.126:8080/api/application' \
  // -H 'Accept: */*' \
  // -H 'Accept-Language: en-GB,en-US;q=0.9,en;q=0.8,ta;q=0.7' \
  // -H 'Cache-Control: max-age=0' \
  // -H 'Connection: keep-alive' \
  // -H 'Content-Type: application/json' \
  // -H 'GMHeader: Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJobXNjdXN0MSIsImF1ZCI6IndlYiIsImV4cCI6MTc1NDAwMjg3MiwiaWF0IjoxNzUzMzk4MDcyfQ.yfs7vIxYalXtRhNsbVHajCP5dAlTOuBJP_BqVyXfwUD4cMRBvFTXlbJfJ6aZmGMT45znU1dU2QIOUxQ52VLyXg' \
  // -H 'Origin: http://localhost:5173' \
  // -H 'User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36' \
  // --insecure
  // `;

  // const POST_SAMPLE = `
  // curl 'http://192.168.2.126:8080/auth' \
  // -H 'Accept: */*' \
  // -H 'Accept-Language: en-GB,en-US;q=0.9,en;q=0.8,ta;q=0.7' \
  // -H 'Cache-Control: max-age=0' \
  // -H 'Connection: keep-alive' \
  // -H 'Content-Type: application/json' \
  // -H 'Origin: http://localhost:5173' \
  // -H 'User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36' \
  // --data-raw '{"username":"hmscust1","password":"hmscust1","customertype":"customer"}' \
  // --insecure
  // `;
  //  const postCurl = parseCurlScript(POST_SAMPLE);
  //   console.log('Parsed POST cURL Script:', postCurl);
//   const parsedCurl = parseCurlScript(curl_sample);
//   console.log('Parsed cURL Script:', parsedCurl);

  return (
    <>
      <Button type="default" onClick={() => setIsModalOpen(true)} icon={<ImportOutlined />} />
      <Modal
        title="Import cURL Script"
        open={isModalOpen}
        onOk={handleImportCurl}
        onCancel={() => setIsModalOpen(false)}
        okText="Import"
        cancelText="Cancel"
      >
        <Input.TextArea
          rows={20}
          placeholder="Paste your cURL script here"
          value={curlScript}
          onChange={(e) => setCurlScript(e.target.value)}
        />
      </Modal>
    </>
  );
};

export default ImportCurlButton;
