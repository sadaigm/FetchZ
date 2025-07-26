import React, { useState, useEffect } from "react";
import { Modal, Select } from "antd";
import { useCollectionContext } from "../../context/CollectionProvider";
import type { WebRsRequest } from "../../types/request.types";

interface SaveToCollectionModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (collectionId: string) => void;
  request: WebRsRequest;
  collectionId?: string; // Optional prop to pass collection ID
}

const SaveToCollectionModal: React.FC<SaveToCollectionModalProps> = ({
  visible,
  onClose,
  onSave,
  collectionId,
}) => {
  const { collections } = useCollectionContext();
  const [selectedCollection, setSelectedCollection] = useState<string | null>(
    collectionId || null
  );

  useEffect(() => {
    if (collectionId) {
      setSelectedCollection(collectionId);
    }
  }, [collectionId]);

  const handleSave = () => {
    if (selectedCollection) {
      onSave(selectedCollection);
      onClose();
    }
  };

  return (
    <Modal
      title="Save Request to Collection"
      visible={visible}
      onOk={handleSave}
      onCancel={onClose}
    >
      <Select
        placeholder="Select a collection"
        value={selectedCollection}
        onChange={(value) => setSelectedCollection(value)}
        style={{ width: "100%" }}
      >
        {collections.map((collection) => (
          <Select.Option key={collection.id} value={collection.id}>
            {collection.name}
          </Select.Option>
        ))}
      </Select>
    </Modal>
  );
};

export default SaveToCollectionModal;
