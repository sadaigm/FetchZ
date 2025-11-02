import { message } from 'antd';
import { useCollectionContext } from '../../context/CollectionProvider';
import { useRequestContext } from '../../context/RequestProvider';
import { prepareEmptyRequest, deleteCollectionAndRefresh } from '../../utils/collection-utils';

// For use within FolderItem component
export const useFolderItemHandlers = (onRename?: (collectionId: string, folderId: string) => void) => {
  const { addFolder, deleteFolder, addRequestToFolder, refreshCollections } = useCollectionContext();
  const { addRequest, setSelectedRequestId } = useRequestContext();

  const handleFolderMenuClick = async (key: string, collectionId: string, folderId: string) => {
    switch (key) {
      case 'addRequest':
        const newRequest = prepareEmptyRequest(collectionId);
        addRequest(newRequest);
        setSelectedRequestId && setSelectedRequestId?.(newRequest.id);
        console.log(`Added request to folder ${folderId} in collection ${collectionId}`);
        break;
      case 'rename':
        if (onRename) {
          onRename(collectionId, folderId);
        }
        break;
      case 'delete':
        try {
          await deleteFolder(collectionId, folderId);
          console.log(`Deleted folder ${folderId} from collection ${collectionId}`);
          message.success('Folder deleted successfully');
          refreshCollections();
        } catch (error) {
          console.error(`Failed to delete folder:`, error);
          message.error('Failed to delete folder');
        }
        break;
      default:
        break;
    }
  };

  return { handleFolderMenuClick };
};

// For use within CollectionItem component
export const useCollectionMenuHandlers = () => {
  const { addFolder } = useCollectionContext();
  const { addRequest, setSelectedRequestId } = useRequestContext();

  const handleCollectionMenuClick = async (key: string, collectionId: string) => {
    switch (key) {
      case 'addRequest':
        const newRequest = prepareEmptyRequest(collectionId);
        addRequest(newRequest);
        setSelectedRequestId && setSelectedRequestId?.(newRequest.id);
        console.log(`Added request to collection ${collectionId}`);
        break;
      case 'addFolder':
        // This will be handled by the parent component that has access to the add folder modal
        console.log(`Add folder to collection ${collectionId}`);
        break;
      case 'delete':
        try {
          await deleteCollectionAndRefresh(collectionId);
          console.log(`Deleted collection ${collectionId}`);
        } catch (error) {
          console.error(`Failed to delete collection:`, error);
        }
        break;
      default:
        break;
    }
  };

  return { handleCollectionMenuClick };
};