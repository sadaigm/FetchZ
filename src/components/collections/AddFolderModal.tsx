import React, { useState } from 'react';
import { Modal, Input, message } from 'antd';
import { FolderOutlined } from '@ant-design/icons';

interface AddFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddFolder: (folderName: string) => void;
  collectionId: string;
}

const AddFolderModal: React.FC<AddFolderModalProps> = ({ 
  isOpen, 
  onClose, 
  onAddFolder,
  collectionId 
}) => {
  const [folderName, setFolderName] = useState('');

  

  const handleAddFolder = () => {
    if (!folderName.trim()) {
      message.error('Please enter a folder name');
      return;
    }

    onAddFolder(folderName.trim());
    setFolderName('');
    onClose();
    message.success(`Folder "${folderName.trim()}" created successfully`);
  };

  const handleCancel = () => {
    setFolderName('');
    onClose();
  };

  return isOpen ? (
    <Modal
      title="Add New Folder"
      open={isOpen}
      onOk={handleAddFolder}
      onCancel={handleCancel}
      okText="Add Folder"
      cancelText="Cancel"
    >
        <div style={{ marginBottom: 16 }}>
        <Input
          placeholder="Enter folder name"
          value={folderName}
          onChange={(e) => setFolderName(e.target.value)}
          prefix={<FolderOutlined />}
          onPressEnter={handleAddFolder}
          autoFocus
        />
      </div>
    </Modal>
  ): null;
};

export default AddFolderModal;