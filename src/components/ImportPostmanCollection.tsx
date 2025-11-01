import React, { useState } from 'react';
import { 
  Modal, 
  Tabs, 
  Upload, 
  Button, 
  Input, 
  Typography, 
  Alert, 
  Space,
  Divider,
  List,
  Tag,
  message
} from 'antd';
import { 
  InboxOutlined, 
  FileTextOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { 
  validatePostmanCollection, 
  parsePostmanCollection, 
  convertToAppCollection,
  type PostmanCollection,
  type ParsedCollection
} from '../utils/postman-parser';
import type { Collection } from '../types/request.types';
import { useCollectionContext } from '../context/CollectionProvider';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

interface ImportPostmanCollectionProps {
  visible: boolean;
  onClose: () => void;
}

const ImportPostmanCollection: React.FC<ImportPostmanCollectionProps> = ({ visible, onClose }) => {
  const { addFullCollection } = useCollectionContext();
  const [activeTab, setActiveTab] = useState('upload');
  const [jsonText, setJsonText] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [parsedCollection, setParsedCollection] = useState<ParsedCollection | null>(null);
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [fileName, setFileName] = useState<string | null>(null);

  // Reset state when modal opens/closes
  React.useEffect(() => {
    if (visible) {
      setActiveTab('upload');
      setJsonText('');
      setValidationError(null);
      setParsedCollection(null);
      setImportStatus('idle');
      setFileName(null);
    }
  }, [visible]);

  // Validate and parse JSON text
  const validateAndParseJson = (text: string) => {
    try {
      const json = JSON.parse(text) as PostmanCollection;
      const validation = validatePostmanCollection(json);
      
      if (!validation.isValid) {
        setValidationError(validation.error || 'Invalid Postman collection format');
        setParsedCollection(null);
        return;
      }
      
      const parsed = parsePostmanCollection(json);
      setParsedCollection(parsed);
      setValidationError(null);
    } catch (error) {
      setValidationError('Invalid JSON format');
      setParsedCollection(null);
    }
  };

  // Handle file upload
  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setJsonText(content);
      setFileName(file.name);
      validateAndParseJson(content);
    };
    reader.readAsText(file);
    return false; // Prevent default upload behavior
  };

  // Handle JSON text change
  const handleJsonTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setJsonText(text);
    if (text.trim()) {
      validateAndParseJson(text);
    } else {
      setValidationError(null);
      setParsedCollection(null);
    }
  };

  // Import collection to database
  const handleImport = async () => {
    if (!parsedCollection) return;
    
    try {
      const collection = convertToAppCollection(parsedCollection);
      await addFullCollection(collection);
      setImportStatus('success');
      message.success(`Collection "${collection.name}" imported successfully!`);
    } catch (error) {
      setImportStatus('error');
      message.error('Failed to import collection');
    }
  };

  // Reset and import another
  const handleImportAnother = () => {
    setActiveTab('upload');
    setJsonText('');
    setValidationError(null);
    setParsedCollection(null);
    setImportStatus('idle');
    setFileName(null);
  };

  // View imported collection
  const handleViewCollection = () => {
    onClose();
  };

  // Render upload tab content
  const renderUploadTab = () => (
    <div style={{ padding: '20px 0' }}>
      <Upload.Dragger
        name="file"
        accept=".json"
        beforeUpload={handleFileUpload}
        showUploadList={false}
        style={{ padding: '20px' }}
      >
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">Click or drag Postman collection JSON file to this area to upload</p>
        <p className="ant-upload-hint">Support for a single .json file export from Postman</p>
      </Upload.Dragger>
      
      {fileName && (
        <div style={{ marginTop: 16 }}>
          <Text strong>File selected:</Text> {fileName}
        </div>
      )}
    </div>
  );

  // Render paste tab content
  const renderPasteTab = () => (
    <div style={{ padding: '20px 0' }}>
      <Text>Paste your Postman collection JSON below:</Text>
      <TextArea
        value={jsonText}
        onChange={handleJsonTextChange}
        placeholder="Paste your Postman collection JSON here..."
        rows={12}
        style={{ marginTop: 16, fontFamily: 'monospace' }}
      />
      
      {validationError && (
        <Alert
          message="Validation Error"
          description={validationError}
          type="error"
          showIcon
          style={{ marginTop: 16 }}
        />
      )}
    </div>
  );

  // Render collection preview
  const renderPreview = () => {
    if (!parsedCollection) return null;
    
    return (
      <div style={{ padding: '20px 0' }}>
        <Title level={4}>{parsedCollection.name}</Title>
        {parsedCollection.description && (
          <Paragraph type="secondary">{parsedCollection.description}</Paragraph>
        )}
        
        <Divider />
        
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div>
            <Text strong>Collection Name:</Text> {parsedCollection.name}
          </div>
          
          <div>
            <Text strong>Total Endpoints:</Text> {parsedCollection.totalRequests}
          </div>
          
          <div>
            <Text strong>Folders:</Text> {parsedCollection.folders.length}
          </div>
          
          <div>
            <Text strong>Variables:</Text> {parsedCollection.variables.length}
          </div>
          
          <div>
            <Text strong>Sample Methods:</Text>
            <div style={{ marginTop: 8 }}>
              {parsedCollection.sampleMethods.map(method => (
                <Tag key={method} color="blue" style={{ margin: '4px 4px 4px 0' }}>
                  {method}
                </Tag>
              ))}
            </div>
          </div>
          
          {parsedCollection.folders.length > 0 && (
            <div style={{ width: '100%' }}>
              <Text strong>Folder Structure:</Text>
              <List
                size="small"
                dataSource={parsedCollection.folders}
                renderItem={folder => (
                  <List.Item>
                    <List.Item.Meta
                      title={folder.name}
                      description={`${folder.requests.length} requests`}
                    />
                  </List.Item>
                )}
                style={{ marginTop: 8, maxHeight: 200, overflow: 'auto' }}
              />
            </div>
          )}
        </Space>
        
        <Divider />
        
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Space>
            <Button onClick={onClose}>Cancel</Button>
            <Button 
              type="primary" 
              onClick={handleImport}
              icon={<CheckCircleOutlined />}
            >
              Import to Database
            </Button>
          </Space>
        </div>
      </div>
    );
  };

  // Render success screen
  const renderSuccess = () => (
    <div style={{ textAlign: 'center', padding: '40px 20px' }}>
      <CheckCircleOutlined style={{ fontSize: 64, color: '#52c41a', marginBottom: 24 }} />
      <Title level={3}>Import Successful!</Title>
      <Paragraph>
        Your Postman collection '{parsedCollection?.name}' was successfully imported.
      </Paragraph>
      
      <Space direction="vertical" size="middle" style={{ marginTop: 24 }}>
        <div>
          <Text strong>Endpoints imported:</Text> {parsedCollection?.totalRequests}
        </div>
        
        <div>
          <Text strong>Variables detected:</Text> {parsedCollection?.variables.length}
        </div>
        
        <div>
          <Text strong>Imported date/time:</Text> {new Date().toLocaleString()}
        </div>
      </Space>
      
      <div style={{ marginTop: 32 }}>
        <Space>
          <Button onClick={handleViewCollection}>
            View Collection
          </Button>
          <Button type="primary" onClick={handleImportAnother}>
            Import Another
          </Button>
        </Space>
      </div>
    </div>
  );

  // Render error screen
  const renderError = () => (
    <div style={{ textAlign: 'center', padding: '40px 20px' }}>
      <ExclamationCircleOutlined style={{ fontSize: 64, color: '#ff4d4f', marginBottom: 24 }} />
      <Title level={3}>Import Failed</Title>
      <Paragraph type="danger">
        There was an error importing your collection. Please check the format and try again.
      </Paragraph>
      
      <div style={{ marginTop: 32 }}>
        <Space>
          <Button onClick={handleImportAnother}>
            Try Again
          </Button>
          <Button onClick={onClose}>
            Close
          </Button>
        </Space>
      </div>
    </div>
  );

  // Tab items
  const tabItems = [
    {
      key: 'upload',
      label: (
        <span>
          <FileTextOutlined />
          Upload JSON File
        </span>
      ),
      children: renderUploadTab()
    },
    {
      key: 'paste',
      label: (
        <span>
          <FileTextOutlined />
          Paste JSON Text
        </span>
      ),
      children: renderPasteTab()
    }
  ];

  // Render content based on status
  let content;
  if (importStatus === 'success') {
    content = renderSuccess();
  } else if (importStatus === 'error') {
    content = renderError();
  } else {
    content = (
      <div>
        <Title level={3}>Import Postman Collection</Title>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
        />
        
        {parsedCollection && importStatus === 'idle' && renderPreview()}
      </div>
    );
  }

  return (
    <Modal
      title={importStatus !== 'idle' ? '' : 'Import Postman Collection'}
      open={visible}
      onCancel={onClose}
      footer={null}
      width={importStatus !== 'idle' ? 600 : 800}
      destroyOnClose
    >
      {content}
    </Modal>
  );
};

export default ImportPostmanCollection;