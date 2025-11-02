import React, { useState } from 'react';
import { Dropdown, Menu, Modal, Input } from 'antd';
import { FolderTwoTone, MoreOutlined } from '@ant-design/icons';
import type { CollectionFolder } from '../../types/request.types';
import { useFolderItemHandlers } from './FolderMenuHandlers';
import { renameFolderAndRefresh } from '../../utils/collection-utils';

interface FolderItemProps {
  folder: CollectionFolder;
  collectionId: string;
  children?: React.ReactNode;
}

const FolderItem: React.FC<FolderItemProps> = ({
  folder,
  collectionId,
  children
}) => {
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const { handleFolderMenuClick } = useFolderItemHandlers();

  const handleFolderRename = () => {
    setNewFolderName(folder.name);
    setIsRenameModalOpen(true);
  };

  const handleRenameSave = async () => {
    if (newFolderName.trim()) {
      try {
        await renameFolderAndRefresh(collectionId, folder.id, newFolderName);
        console.log(`Renamed folder ${folder.id} to ${newFolderName} in collection ${collectionId}`);
        setIsRenameModalOpen(false);
      } catch (error) {
        console.error(`Failed to rename folder:`, error);
      }
    }
  };

  const handleRenameCancel = () => {
    setIsRenameModalOpen(false);
    setNewFolderName('');
  };

  return (
    <>
      <span style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span>
          <FolderTwoTone />
          <span style={{marginLeft: '5px'}}>{folder.name}</span>
        </span>
        <Dropdown
          overlay={
            <Menu
              onClick={(info) => {
                if (info.key === 'rename') {
                  handleFolderRename();
                } else {
                  handleFolderMenuClick(info.key as string, collectionId, folder.id);
                }
              }}
              items={[
                { key: 'addRequest', label: 'Add Request' },
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
        title="Rename Folder"
        open={isRenameModalOpen}
        onOk={handleRenameSave}
        onCancel={handleRenameCancel}
        okText="Rename"
        cancelText="Cancel"
      >
        <Input
          placeholder="Enter new folder name"
          value={newFolderName}
          onChange={(e) => setNewFolderName(e.target.value)}
          onPressEnter={handleRenameSave}
        />
      </Modal>
    </>
  );
};

export default FolderItem;