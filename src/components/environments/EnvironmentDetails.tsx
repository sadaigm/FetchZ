import React, { useState } from 'react';
import { Button, List, Card, Modal, Form, Input, Switch, Select, Space, Typography, Popconfirm, message } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useEnvironmentContext } from '../../context/EnvironmentProvider';
import { useRequestContext } from '../../context/RequestProvider';
import { prepareEmptyEnvironmentValue } from '../../utils/environment-utils';
import type { Environment, EnvironmentValue } from '../../types/environment.types';

const { Title, Text } = Typography;
const { Option } = Select;

interface EnvironmentDetailsProps {
  environment: Environment;
}

const EnvironmentDetails: React.FC<EnvironmentDetailsProps> = ({ environment }) => {
  const {
    saveEnvironment,
    refreshEnvironments
  } = useEnvironmentContext();

  const {
    setDirtyRequests,
    dirtyRequests
  } = useRequestContext();

  const [isAddValueModalVisible, setIsAddValueModalVisible] = useState(false);
  const [editingEnvironment, setEditingEnvironment] = useState<Environment>({ ...environment });
  const [originalEnvironment, setOriginalEnvironment] = useState<Environment>({ ...environment });
  const [newEnvironmentValue, setNewEnvironmentValue] = useState<EnvironmentValue>({
    key: '',
    value: '',
    type: 'default',
    enabled: true
  });

  // Check if environment has changes
  const checkIfDirty = (current: Environment, original: Environment) => {
    return JSON.stringify(current) !== JSON.stringify(original);
  };

  // Check if this environment is dirty
  const isDirty = dirtyRequests.includes(environment.id);

  const handleAddValue = () => {
    if (!newEnvironmentValue.key.trim()) {
      message.error('Please enter a key for the environment value');
      return;
    }
    
    // Check if key already exists
    if (editingEnvironment.values.some(v => v.key === newEnvironmentValue.key)) {
      message.error('A variable with this key already exists');
      return;
    }
    
    const updatedEnvironment = {
      ...editingEnvironment,
      values: [...editingEnvironment.values, { ...newEnvironmentValue }]
    };
    
    setEditingEnvironment(updatedEnvironment);
    
    // Update dirty state using RequestContext
    if (checkIfDirty(updatedEnvironment, originalEnvironment)) {
      setDirtyRequests((prev) => {
        const newDirtyRequests = [...prev];
        if (!newDirtyRequests.includes(environment.id)) {
          newDirtyRequests.push(environment.id);
        }
        return newDirtyRequests;
      });
    } else {
      setDirtyRequests((prev) => prev.filter((id) => id !== environment.id));
    }
    
    setNewEnvironmentValue(prepareEmptyEnvironmentValue(''));
    setIsAddValueModalVisible(false);
    message.success('Environment value added (click Save to persist changes)');
  };

  const handleUpdateValue = (key: string, updatedValue: Partial<EnvironmentValue>) => {
    const updatedValues = editingEnvironment.values.map(v =>
      v.key === key ? { ...v, ...updatedValue } : v
    );
    
    const updatedEnvironment = {
      ...editingEnvironment,
      values: updatedValues
    };
    
    setEditingEnvironment(updatedEnvironment);
    
    // Update dirty state using RequestContext
    if (checkIfDirty(updatedEnvironment, originalEnvironment)) {
      setDirtyRequests((prev) => {
        const newDirtyRequests = [...prev];
        if (!newDirtyRequests.includes(environment.id)) {
          newDirtyRequests.push(environment.id);
        }
        return newDirtyRequests;
      });
    } else {
      setDirtyRequests((prev) => prev.filter((id) => id !== environment.id));
    }
  };

  const handleDeleteValue = (key: string) => {
    const updatedValues = editingEnvironment.values.filter(v => v.key !== key);
    
    const updatedEnvironment = {
      ...editingEnvironment,
      values: updatedValues
    };
    
    setEditingEnvironment(updatedEnvironment);
    
    // Update dirty state using RequestContext
    if (checkIfDirty(updatedEnvironment, originalEnvironment)) {
      setDirtyRequests((prev) => {
        const newDirtyRequests = [...prev];
        if (!newDirtyRequests.includes(environment.id)) {
          newDirtyRequests.push(environment.id);
        }
        return newDirtyRequests;
      });
    } else {
      setDirtyRequests((prev) => prev.filter((id) => id !== environment.id));
    }
  };

  const handleSaveEnvironment = async () => {
    try {
      await saveEnvironment(editingEnvironment);
      setOriginalEnvironment({ ...editingEnvironment });
      
      // Remove from dirty requests using RequestContext
      setDirtyRequests((prev) => prev.filter((id) => id !== environment.id));
      
      await refreshEnvironments();
      message.success('Environment saved successfully');
    } catch (error) {
      message.error('Failed to save environment');
      console.error(error);
    }
  };

  const handleCancelChanges = () => {
    setEditingEnvironment({ ...originalEnvironment });
    
    // Remove from dirty requests using RequestContext
    setDirtyRequests((prev) => prev.filter((id) => id !== environment.id));
    
    message.info('Changes discarded');
  };

  return (
    <div style={{ padding: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <Title level={3}>
          {environment.name}
          {isDirty && <Text type="warning" style={{ marginLeft: '8px', fontSize: '14px' }}>(unsaved changes)</Text>}
        </Title>
        <Space>
          {isDirty && (
            <Button onClick={handleCancelChanges}>
              Cancel
            </Button>
          )}
          <Button
            type="primary"
            onClick={handleSaveEnvironment}
            disabled={!isDirty}
          >
            Save
          </Button>
        </Space>
      </div>

      {/* Environment Values */}
      <Card
        title="Environment Variables"
        extra={
          <Button
            icon={<PlusOutlined />}
            onClick={() => setIsAddValueModalVisible(true)}
          >
            Add Variable
          </Button>
        }
      >
        <List
          dataSource={editingEnvironment.values}
          renderItem={(value) => (
            <List.Item
              actions={[
                <Popconfirm
                  key="delete"
                  title="Are you sure you want to delete this value?"
                  onConfirm={() => handleDeleteValue(value.key)}
                >
                  <Button type="text" danger icon={<DeleteOutlined />} />
                </Popconfirm>
              ]}
            >
              <List.Item.Meta
                title={
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Text strong>{value.key}</Text>
                    <Switch
                      size="small"
                      checked={value.enabled}
                      onChange={(checked) => handleUpdateValue(value.key, { enabled: checked })}
                    />
                    <Select
                      value={value.type}
                      size="small"
                      style={{ width: '80px' }}
                      onChange={(type) => handleUpdateValue(value.key, { type: type as 'default' | 'secret' | 'any' })}
                    >
                      <Option value="default">Default</Option>
                      <Option value="secret">Secret</Option>
                      <Option value="any">Any</Option>
                    </Select>
                  </div>
                }
                description={
                  <Input
                    value={value.value}
                    placeholder="Value"
                    onChange={(e) => handleUpdateValue(value.key, { value: e.target.value })}
                  />
                }
              />
            </List.Item>
          )}
        />
      </Card>

      {/* Add Value Modal */}
      <Modal
        title="Add Environment Variable"
        open={isAddValueModalVisible}
        onOk={handleAddValue}
        onCancel={() => {
          setIsAddValueModalVisible(false);
          setNewEnvironmentValue(prepareEmptyEnvironmentValue(''));
        }}
      >
        <Form layout="vertical">
          <Form.Item label="Key" required>
            <Input
              value={newEnvironmentValue.key}
              onChange={(e) => setNewEnvironmentValue({ ...newEnvironmentValue, key: e.target.value })}
              placeholder="Enter key"
            />
          </Form.Item>
          <Form.Item label="Value">
            <Input
              value={newEnvironmentValue.value}
              onChange={(e) => setNewEnvironmentValue({ ...newEnvironmentValue, value: e.target.value })}
              placeholder="Enter value"
            />
          </Form.Item>
          <Form.Item label="Type">
            <Select
              value={newEnvironmentValue.type}
              onChange={(type) => setNewEnvironmentValue({ ...newEnvironmentValue, type: type as 'default' | 'secret' | 'any' })}
            >
              <Option value="default">Default</Option>
              <Option value="secret">Secret</Option>
              <Option value="any">Any</Option>
            </Select>
          </Form.Item>
          <Form.Item label="Enabled">
            <Switch
              checked={newEnvironmentValue.enabled}
              onChange={(checked) => setNewEnvironmentValue({ ...newEnvironmentValue, enabled: checked })}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default EnvironmentDetails;