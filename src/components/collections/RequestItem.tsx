import React from 'react';
import { FileFilled, MoreOutlined } from '@ant-design/icons';
import { Dropdown, Menu, message } from 'antd';
import { useRequestContext } from '../../context/RequestProvider';
import { useCollectionContext } from '../../context/CollectionProvider';
import type { WebRsRequest } from '../../types/request.types';

interface RequestItemProps {
  request: WebRsRequest;
  collectionId?: string;
  folderId?: string;
}

const RequestItem: React.FC<RequestItemProps> = ({
  request,
  collectionId,
  folderId
}) => {
  const { addRequest, setSelectedRequestId, openedRequests } = useRequestContext();
  const { removeRequestFromFolder, removeRequestFromCollection, refreshCollections } = useCollectionContext();

  const handleClick = () => {
    const isAlreadyOpened = openedRequests.some((req) => req.id === request.id);
    if (isAlreadyOpened) {
      setSelectedRequestId && setSelectedRequestId(request.id);
    } else {
      addRequest(request);
      setSelectedRequestId && setSelectedRequestId(request.id);
    }
  };

  const handleDeleteRequest = async () => {
    try {
      if (folderId && collectionId) {
        // Delete from folder
        await removeRequestFromFolder(collectionId, folderId, request.id);
        message.success('Request deleted from folder');
        refreshCollections();
      } else if (collectionId) {
        // Delete from collection
        await removeRequestFromCollection(collectionId, request.id);
        message.success('Request deleted from collection');
        refreshCollections();
      }
    } catch (error) {
      console.error('Error deleting request:', error);
      message.error('Failed to delete request');
    }
  };

  const handleMenuClick = (key: string) => {
    if (key === 'delete') {
      handleDeleteRequest();
    }
  };

  return (
    <div
      style={{
        cursor: 'pointer',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
      }}
    >
      <span
        style={{
          display: 'flex',
          alignItems: 'center',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          flex: 1
        }}
        onClick={handleClick}
      >
        <FileFilled />
        <span style={{marginLeft: '5px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{request.name}</span>
      </span>
      <Dropdown
        overlay={
          <Menu
            onClick={(info) => handleMenuClick(info.key)}
            items={[
              { key: 'delete', label: 'Delete' },
            ]}
          />
        }
        trigger={['click']}
      >
        <MoreOutlined style={{ cursor: 'pointer' }} />
      </Dropdown>
    </div>
  );
};

export default RequestItem;