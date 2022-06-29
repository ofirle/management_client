import React, { useState } from 'react';
import PropTypes from 'prop-types';

import {
  Button,
  Cascader,
  Divider,
  Form,
  Input,
  InputNumber,
  Radio,
  Space,
  TreeSelect
} from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';

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

const CreateRule = (props) => {
  const [form] = Form.useForm();
  const [conditionsField, setConditionsField] = useState([]);

  // const onFinish = async (values) => {
  //   values.conditions = values.conditions.map((condition) => {
  //     return {
  //       field: condition.option[0],
  //       comparisonFunction: condition.option[1],
  //       value: condition.value,
  //       isNegative: condition.isNegative || false
  //     };
  //   });
  //   values.type = values.type ?? 'EXPENSE';
  //   values.value.isArchived = values.value.isArchived === 'YES';
  //   console.log(values);
  //   return await sendRequest(
  //     `${process.env.REACT_APP_SERVER_URL}/rules`,
  //     httpMethods.Post,
  //     auth.token,
  //     JSON.stringify(values)
  //   );
  // };

  const handleCategoryChanged = (value) => {
    console.log(value);
  };

  const handleRowRemoved = (id) => {
    const currentConditionsField = [...conditionsField];
    const newConditionsField = currentConditionsField.splice(id, id);
    setConditionsField(newConditionsField);
  };

  const onOptionChanged = (value, id) => {
    const newConditionsField = [...conditionsField];
    if (conditionsField.length - 1 === id) {
      newConditionsField[id] = value[0];
    } else {
      newConditionsField[id] = value[0];
    }

    setConditionsField(newConditionsField);
  };

  return (
    <Form {...formItemLayout} form={form} name="nest-messages" onFinish={props.submitRule}>
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
      <Divider>Type</Divider>
      <Form.Item name="type" label="Type">
        <Radio.Group defaultValue="EXPENSE" size="small">
          <Radio.Button value="EXPENSE">Expense</Radio.Button>
          <Radio.Button value="INCOME">Income</Radio.Button>
        </Radio.Group>
      </Form.Item>
      <Divider>Conditions</Divider>
      <Form.List name="conditions">
        {(fields, { add, remove }) => (
          <span>
            {fields.map((field) => (
              <React.Fragment key={field.key}>
                <Space align="baseline">
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
                  {conditionsField[field.key] === 'title' && (
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
                  )}
                  {conditionsField[field.key] === 'price' && (
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
                  )}
                  <MinusCircleOutlined
                    onClick={() => {
                      remove(field.name);
                      handleRowRemoved(field.key);
                    }}
                  />
                </Space>
              </React.Fragment>
            ))}

            <Form.Item>
              <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                Add sights
              </Button>
            </Form.Item>
          </span>
        )}
      </Form.List>
      <Divider>Values</Divider>
      <Form.Item name={['value', 'title']} label="Title">
        <Input />
      </Form.Item>
      <Form.Item name={['value', 'category']} label="Category">
        <TreeSelect
          style={{ width: '100%' }}
          dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
          treeData={props.categories}
          placeholder="Please select"
          treeDefaultExpandAll
          onChange={handleCategoryChanged}
          allowClear={true}
        />
      </Form.Item>

      <Form.Item name={['value', 'isArchived']} label="Archived">
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
  );
};

CreateRule.propTypes = {
  categories: PropTypes.array.isRequired,
  submitRule: PropTypes.func.isRequired
};
export default CreateRule;
