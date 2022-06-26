import React, { useContext, useEffect, useState } from 'react';
import 'antd/dist/antd.css';
import {
  Button,
  Cascader,
  Divider,
  Form,
  Input,
  Space,
  InputNumber,
  Radio,
  Col,
  Table,
  Row,
  TreeSelect
} from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { AuthContext } from '../../shared/context/auth-context';
import { useHttpClient } from '../../shared/hooks/http-hook';
import { httpMethods } from '../../shared/hooks/enum';

const formItemLayout = {
  layout: 'horizontal',
  labelCol: {
    xs: { span: 6 }
  },
  wrapperCol: {
    xs: { span: 24 }
  }
};

const conditionsOptions = [
  {
    value: 'title',
    label: 'Title',
    children: [
      {
        value: 'EQUAL',
        label: 'Equal'
      },
      {
        value: 'CONTAINS',
        label: 'Contains'
      },
      {
        value: 'START_WITH',
        label: 'Start With'
      },
      {
        value: 'END_WITH',
        label: 'End With'
      }
    ]
  },
  {
    value: 'price',
    label: 'Price',
    children: [
      {
        value: 'EQUAL',
        label: 'Equal'
      },
      {
        value: 'BETWEEN',
        label: 'Between'
      },
      {
        value: 'GREATER_THEN',
        label: 'Greater Then'
      },
      {
        value: 'LESS_THEN',
        label: 'Less Then'
      }
    ]
  },
  {
    value: 'source',
    label: 'Source',
    children: [
      {
        value: 'BANK_HAPOALIM',
        label: 'Bank Hapoalim'
      },
      {
        value: 'ISRACARD',
        label: 'Isracard'
      }
    ]
  }
];

const validateMessages = {
  required: '${label} is required!',
  types: {
    email: '${label} is not a valid email!',
    number: '${label} is not a valid number!'
  },
  number: {
    range: '${label} must be between ${min} and ${max}'
  }
};

const Rules = () => {
  const auth = useContext(AuthContext);
  const { sendRequest } = useHttpClient();
  const [form] = Form.useForm();
  const [rules, setRules] = useState([]);
  const [users, setUsers] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const { categorySelected } = useState([]);

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
        return {
          ...rule,
          key: rule.id,
          description_conditions: stringDescription,
          price_conditions: stringPrice
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
    return await sendRequest(
      `${process.env.REACT_APP_SERVER_URL}/rules`,
      httpMethods.Post,
      auth.token,
      JSON.stringify(values),
      {
        'Content-Type': 'application/json'
      }
    );
  };

  const handleCategoryChanged = (value) => {
    console.log(value);
  };

  const onOptionChanged = (value, key) => {
    console.log(value);
    console.log(key);
    // const fields = form.getFieldsValue()
    // const { projects } = fields
    // Object.assign(projects[key], { type: value })
    // form.setFieldsValue({ projects })
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
          title: 'Source',
          dataIndex: 'source'
        },
        {
          title: 'Type',
          dataIndex: 'type'
        }
      ]
    },
    {
      title: 'Set Values',
      key: 'set_values',
      children: [
        {
          title: 'Category',
          dataIndex: 'category'
        },
        {
          title: 'Title',
          dataIndex: 'title'
        },
        {
          title: 'Archived',
          dataIndex: 'archived'
        }
      ]
    }
  ];

  return (
    <>
      <Row>
        <Col span={24}>
          <Table dataSource={rules} columns={columns} bordered />;
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          <Form
            {...formItemLayout}
            form={form}
            name="nest-messages"
            onFinish={onFinish}
            validateMessages={validateMessages}>
            <Form.Item
              name={['config', 'title']}
              label="Title"
              rules={[
                {
                  required: true
                }
              ]}>
              <Input />
            </Form.Item>
            <Divider>Conditions</Divider>
            <Form.List name="conditions">
              {(fields, { add, remove }) => (
                <>
                  {fields.map((field) => (
                    <Space key={field.key} align="baseline">
                      <Form.Item
                        {...field}
                        name={[field.name, 'option']}
                        label="Condition"
                        rules={[{ type: 'array' }]}>
                        <Cascader
                          options={conditionsOptions}
                          style={{ width: 200 }}
                          onChange={(e) => onOptionChanged(e, field.key)}
                        />
                      </Form.Item>
                      <Form.Item
                        {...field}
                        label="Value"
                        name={[field.name, 'value']}
                        rules={[
                          {
                            required: true,
                            message: 'Missing value'
                          }
                        ]}>
                        <Input />
                      </Form.Item>
                      <Form.Item>
                        <Input.Group>
                          <InputNumber
                            style={{
                              width: 100,
                              textAlign: 'center'
                            }}
                            addonAfter="₪"
                            placeholder="Minimum"
                          />
                          <Input
                            className="site-input-split"
                            style={{
                              width: 30,
                              borderLeft: 0,
                              borderRight: 0,
                              pointerEvents: 'none'
                            }}
                            placeholder="~"
                            disabled
                          />
                          <InputNumber
                            className="site-input-right"
                            style={{
                              width: 100,
                              textAlign: 'center'
                            }}
                            addonAfter="₪"
                            placeholder="Maximum"
                          />
                        </Input.Group>
                      </Form.Item>
                      <MinusCircleOutlined onClick={() => remove(field.name)} />
                    </Space>
                  ))}

                  <Form.Item>
                    <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                      Add sights
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
            <Divider>Values</Divider>
            <Form.Item name={['value', 'title']} label="Title">
              <Input />
            </Form.Item>
            <Form.Item name={['value', 'category']} label="Category">
              <TreeSelect
                style={{ width: '100%' }}
                value={categorySelected}
                dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                treeData={categoryList}
                placeholder="Please select"
                treeDefaultExpandAll
                onChange={handleCategoryChanged}
                allowClear={true}
              />
            </Form.Item>

            <Form.Item name={['value', 'archived']} label="Archived">
              <Radio.Group defaultValue="NO" size="small">
                <Radio.Button value="NO">No</Radio.Button>
                <Radio.Button value="YES">Yes</Radio.Button>
              </Radio.Group>
            </Form.Item>
            <Form.Item wrapperCol={{ ...formItemLayout.wrapperCol, offset: 8 }}>
              <Button type="primary" htmlType="submit">
                Submit
              </Button>
            </Form.Item>
          </Form>
        </Col>
      </Row>
    </>
  );
};

export default Rules;
