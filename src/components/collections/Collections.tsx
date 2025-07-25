import { Button, Tree, Dropdown, Menu, Modal, Input } from 'antd';
import { MoreOutlined, PlusOutlined } from '@ant-design/icons';
import React, { useEffect, useState } from 'react';
import AddCollectionModal from './AddCollectionModal';
import { fetchAndFormatCollections, renameCollectionAndRefresh, deleteCollectionAndRefresh, prepareEmptyRequest } from '../../utils/collection-utils';
import { useRequestContext } from '../../context/RequestProvider';
import type { WebRsRequest } from '../../types/request.types';

const Collections: React.FC = () => {
  const { addRequest, setSelectedRequestId } = useRequestContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [treeData, setTreeData] = useState<any[]>([]);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [renameCollectionId, setRenameCollectionId] = useState<number | null>(null);
  const [newCollectionName, setNewCollectionName] = useState('');

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

  const handleMenuClick = async (key: string, collectionId: number) => {
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

  useEffect(() => {
    const fetchCollections = async () => {
      const formattedData = await fetchAndFormatCollections();
      const updatedData = formattedData.map((collection) => ({
        ...collection,
        title: (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{collection.title}</span>
            <Dropdown
              overlay={
                <Menu
                  onClick={({ key }) => handleMenuClick(key, collection.key)}
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
          </div>
        ),
      }));
      setTreeData(updatedData);
    };

    fetchCollections();

    const handleRefresh = () => fetchCollections();
    window.addEventListener('refreshCollections', handleRefresh);

    return () => {
      window.removeEventListener('refreshCollections', handleRefresh);
    };
  }, []);

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ fontWeight: 'bold', textAlign: 'center', margin: 0 }}>Collections</h3>
        <Button type="primary" onClick={handleOpenModal}
        icon={<PlusOutlined />}
        ></Button>
      </div>
      <Tree
        showLine={{ showLeafIcon: false }}
        defaultExpandedKeys={['0-0-0']}
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
