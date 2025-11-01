import React, { useState } from 'react';
import { Modal, Avatar, Tooltip, theme } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';

const AppInfo: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { token } = theme.useToken();

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
      <Tooltip title="About FetchZ">
        <Avatar
          onClick={showModal}
          style={{
            backgroundColor: 'transparent',
            cursor: 'pointer',
            border: `1px solid ${token.colorBorder}`,
            color: token.colorText,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          size="small"
          icon={<InfoCircleOutlined />}
        />
      </Tooltip>
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
