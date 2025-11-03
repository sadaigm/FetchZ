import React, { useState } from 'react';
import { Button, List, Card, Modal, Form, Input, Switch, Select, Space, Typography, Popconfirm, message, Tooltip } from 'antd';
import { PlusOutlined, DeleteOutlined, CheckOutlined } from '@ant-design/icons';
import { useEnvironmentContext } from '../../context/EnvironmentProvider';
import { useRequestContext } from '../../context/RequestProvider';
import { prepareEmptyEnvironmentValue } from '../../utils/environment-utils';
import type { Environment, EnvironmentValue, EnvironmentValueWithCurrent } from '../../types/environment.types';

const { Title, Text } = Typography;
const { Option } = Select;

interface EnvironmentDetailsProps {
  environment: Environment;
}

const EnvironmentDetails: React.FC<EnvironmentDetailsProps> = ({ environment }) => {
  const {
    saveEnvironment,
    refreshEnvironments,
    activeEnvironment,
    toggleEnvironmentActive,
    updateCurrentValue,
    currentValues
  } = useEnvironmentContext();

  const {
    setDirtyRequests,
    dirtyRequests
  } = useRequestContext();

  const [isAddValueModalVisible, setIsAddValueModalVisible] = useState(false);
  const [editingEnvironment, setEditingEnvironment] = useState<Environment>({ ...environment });
  const [originalEnvironment, setOriginalEnvironment] = useState<Environment>({ ...environment });
  const [newEnvironmentValue, setNewEnvironmentValue] = useState<EnvironmentValueWithCurrent>({
    key: '',
    value: '',
    currentValue: '',
    type: 'default',
    enabled: true
  });
  
  // Get the current environment with current values applied
  const currentEnvironmentWithCurrent = React.useMemo(() => {
    return {
      ...environment,
      values: environment.values.map(value => ({
        ...value,
        currentValue: currentValues.get(environment.id)?.get(value.key) || value.value
      }))
    };
  }, [environment, currentValues]);

  // Check if environment has changes
  const checkIfDirty = (current: Environment, original: Environment) => {
    return JSON.stringify(current) !== JSON.stringify(original);
  };

  // Check if this environment is dirty
  const isDirty = dirtyRequests.includes(environment.id);
  
  // Check if this environment is active
  const isActive = activeEnvironment?.id === environment.id;

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
    
    // Create new environment value with initial value
    const newValue: EnvironmentValue = {
      key: newEnvironmentValue.key,
      value: newEnvironmentValue.value || '',
      
      type: newEnvironmentValue.type,
      enabled: newEnvironmentValue.enabled
    };
    
    const updatedEnvironment = {
      ...editingEnvironment,
      values: [...editingEnvironment.values, newValue]
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
  
  const handleUpdateCurrentValue = (key: string, currentValue: string) => {
    // Update current value in provider state (not in editing environment)
    // This doesn't mark the environment as dirty since current values are temporary
    updateCurrentValue(environment.id, key, currentValue);
  };

  const handleUpdateInitialValue = (key: string, initialValue: string) => {
    const updatedValues = editingEnvironment.values.map(v =>
      v.key === key ? { ...v, initialValue } : v
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

  const handleResetToInitial = (key: string) => {
    const value = editingEnvironment.values.find(v => v.key === key);
    if (value?.value) {
      handleUpdateCurrentValue(key, value.value);
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
          <Tooltip
            title={isActive ? "Active" : "Set as Active"}
          >
            <Button
              type={isActive ? "primary" : "default"}
              icon={isActive ? <CheckOutlined /> : <CheckOutlined />}
              onClick={async () => {
                const isNowActive = await toggleEnvironmentActive(environment);
                message.success(isNowActive ? `Environment "${environment.name}" set as active` : `Environment "${environment.name}" deactivated`);
              }}
            />
          </Tooltip>
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

      {/* Environment Variables */}
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
          dataSource={currentEnvironmentWithCurrent.values}
          renderItem={(envValue: EnvironmentValueWithCurrent) => (
            <List.Item
              actions={[
                <Popconfirm
                  key="delete"
                  title="Are you sure you want to delete this value?"
                  onConfirm={() => handleDeleteValue(envValue.key)}
                >
                  <Button type="text" danger icon={<DeleteOutlined />} />
                </Popconfirm>
              ]}
            >
              <List.Item.Meta
                title={
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Text strong>{envValue.key}</Text>
                    <Switch
                      size="small"
                      checked={envValue.enabled}
                      onChange={(checked) => handleUpdateValue(envValue.key, { enabled: checked })}
                    />
                    <Select
                      value={envValue.type}
                      size="small"
                      onChange={(type) => handleUpdateValue(envValue.key, { type: type as 'default' | 'secret' | 'any' })}
                    >
                      <Option value="default">Default</Option>
                      <Option value="secret">Secret</Option>
                      <Option value="any">Any</Option>
                    </Select>
                  </div>
                }
                description={
                  <div>
                    <List
                      size="small"
                      dataSource={[
                        {
                          title: 'Initial Value',
                          description: (
                            <Input
                              value={envValue.value || ''}
                              placeholder="Initial Value"
                              onChange={(e) => handleUpdateInitialValue(envValue.key, e.target.value)}
                            />
                          )
                        },
                        {
                          title: 'Current Value',
                          description: (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              <Input
                                value={envValue.currentValue || envValue.value}
                                placeholder="Value"
                                onChange={(e) => handleUpdateCurrentValue(envValue.key, e.target.value)}
                              />
                              <div style={{ display: 'flex', gap: '8px' }}>
                                {envValue.value && envValue.value !== (envValue.currentValue) && (
                                  <Button
                                    size="small"
                                    type="link"
                                    onClick={() => handleResetToInitial(envValue.key)}
                                    style={{ padding: '0 4px', height: 'auto' }}
                                  >
                                    Reset to Initial
                                  </Button>
                                )}
                              </div>
                            </div>
                          )
                        }
                      ]}
                      renderItem={(item) => (
                        <div style={{ marginBottom: '8px' }}>
                          <Text type="secondary" style={{ fontSize: '12px' }}>{item.title}:</Text>
                          <div style={{ marginTop: '4px' }}>{item.description}</div>
                        </div>
                      )}
                    />
                  </div>
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
          <Form.Item label="Initial Value">
            <Input
              value={newEnvironmentValue.value}
              onChange={(e) => setNewEnvironmentValue({ ...newEnvironmentValue, value: e.target.value })}
              placeholder="Enter initial value"
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
