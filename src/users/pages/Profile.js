import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../shared/context/auth-context';
import { useHttpClient } from '../../shared/hooks/http-hook';
import { httpMethods } from '../../shared/hooks/enum';
import { Button, Col, Form, Input, Row } from 'antd';
import Text from 'antd/es/typography/Text';
import { Link } from 'react-router-dom';
import { createNotification, notificationType } from '../../shared/Notification';

const Profile = () => {
  const auth = useContext(AuthContext);
  const [userData, setUserData] = useState(null);
  const { sendRequest } = useHttpClient();
  const [form] = Form.useForm();

  useEffect(async () => {
    try {
      console.log(auth.token);
      const responseData = await sendRequest(
        `${process.env.REACT_APP_SERVER_URL}/users/info`,
        httpMethods.Get,
        auth.token
      );
      setUserData(responseData.data);
    } catch (err) {
      console.log(err);
    }
  }, []);

  const onFinish = async (event) => {
    const response = await updateUser(auth.userId, event);
    if (response?.type === 1) {
      createNotification(notificationType.Success, 'User updated successfully');
    } else {
      createNotification(notificationType.Error, 'Failed to update user');
    }
  };

  const updateUser = async (userId, userDate) => {
    return await sendRequest(
      `${process.env.REACT_APP_SERVER_URL}/users`,
      httpMethods.Patch,
      auth.token,
      JSON.stringify({
        ...userDate
      }),
      {
        'Content-Type': 'application/json'
      }
    );
  };

  const formLayout = {
    labelCol: {
      span: 4
    },
    wrapperCol: {
      span: 14
    }
  };
  // accountId: 1
  // email: "ofirle92@gmail.com"
  // id: 1
  // image: "https://d1csarkz8obe9u.cloudfront.net/posterpreviews/man-vector-design-template-1ba90da9b45ecf00ceb3b8ae442ad32c_screen.jpg?ts=1601484738"
  // name: "Ofir Levy"
  // password: "$2b$10$fn6EKws1bapyISsycM6Ku.oaSJQmzVqVlg/iwZhQ4DfmKX.6M15Xi"
  // role: {id: 1, key: "SUPER_ADMIN", title: "Super Admin",…}
  // username: "ofirle"
  if (userData) {
    return (
      <>
        <Row>
          <Col span={16}>
            <Form
              name="filters"
              onFinish={onFinish}
              {...formLayout}
              layout="horizontal"
              form={form}
              initialValues={{
                name: userData.name,
                username: userData.username,
                role: userData.role.title,
                email: userData.email
              }}>
              <Form.Item name="name" label="Full Name" rules={[{ required: true }]}>
                <Input placeholder="please enter full name..." />
              </Form.Item>
              <Form.Item name="username" label="Username" rules={[{ required: true }]}>
                <Input placeholder="please enter full name..." />
              </Form.Item>
              <Form.Item name="email" label="email" type="email" rules={[{ required: true }]}>
                <Input placeholder="please enter email..." />
              </Form.Item>
              <Form.Item label="Role">
                <Text keyboard>{userData.role.title}</Text>
              </Form.Item>
              <Form.Item label="Account">
                <Text keyboard>{userData.account.title}</Text>
              </Form.Item>
              <Form.Item label="password">
                <Link href="https://ant.design" target="_blank">
                  Change Password
                </Link>
              </Form.Item>
              <Form.Item wrapperCol={{ xs: { span: 12 }, offset: 4 }}>
                <Button type="primary" htmlType="submit">
                  Update
                </Button>
              </Form.Item>
            </Form>
          </Col>
        </Row>
      </>
    );
  } else {
    return 'hello';
  }
};

export default Profile;
