import React, { useContext, useEffect, useState } from 'react';
import 'antd/dist/antd.css';
import { Col, Popconfirm, Row, Space, Table } from 'antd';
import { AuthContext } from '../../shared/context/auth-context';
import { useHttpClient } from '../../shared/hooks/http-hook';
import { httpMethods } from '../../shared/hooks/enum';
import CreateRule from '../../roles/components/createRule';
import TransactionList from '../../transactions/components/TransactionsList';
import { DeleteOutlined, DownOutlined, PlayCircleOutlined } from '@ant-design/icons';
import { createNotification, notificationType } from '../../shared/Notification';

const Rules = () => {
  const auth = useContext(AuthContext);
  const { sendRequest } = useHttpClient();
  const [rules, setRules] = useState([]);
  const [users, setUsers] = useState([]);
  const [categoryListFlat, setCategoryListFlat] = useState([]);
  const [categoryList, setCategoryList] = useState([]);

  useEffect(async () => {
    try {
      console.log(users);
      const rules = await getRules();
      const initData = await getInitData();
      setUsers(initData.users);
      setCategoryList(initData.categories);
      const flatCategories = getFlatCategories(initData.categories);
      setCategoryListFlat(flatCategories);
      const ruleData = rules.map((rule) => {
        let stringDescription = '';
        let stringPrice = '';
        if (rule.conditions.title.length !== 0) {
          const descriptionConditions = rule.conditions.title.map((condition) => {
            if (condition.comparisonFunction === 'CONTAINS') {
              return `Contains "${condition.value}"`;
            }
            if (condition.comparisonFunction === 'EQUAL') {
              return `Equal to "${condition.value}"`;
            }
            if (condition.comparisonFunction === 'START_WITH') {
              return `Start with "${condition.value}"`;
            }
            if (condition.comparisonFunction === 'END_WITH') {
              return `End with "${condition.value}"`;
            }
          });
          stringDescription = descriptionConditions.join(' and ');
        } else {
          stringDescription = 'None';
        }
        if (rule.conditions.price.length !== 0) {
          const priceConditions = rule.conditions.price.map((condition) => {
            if (condition.comparisonFunction === 'GREATER_EQUAL_THEN') {
              return `Greater or Equal to "${condition.value}"`;
            }
            if (condition.comparisonFunction === 'EQUAL') {
              return `Equal to "${condition.value}"`;
            }
            if (condition.comparisonFunction === 'LESS_EQUAL_THEN') {
              return `Less or Equal to "${condition.value}"`;
            }
          });
          stringPrice = priceConditions.join(' and ');
        } else {
          stringPrice = 'None';
        }

        const setValues = JSON.parse(rule.value);
        const setData = {
          setTitle: setValues.title,
          setCategory: setValues.category,
          setArchived: setValues.isArchived
        };
        return {
          ...rule,
          key: rule.id,
          description_conditions: stringDescription,
          price_conditions: stringPrice,
          ...setData
        };
      });
      console.log(ruleData);
      setRules(ruleData);
    } catch (err) {
      console.log(err);
    }
  }, []);

  const getFlatCategories = (members) => {
    let children = [];
    const flattenMembers = members.map((m) => {
      if (m.children && m.children.length) {
        children = [...children, ...m.children];
      }
      return m;
    });

    return flattenMembers.concat(children.length ? getFlatCategories(children) : children);
  };

  const handleDelete = async (id: number) => {
    const responseData = await sendRequest(
      `${process.env.REACT_APP_SERVER_URL}/rules/${id}`,
      httpMethods.Delete,
      auth.token
    );
    if (responseData?.type === 1) {
      const newRules = [...rules].filter((rule) => rule.id !== id);
      setRules(newRules);
      createNotification(
        notificationType.Success,
        `Rule deleted successfully. ${responseData.data.transactions.length} has been reset`
      );
      // await updateTransactions();
    } else {
      createNotification(notificationType.Error, 'failed to delete rule');
    }
  };

  const handleRunRule = async (id: number) => {
    const responseData = await sendRequest(
      `${process.env.REACT_APP_SERVER_URL}/rules/${id}/run`,
      httpMethods.Post,
      auth.token
    );
    if (responseData?.type === 1) {
      createNotification(
        notificationType.Success,
        `Rule run successfully. ${responseData.data.transactions.length} has been set`
      );
    } else {
      createNotification(notificationType.Error, 'failed to run rule');
    }
  };

  const expandedRowRender = (row) => {
    console.log(row);
    return (
      <Row>
        <Col span={12}>
          <TransactionList
            filters={{ matchRuleId: row.id }}
            addAction={false}
            columnsType="minimize"
          />
        </Col>
        <Col span={12}>
          <TransactionList filters={{ ruleId: row.id }} addAction={false} columnsType="full" />
        </Col>
      </Row>
    );
  };

  const getInitData = async () => {
    const response = await sendRequest(
      `${process.env.REACT_APP_SERVER_URL}/transactions/initData`,
      httpMethods.Get,
      auth.token
    );
    return response.data;
  };

  const getRules = async () => {
    return await sendRequest(
      `${process.env.REACT_APP_SERVER_URL}/rules`,
      httpMethods.Get,
      auth.token
    );
  };

  const onFinish = async (values) => {
    values.conditions = values.conditions.map((condition) => {
      return {
        field: condition.option[0],
        comparisonFunction: condition.option[1],
        value: condition.value,
        isNegative: condition.isNegative || false
      };
    });
    values.type = values.type ?? 'EXPENSE';
    values.value.isArchived = values.value.isArchived === 'YES';
    return await sendRequest(
      `${process.env.REACT_APP_SERVER_URL}/rules`,
      httpMethods.Post,
      auth.token,
      JSON.stringify(values)
    );
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id'
    },
    {
      title: 'Title',
      dataIndex: 'title'
    },
    {
      title: 'Conditions',
      key: 'conditions',
      children: [
        {
          title: 'Description',
          dataIndex: 'description_conditions'
        },
        {
          title: 'Price',
          dataIndex: 'price_conditions'
        },
        {
          title: 'Type',
          dataIndex: 'type',
          render: (type) => {
            if (type === null) return 'Not Defined';
            if (type === 'INCOME') return 'Income';
            if (type === 'EXPENSE') return 'Expense';
            return 'Unknown';
          }
        }
      ]
    },
    {
      title: 'Values',
      key: 'value',
      children: [
        {
          title: 'Title',
          dataIndex: 'setTitle'
        },
        {
          title: 'Category',
          dataIndex: 'setCategory',
          render: (categoryId) => {
            if (categoryId) {
              return (
                categoryListFlat.find((category) => category.id == categoryId)?.title ??
                `not found - ${categoryId}`
              );

              // console.log(categories);
              // if (categories > 0) {
              //   return categories[0]?.title;
              // } else {
              //   return `not found - ${categoryId}`;
              // }
            } else {
              return '---';
            }
          }
        },
        {
          title: 'Archived',
          dataIndex: 'setArchived',
          render: (isArchived) => {
            return isArchived ? 'Yes' : 'No';
          }
        },
        {
          title: 'Action',
          key: 'action',
          sorter: true,
          render: (_, record) => (
            <Space size="middle">
              <Popconfirm title="Sure to run rule?" onConfirm={() => handleRunRule(record.id)}>
                <PlayCircleOutlined />
              </Popconfirm>
              <Popconfirm
                title="Sure to delete? will reset related transactions"
                onConfirm={() => handleDelete(record.id)}>
                <DeleteOutlined />
              </Popconfirm>
            </Space>
          )
        }
      ]
    }
  ];

  return (
    <>
      <Row gutter={[16, 24]}>
        <Col span={24}>
          <Table
            dataSource={rules}
            columns={columns}
            bordered
            expandable={{
              expandedRowRender,
              defaultExpandedRowKeys: ['0']
            }}
          />
        </Col>
      </Row>
      <Row>
        <Col xs={16} sm={16} md={20} lg={20} xl={20}>
          <CreateRule categories={categoryList} submitRule={onFinish} />
        </Col>
      </Row>
    </>
  );
};

export default Rules;
