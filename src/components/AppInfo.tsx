import React, { useState } from 'react';
import { Modal } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';

const AppInfo: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = () => {
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  return (
    <>
      <InfoCircleOutlined
        style={{ fontSize: '24px', cursor: 'pointer' }}
        onClick={showModal}
      />
      <Modal
        title="About FetchZ"
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <p>
          FetchZ is a user-friendly tool for managing API requests locally. It
          allows you to organize your API requests in a folder structure without
          requiring a cloud login, making it ideal for developers who value
          simplicity and control.
        </p>
      </Modal>
    </>
  );
};

export default AppInfo;
