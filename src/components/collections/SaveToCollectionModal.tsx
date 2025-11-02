import React, { useState, useEffect } from "react";
import { Modal, Tree } from "antd";
import { FolderOutlined, FileOutlined } from "@ant-design/icons";
import { useCollectionContext } from "../../context/CollectionProvider";
import type { WebRsRequest } from "../../types/request.types";

interface SaveToCollectionModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (collectionId: string, folderId?: string) => void;
  request: WebRsRequest;
  collectionId?: string; // Optional prop to pass collection ID
}

interface TreeNodeData {
  title: any;
  key: string;
  icon?: React.ReactNode;
  children?: TreeNodeData[];
  isLeaf?: boolean;
  type: 'collection' | 'folder' | 'root';
  collectionId: string;
  folderId?: string;
}

const SaveToCollectionModal: React.FC<SaveToCollectionModalProps> = ({
  visible,
  onClose,
  onSave,
  collectionId,
}) => {
  const { collections } = useCollectionContext();
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [treeData, setTreeData] = useState<TreeNodeData[]>([]);

  useEffect(() => {
    if (visible) {
      const data: TreeNodeData[] = collections.map((collection) => {
        const collectionNode: TreeNodeData = {
          title: (<><FolderOutlined /> {collection.name}</>),
          key: `collection-${collection.id}`,
          icon: <FolderOutlined />,
          type: 'collection',
          collectionId: collection.id,
        };

        // Add folders as children
        if (collection.folders && collection.folders.length > 0) {
          collectionNode.children = collection.folders.map((folder) => ({
            title: (<><FolderOutlined /> {folder.name}</>),
            key: `folder-${folder.id}`,
            icon: <FolderOutlined />,
            type: 'folder',
            collectionId: collection.id,
            folderId: folder.id,
          }));
        }

        // Add a "Root Level" option for direct collection requests
        collectionNode.children = [
          {
            title: 'Root Level',
            key: `root-${collection.id}`,
            icon: <FileOutlined />,
            type: 'root',
            collectionId: collection.id,
            isLeaf: true,
          },
          ...(collectionNode.children || [])
        ];

        return collectionNode;
      });

      setTreeData(data);

      // Set default selection if collectionId is provided
      if (collectionId) {
        setSelectedKeys([`root-${collectionId}`]);
      } else {
        setSelectedKeys([]);
      }
    }
  }, [collections, visible, collectionId]);

  const handleSave = () => {
    if (selectedKeys.length > 0) {
      const selectedKey = selectedKeys[0] as string;
      const node = findNodeByKey(selectedKey, treeData);
      
      if (node) {
        if (node.type === 'root') {
          // Save to collection root
          onSave(node.collectionId);
        } else if (node.type === 'folder') {
          // Save to folder
          onSave(node.collectionId, node.folderId);
        }
        onClose();
      }
    }
  };

  const findNodeByKey = (key: string, nodes: TreeNodeData[]): TreeNodeData | null => {
    for (const node of nodes) {
      if (node.key === key) {
        return node;
      }
      if (node.children) {
        const found = findNodeByKey(key, node.children);
        if (found) return found;
      }
    }
    return null;
  };

  const handleSelect = (selectedKeys: React.Key[]) => {
    setSelectedKeys(selectedKeys as string[]);
  };

  return (
    <Modal
      title="Save Request to Collection"
      visible={visible}
      onOk={handleSave}
      onCancel={onClose}
      okText="Save"
      cancelText="Cancel"
      okButtonProps={{ disabled: selectedKeys.length === 0 }}
    >
      <p style={{ marginBottom: 16 }}>Select where to save this request:</p>
      <Tree
        showLine={{ showLeafIcon: false }}
        treeData={treeData}
        selectedKeys={selectedKeys}
        onSelect={handleSelect}
        defaultExpandAll
      />
    </Modal>
  );
};

export default SaveToCollectionModal;
