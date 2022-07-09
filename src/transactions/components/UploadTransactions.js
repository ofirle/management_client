import React, { useContext, useState } from 'react';
import './../pages/Transactions.css';
import 'antd/dist/antd.css';

import { AuthContext } from '../../shared/context/auth-context';
import { Button, Upload, message, Select } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { httpMethods } from '../../shared/hooks/enum';
import { useHttpClient } from '../../shared/hooks/http-hook';
import { Option } from 'antd/es/mentions';
import PropTypes from 'prop-types';

const UploadTransactions = ({ handleFileUploaded }) => {
  const auth = useContext(AuthContext);
  const { sendRequest } = useHttpClient();
  const [source, setSource] = useState('ISRACARD');
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);

  const props = {
    onRemove: (file) => {
      const index = fileList.indexOf(file);
      const newFileList = fileList.slice();
      newFileList.splice(index, 1);
      setFileList(newFileList);
    },
    beforeUpload: (file) => {
      setFileList([...fileList, file]);
      return false;
    },
    fileList
    //
    //   async onChange(info) {
    //     if (info.file.status !== 'uploading') {
    //       console.log(info.file);
    //       console.log(info);
    //     }
    //
    //     if (info.file.status === 'done') {
    //       const formData = new FormData();
    //       formData.append('file', info.file.originFileObj);
    //       formData.append('source', source);
    //       const response = await sendRequest(
    //         `${process.env.REACT_APP_SERVER_URL}/transactions/read_file`,
    //         httpMethods.Post,
    //         auth.token,
    //         formData,
    //         {
    //           'Content-Type': 'multipart/form-data'
    //         }
    //       );
    //       console.log(response.data);
    //       await handleFileUploaded();
    //
    //       message.success(`${response.data.length} new transactions has been added`);
    //     } else if (info.file.status === 'error') {
    //       message.error(`${info.file.name} file upload failed.`);
    //     }
    //   }
  };

  const handleUpload = async () => {
    // const formData = new FormData();
    // formData.append('file', info.file.originFileObj);
    // formData.append('source', source);
    // const response = await sendRequest(
    //     `${process.env.REACT_APP_SERVER_URL}/transactions/read_file`,
    //     httpMethods.Post,
    //     auth.token,
    //     formData,
    //     {
    //       'Content-Type': 'multipart/form-data'
    //     }
    // );
    // console.log(response.data);

    const formData = new FormData();
    fileList.forEach((file) => {
      formData.append('file', file);
    });
    formData.append('source', source);
    setUploading(true); // You can use any AJAX library you like

    const response = await sendRequest(
      `${process.env.REACT_APP_SERVER_URL}/transactions/read_file`,
      httpMethods.Post,
      auth.token,
      formData,
      {
        'Content-Type': 'multipart/form-data'
      }
    );
    setUploading(false);
    message.success(`${response.data.length} new transactions has been added`);
    await handleFileUploaded();
    console.log(response.data);
  };

  const handleTypeChanged = (event) => {
    console.log(event);
    setSource(event);
  };

  return (
    <div>
      <Select
        defaultValue="ISRACARD"
        style={{
          width: 120
        }}
        onChange={handleTypeChanged}>
        <Option value="ISRACARD">Isracard</Option>
        <Option value="OTSAR_AHAYAL">Bank Otsar Ahayal</Option>
      </Select>
      {/*<Upload {...props}>*/}
      {/*  <Button icon={<UploadOutlined />}>Click to Upload</Button>*/}
      {/*</Upload>*/}

      <Upload {...props}>
        <Button icon={<UploadOutlined />}>Select File</Button>
      </Upload>
      <Button
        type="primary"
        onClick={handleUpload}
        disabled={fileList.length === 0}
        loading={uploading}
        style={{
          marginTop: 16
        }}>
        {uploading ? 'Uploading' : 'Start Upload'}
      </Button>
    </div>
  );
};

UploadTransactions.propTypes = {
  handleFileUploaded: PropTypes.func.isRequired
};

export default UploadTransactions;
