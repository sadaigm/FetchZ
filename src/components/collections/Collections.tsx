import { Button, Tree, Dropdown, Menu, Modal, Input, Select } from 'antd';
import { FileFilled, FileTwoTone, FolderFilled, FolderTwoTone, MoreOutlined, PlusOutlined, ReloadOutlined, ImportOutlined, DatabaseFilled } from '@ant-design/icons';
import React, { useEffect, useState } from 'react';
import AddCollectionModal from './AddCollectionModal';
import AddFolderModal from './AddFolderModal';
import ImportCurlButton from './ImportCurlButton';
import ImportPostmanCollection from '../ImportPostmanCollection';
import { renameCollectionAndRefresh, renameFolderAndRefresh, deleteCollectionAndRefresh, prepareEmptyRequest } from '../../utils/collection-utils';
import { useRequestContext } from '../../context/RequestProvider';
import { useCollectionContext } from '../../context/CollectionProvider';
import type { CollectionFolder } from '../../types/request.types';


const { Search } = Input;


const Collections: React.FC = () => {
  const { addRequest, setSelectedRequestId, openedRequests } = useRequestContext();
  const { collections, addFolder, deleteFolder, addRequestToFolder, removeRequestFromFolder, refreshCollections } = useCollectionContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [treeData, setTreeData] = useState<any[]>([]);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [renameCollectionId, setRenameCollectionId] = useState<string | null>(null);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [folderCollectionId, setFolderCollectionId] = useState<string | null>(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [renameFolderId, setRenameFolderId] = useState<string | null>(null);
  const [isRenamingFolder, setIsRenamingFolder] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMethod, setFilterMethod] = useState<string | null>(null);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);
  const handleOpenImportModal = () => setIsImportModalOpen(true);
  const handleCloseImportModal = () => setIsImportModalOpen(false);
  const handleOpenFolderModal = (collectionId: string) => {
    setFolderCollectionId(collectionId);
    setIsFolderModalOpen(true);
  };
  const handleCloseFolderModal = () => {
    setIsFolderModalOpen(false);
    setFolderCollectionId(null);
    setNewFolderName('');
  };

  const handleRename = async () => {
    if (renameCollectionId !== null && folderCollectionId !== null && isRenamingFolder) {
      // Renaming a folder
      try {
        await renameFolderAndRefresh(folderCollectionId, renameCollectionId, newCollectionName);
        console.log(`Renamed folder ${renameCollectionId} to ${newCollectionName} in collection ${folderCollectionId}`);
        setIsRenameModalOpen(false);
        setNewCollectionName('');
        setRenameCollectionId(null);
        setFolderCollectionId(null);
        setRenameFolderId(null);
        setIsRenamingFolder(false);
      } catch (error) {
        console.error(`Failed to rename folder ${renameCollectionId}:`, error);
      }
    } else if (renameCollectionId !== null) {
      // Renaming a collection
      try {
        await renameCollectionAndRefresh(renameCollectionId, newCollectionName);
        console.log(`Renamed collection ${renameCollectionId} to ${newCollectionName}`);
        setIsRenameModalOpen(false);
        setNewCollectionName('');
        setRenameCollectionId(null);
      } catch (error) {
        console.error(`Failed to rename collection ${renameCollectionId}:`, error);
      }
    }
  };

  const handleAddFolder = async (newfolderNameParam : string) => {
    if (folderCollectionId !== null && newfolderNameParam.trim()) {
      try {
        await addFolder(folderCollectionId, newfolderNameParam);
        console.log(`Added folder "${newfolderNameParam}" to collection ${folderCollectionId}`);
        handleCloseFolderModal();
      } catch (error) {
        console.error(`Failed to add folder:`, error);
      }
    }
  };

  const handleMenuClick = async (key: string, collectionId: string, folderId?: string) => {
    switch (key) {
      case 'addRequest':
        const newRequest = prepareEmptyRequest(collectionId);
        addRequest(newRequest);
        setSelectedRequestId && setSelectedRequestId?.(newRequest.id);
        console.log(`Added request to collection ${collectionId}`);
        break;
      case 'addFolder':
        // if (folderId) {
          handleOpenFolderModal(collectionId);
        // }
        break;
      case 'rename':
        setRenameCollectionId(collectionId);
        setIsRenameModalOpen(true);
        break;
      case 'delete':
        try {
          await deleteCollectionAndRefresh(collectionId);
          console.log(`Deleted collection ${collectionId}`);
        } catch (error) {
          console.error(`Failed to delete collection ${collectionId}:`, error);
        }
        break;
      default:
        break;
    }
  };

  const handleFolderMenuClick = async (key: string, collectionId: string, folderId: string) => {
    switch (key) {
      case 'addRequest':
        const newRequest = prepareEmptyRequest(collectionId);
        addRequest(newRequest);
        setSelectedRequestId && setSelectedRequestId?.(newRequest.id);
        console.log(`Added request to folder ${folderId} in collection ${collectionId}`);
        break;
      case 'rename':
        setRenameCollectionId(folderId);
        setFolderCollectionId(collectionId);
        setRenameFolderId(folderId);
        setIsRenamingFolder(true);
        setIsRenameModalOpen(true);
        break;
      case 'delete':
        try {
          await deleteFolder(collectionId, folderId);
          console.log(`Deleted folder ${folderId} from collection ${collectionId}`);
          refreshCollections();
        } catch (error) {
          console.error(`Failed to delete folder:`, error);
        }
        break;
      default:
        break;
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const handleFilterChange = (value: string) => {
    setFilterMethod(value);
  };

  const handleRefreshCollections = () => {
    const event = new Event('refreshCollections');
    window.dispatchEvent(event);
  };

  useEffect(() => {
    const fetchCollections = async () => {
      const updatedData = collections.map((collection) => {
        const collectionItem: {
          key: string;
          title: JSX.Element;
          children: Array<{
            key: string;
            title: JSX.Element;
            isLeaf?: boolean;
            children?: Array<{
              key: string;
              title: JSX.Element;
              isLeaf?: boolean;
            }>;
          }>;
        } = {
          key: `${collection.id}`,
          title: (
            <span style={{ display: 'flex', justifyContent: 'space-between', }}>
              <span>
                <FolderFilled />
                <span style={{marginLeft: '5px'}}>{collection.name}</span>
              </span>
              <Dropdown
                overlay={
                  <Menu
                    onClick={(info) => handleMenuClick(info.key as string, collection.id)}
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
            </span>
          ),
          children: []
        };

        // Add folders as children
        if (collection.folders && collection.folders.length > 0) {
          collectionItem.children = collection.folders.map((folder: CollectionFolder) => ({
            key: folder.id,
            title: (
              <span style={{ display: 'flex', justifyContent: 'space-between', }}>
                <span>
                  <FolderTwoTone />
                  <span style={{marginLeft: '5px'}}>{folder.name}</span>
                </span>
                <Dropdown
                  overlay={
                    <Menu
                      onClick={(info) => handleFolderMenuClick(info.key as string, collection.id, folder.id)}
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
              </span>
            ),
            children: folder.requests
              .filter((request) =>
                (!searchTerm || request.name.toLowerCase().includes(searchTerm.toLowerCase())) &&
                (!filterMethod || request.method === filterMethod)
              )
              .map((request) => ({
                key: `${request.id}`,
                title: (
                  <div
                    style={{
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                    onClick={() => {
                      const isAlreadyOpened = openedRequests.some((req) => req.id === request.id);
                      if (isAlreadyOpened) {
                        setSelectedRequestId && setSelectedRequestId(request.id);
                      } else {
                        addRequest(request);
                        setSelectedRequestId && setSelectedRequestId(request.id);
                      }
                    }}
                  >
                    <FileFilled />
                    <span style={{marginLeft: '5px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{request.name}</span>
                  </div>
                ),
                isLeaf: true,
              }))
          }));
        }

        // Add direct requests (not in folders)
        if (collection.requests && collection.requests.length > 0) {
          const directRequests = collection.requests
            .filter((request) =>
              (!searchTerm || request.name.toLowerCase().includes(searchTerm.toLowerCase())) &&
              (!filterMethod || request.method === filterMethod)
            )
            .map((request) => ({
              key: `${request.id}`,
              title: (
                <div
                  style={{
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                  onClick={() => {
                    const isAlreadyOpened = openedRequests.some((req) => req.id === request.id);
                    if (isAlreadyOpened) {
                      setSelectedRequestId && setSelectedRequestId(request.id);
                    } else {
                      addRequest(request);
                      setSelectedRequestId && setSelectedRequestId(request.id);
                    }
                  }}
                >
                  <FileFilled />
                  <span style={{marginLeft: '5px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{request.name}</span>
                </div>
              ),
              isLeaf: true,
            }));
          
          collectionItem.children = [...(collectionItem.children || []), ...directRequests];
        }

        return collectionItem;
      });
      setTreeData(updatedData);
    };

    fetchCollections();

    const handleRefresh = () => fetchCollections();
    window.addEventListener('refreshCollections', handleRefresh);

    return () => {
      window.removeEventListener('refreshCollections', handleRefresh);
    };
  }, [collections, searchTerm, filterMethod]);

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ fontWeight: 'bold', textAlign: 'center', margin: 0 }}>Collections</h3>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button type="primary" onClick={handleOpenModal} icon={<PlusOutlined />} />
          <Button type="default" onClick={handleRefreshCollections} icon={<ReloadOutlined />} />
          <Button
            type="default"
            onClick={handleOpenImportModal}
            icon={<DatabaseFilled />}
            title="Import Collection"
          />
          <ImportCurlButton />
        </div>
      </div>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
        <Search
          placeholder="Search requests by name"
          onSearch={handleSearch}
          style={{ width: '70%' }}
          allowClear
        />
        <Select
          placeholder="Filter by method"
          onChange={handleFilterChange}
          allowClear
          style={{ width: '30%' }}
        >
          <Select.Option value="GET">GET</Select.Option>
          <Select.Option value="POST">POST</Select.Option>
          <Select.Option value="PUT">PUT</Select.Option>
          <Select.Option value="DELETE">DELETE</Select.Option>
        </Select>
        <Button type="default" onClick={handleRefreshCollections} icon={<ReloadOutlined />} />
      </div>
      <Tree
        showLine={{ showLeafIcon: false }}
        defaultExpandedKeys={treeData.length > 0 ? [`${treeData[0].key}`]:[]}
        treeData={treeData}        
        blockNode
      />
      <AddCollectionModal isOpen={isModalOpen} onClose={handleCloseModal} />
      <ImportPostmanCollection visible={isImportModalOpen} onClose={handleCloseImportModal} />
      <AddFolderModal
        isOpen={isFolderModalOpen}
        onClose={handleCloseFolderModal}
        onAddFolder={handleAddFolder}
        collectionId={folderCollectionId || ''}
      />
      <Modal
        title={isRenamingFolder ? "Rename Folder" : "Rename Collection"}
        open={isRenameModalOpen}
        onOk={handleRename}
        onCancel={() => {
          setIsRenameModalOpen(false);
          setRenameCollectionId(null);
          setFolderCollectionId(null);
          setRenameFolderId(null);
          setIsRenamingFolder(false);
          setNewCollectionName('');
        }}
        okText="Rename"
        cancelText="Cancel"
      >
        <Input
          placeholder={isRenamingFolder ? "Enter new folder name" : "Enter new collection name"}
          value={newCollectionName}
          onChange={(e) => setNewCollectionName(e.target.value)}
        />
      </Modal>
    </>
  );
};

export default Collections;
