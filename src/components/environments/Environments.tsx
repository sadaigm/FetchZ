import React, { useState } from 'react';
import { Button, List, Modal, Form, Input, Typography, Popconfirm, message, Tooltip } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EnvironmentOutlined, CheckSquareFilled, CheckSquareOutlined, CheckOutlined } from '@ant-design/icons';
import { useEnvironmentContext } from '../../context/EnvironmentProvider';
import { useRequestContext } from '../../context/RequestProvider';
import { prepareEmptyEnvironment } from '../../utils/environment-utils';
import type { Environment } from '../../types/environment.types';

const { Title } = Typography;

const Environments: React.FC = () => {
  const {
    environments,
    addNewEnvironment,
    updateEnvironmentName,
    removeEnvironment,
    activeEnvironment,
    toggleEnvironmentActive
  } = useEnvironmentContext();

  const { addEnvironment } = useRequestContext();

  const [isAddEnvironmentModalVisible, setIsAddEnvironmentModalVisible] = useState(false);
  const [isEditEnvironmentModalVisible, setIsEditEnvironmentModalVisible] = useState(false);
  const [editingEnvironment, setEditingEnvironment] = useState<Environment | null>(null);
  const [newEnvironmentName, setNewEnvironmentName] = useState('');

  const handleAddEnvironment = async () => {
    if (!newEnvironmentName.trim()) {
      message.error('Please enter an environment name');
      return;
    }
    
    try {
      await addNewEnvironment(newEnvironmentName);
      setNewEnvironmentName('');
      setIsAddEnvironmentModalVisible(false);
      message.success('Environment added successfully');
    } catch (error) {
      message.error('Failed to add environment');
      console.error(error);
    }
  };

  const handleEditEnvironment = async () => {
    if (!editingEnvironment || !editingEnvironment.name.trim()) {
      message.error('Please enter an environment name');
      return;
    }
    
    try {
      await updateEnvironmentName(editingEnvironment.id, editingEnvironment.name);
      setIsEditEnvironmentModalVisible(false);
      setEditingEnvironment(null);
      message.success('Environment updated successfully');
    } catch (error) {
      message.error('Failed to update environment');
      console.error(error);
    }
  };

  const handleDeleteEnvironment = async (id: string) => {
    try {
      await removeEnvironment(id);
      message.success('Environment deleted successfully');
    } catch (error) {
      message.error('Failed to delete environment');
      console.error(error);
    }
  };

  const handleSelectEnvironment = (environment: Environment) => {
    // Add environment to the opened requests tabs
    addEnvironment(environment);
  };

  const openEditEnvironmentModal = (environment: Environment) => {
    setEditingEnvironment({ ...environment });
    setIsEditEnvironmentModalVisible(true);
  };

  return (
    <div style={{ padding: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ fontWeight: 'bold', textAlign: 'center', margin: 0 }}>
          <EnvironmentOutlined /> Environments
        </h3>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsAddEnvironmentModalVisible(true)}
          title="Add Environment"
        />
      </div>

      {/* Environments List */}
      <List
        dataSource={environments}
        renderItem={(environment) => (
          <List.Item
            style={{
              cursor: 'pointer',
            }}
            onClick={() => handleSelectEnvironment(environment)}
            actions={[
              <Tooltip
                key="setActive"
                title={activeEnvironment?.id === environment.id ? "Active" : "Set Active"}
              >
                <Button
                  type={activeEnvironment?.id === environment.id ? "primary" : "default"}
                  size="small"
                  icon={activeEnvironment?.id === environment.id ? <CheckOutlined /> : <CheckOutlined />}
                  onClick={async (e) => {
                    e.stopPropagation();
                    const isActive = await toggleEnvironmentActive(environment);
                    message.success(isActive ? `Environment "${environment.name}" set as active` : `Environment "${environment.name}" deactivated`);
                  }}
                />
              </Tooltip>,
              <Button
                key="edit"
                type="text"
                icon={<EditOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  openEditEnvironmentModal(environment);
                }}
              />,
              <Popconfirm
                key="delete"
                title="Are you sure you want to delete this environment?"
                onConfirm={(e) => {
                  e?.stopPropagation();
                  handleDeleteEnvironment(environment.id);
                }}
                onCancel={(e) => e?.stopPropagation()}
              >
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={(e) => e.stopPropagation()}
                />
              </Popconfirm>
            ]}
          >
            <List.Item.Meta title={environment.name} />
          </List.Item>
        )}
      />

      {/* Add Environment Modal */}
      <Modal
        title="Add Environment"
        open={isAddEnvironmentModalVisible}
        onOk={handleAddEnvironment}
        onCancel={() => {
          setIsAddEnvironmentModalVisible(false);
          setNewEnvironmentName('');
        }}
      >
        <Form layout="vertical">
          <Form.Item label="Environment Name" required>
            <Input
              value={newEnvironmentName}
              onChange={(e) => setNewEnvironmentName(e.target.value)}
              placeholder="Enter environment name"
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Environment Modal */}
      <Modal
        title="Edit Environment"
        open={isEditEnvironmentModalVisible}
        onOk={handleEditEnvironment}
        onCancel={() => {
          setIsEditEnvironmentModalVisible(false);
          setEditingEnvironment(null);
        }}
      >
        {editingEnvironment && (
          <Form layout="vertical">
            <Form.Item label="Environment Name" required>
              <Input
                value={editingEnvironment.name}
                onChange={(e) => setEditingEnvironment({ ...editingEnvironment, name: e.target.value })}
                placeholder="Enter environment name"
              />
            </Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  );
};

export default Environments;