import React, { useState } from 'react';
import { Dropdown, Menu, Modal, Input } from 'antd';
import { FolderFilled, MoreOutlined } from '@ant-design/icons';
import type { Collection } from '../../types/request.types';
import { useCollectionMenuHandlers } from './FolderMenuHandlers';
import { renameCollectionAndRefresh, deleteCollectionAndRefresh, prepareEmptyRequest } from '../../utils/collection-utils';

interface CollectionItemProps {
  collection: Collection;
  children?: React.ReactNode;
}

const CollectionItem: React.FC<CollectionItemProps> = ({
  collection,
  children
}) => {
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const { handleCollectionMenuClick } = useCollectionMenuHandlers();

  const handleCollectionRename = () => {
    setNewCollectionName(collection.name);
    setIsRenameModalOpen(true);
  };

  const handleRenameSave = async () => {
    if (newCollectionName.trim()) {
      try {
        await renameCollectionAndRefresh(collection.id, newCollectionName);
        console.log(`Renamed collection ${collection.id} to ${newCollectionName}`);
        setIsRenameModalOpen(false);
      } catch (error) {
        console.error(`Failed to rename collection:`, error);
      }
    }
  };

  const handleRenameCancel = () => {
    setIsRenameModalOpen(false);
    setNewCollectionName('');
  };

  return (
    <>
      <span style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span>
          <FolderFilled />
          <span style={{marginLeft: '5px'}}>{collection.name}</span>
        </span>
        <Dropdown
          overlay={
            <Menu
              onClick={(info) => {
                if (info.key === 'rename') {
                  handleCollectionRename();
                } else {
                  handleCollectionMenuClick(info.key as string, collection.id);
                }
              }}
              items={[
                { key: 'addRequest', label: 'Add Request' },
                { key: 'addFolder', label: 'Add Folder' },
                { key: 'rename', label: 'Rename' },
                { key: 'delete', label: 'Delete' },
              ]}
            />
          }
          trigger={['click']}
        >
          <MoreOutlined style={{ cursor: 'pointer' }} />
        </Dropdown>
        {children}
      </span>
      <Modal
        title="Rename Collection"
        open={isRenameModalOpen}
        onOk={handleRenameSave}
        onCancel={handleRenameCancel}
        okText="Rename"
        cancelText="Cancel"
      >
        <Input
          placeholder="Enter new collection name"
          value={newCollectionName}
          onChange={(e) => setNewCollectionName(e.target.value)}
          onPressEnter={handleRenameSave}
        />
      </Modal>
    </>
  );
};

export default CollectionItem;