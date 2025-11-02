import React, { useState, useEffect, useRef } from 'react';
import { Modal, Form, Input } from 'antd';
import type { WebRsRequest } from '../types/request.types';

interface EditRequestModalProps {
  visible: boolean;
  request: WebRsRequest;
  onClose: () => void;
  onSave: (name: string, description: string) => void;
}

const EditRequestModal: React.FC<EditRequestModalProps> = ({
  visible,
  request,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState(request.name);
  const [description, setDescription] = useState(request.description || '');
  const nameInputRef = useRef<any>(null);

  useEffect(() => {
    if (visible) {
      setName(request.name);
      setDescription(request.description || '');
      // Focus on name input when modal opens
      setTimeout(() => {
        if (nameInputRef.current) {
          nameInputRef.current.focus();
        }
      }, 100);
    }
  }, [visible, request]);

  const handleSave = () => {
    onSave(name, description);
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <Modal
      title="Edit Name and Description"
      visible={visible}
      onOk={handleSave}
      onCancel={handleCancel}
      okText="Save"
      cancelText="Cancel"
    >
      <Form layout="vertical">
        <Form.Item label="Name">
          <Input
            ref={nameInputRef}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter request name"
          />
        </Form.Item>
        <Form.Item label="Description">
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter request description"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditRequestModal;