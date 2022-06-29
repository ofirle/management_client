import React, { useContext, useEffect, useState } from 'react';
import 'antd/dist/antd.css';
import { Col, Row, Table } from 'antd';
import { AuthContext } from '../../shared/context/auth-context';
import { useHttpClient } from '../../shared/hooks/http-hook';
import { httpMethods } from '../../shared/hooks/enum';
import CreateRule from '../../roles/components/createRule';

const Rules = () => {
  const auth = useContext(AuthContext);
  const { sendRequest } = useHttpClient();
  const [rules, setRules] = useState([]);
  const [users, setUsers] = useState([]);
  const [categoryList, setCategoryList] = useState([]);

  useEffect(async () => {
    try {
      console.log(users);
      const rules = await getRules();
      const initData = await getInitData();
      setUsers(initData.users);
      setCategoryList(initData.categories);
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
          dataIndex: 'setCategory'
        },
        {
          title: 'Archived',
          dataIndex: 'setArchived',
          render: (isArchived) => {
            return isArchived ? 'Yes' : 'No';
          }
        }
      ]
    }
  ];

  return (
    <>
      <Row gutter={[16, 24]}>
        <Col span={24}>
          <Table dataSource={rules} columns={columns} bordered />;
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
