import React, { useState } from 'react';
import { Modal, Input } from 'antd';
import { addCollection } from '../../services/collectionStorage';

interface AddCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddCollectionModal: React.FC<AddCollectionModalProps> = ({ isOpen, onClose }) => {
  const [collectionName, setCollectionName] = useState('');

  const handleCreateCollection = async () => {
    try {
      await addCollection(collectionName);
      console.log('Collection Created:', collectionName);
      setCollectionName('');
      onClose();
      // Trigger refresh of collections
      if (typeof window !== 'undefined' && window.dispatchEvent) {
        window.dispatchEvent(new Event('refreshCollections'));
      }
    } catch (error) {
      console.error('Failed to create collection:', error);
    }
  };

  return (
    <Modal
      title="Create Collection"
      open={isOpen}
      onOk={handleCreateCollection}
      onCancel={onClose}
      okText="Create"
      cancelText="Cancel"
    >
      <Input
        placeholder="Enter collection name"
        value={collectionName}
        onChange={(e) => setCollectionName(e.target.value)}
      />
    </Modal>
  );
};

export default AddCollectionModal;
