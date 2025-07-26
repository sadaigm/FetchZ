import { Button, Tree, Dropdown, Menu, Modal, Input, Select } from 'antd';
import { FileTwoTone, FolderOutlined, FolderTwoTone, MoreOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import React, { useEffect, useState } from 'react';
import AddCollectionModal from './AddCollectionModal';
import ImportCurlButton from './ImportCurlButton';
import { fetchAndFormatCollections, renameCollectionAndRefresh, deleteCollectionAndRefresh, prepareEmptyRequest } from '../../utils/collection-utils';
import { useRequestContext } from '../../context/RequestProvider';
import { useCollectionContext } from '../../context/CollectionProvider';
import type { WebRsRequest } from '../../types/request.types';
import { parseCurlScript } from '../../utils/curl-parser';


const { DirectoryTree } = Tree;
const { Search } = Input;


const Collections: React.FC = () => {
  const { addRequest, setSelectedRequestId, openedRequests } = useRequestContext();
  const { collections } = useCollectionContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [treeData, setTreeData] = useState<any[]>([]);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [renameCollectionId, setRenameCollectionId] = useState<string | null>(null);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMethod, setFilterMethod] = useState<string | null>(null);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleRename = async () => {
    if (renameCollectionId !== null) {
      try {
        await renameCollectionAndRefresh(renameCollectionId, newCollectionName);
        console.log(`Renamed collection ${renameCollectionId} to ${newCollectionName}`);
        setIsRenameModalOpen(false);
        setNewCollectionName('');
      } catch (error) {
        console.error(`Failed to rename collection ${renameCollectionId}:`, error);
      }
    }
  };

  const handleMenuClick = async (key: string, collectionId: string) => {
    switch (key) {
      case 'addRequest':
        const newRequest = prepareEmptyRequest(collectionId);
        addRequest(newRequest);
        setSelectedRequestId && setSelectedRequestId?.(newRequest.id);
        console.log(`Added request to collection ${collectionId}`);
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
      const updatedData = collections.map((collection) => ({
        key: `${collection.id}`,
        title: (
          <span style={{ display: 'flex', justifyContent: 'space-between', }}>
            <span>
              <FolderTwoTone />
              <span style={{marginLeft: '5px'}}>{collection.name}</span>
            </span>
            <Dropdown
              overlay={
                <Menu
                  onClick={(info) => handleMenuClick(info.key as string, collection.id)}
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
        children: collection.requests
          .filter((request) =>
            (!searchTerm || request.name.toLowerCase().includes(searchTerm.toLowerCase())) &&
            (!filterMethod || request.method === filterMethod)
          )
          .map((request) => ({
            key: `${request.id}`,
            title: (
              <span
                style={{ cursor: 'pointer' }}
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
                <FileTwoTone />
                <span style={{marginLeft: '5px'}}>{request.name}</span>
              </span>
            ),
            isLeaf: true,
          })),
      }));
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
      <Modal
        title="Rename Collection"
        open={isRenameModalOpen}
        onOk={handleRename}
        onCancel={() => setIsRenameModalOpen(false)}
        okText="Rename"
        cancelText="Cancel"
      >
        <Input
          placeholder="Enter new collection name"
          value={newCollectionName}
          onChange={(e) => setNewCollectionName(e.target.value)}
        />
      </Modal>
    </>
  );
};

export default Collections;
