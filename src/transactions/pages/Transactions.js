import React from 'react';
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../shared/context/auth-context';
import { useHttpClient } from '../../shared/hooks/http-hook';
import './Transactions.css';
import 'antd/dist/antd.css';
import {
  Checkbox,
  Col,
  Collapse,
  DatePicker,
  Divider,
  Form,
  Image,
  Input,
  Popconfirm,
  Row,
  Select,
  Slider,
  Space,
  Table,
  TreeSelect
} from 'antd';
import { DownOutlined } from '@ant-design/icons';
import { Option } from 'antd/es/mentions';
import Text from 'antd/es/typography/Text';
import { httpMethods } from '../../shared/hooks/enum';
import useBreakpoint from 'antd/es/grid/hooks/useBreakpoint';
import { createNotification, notificationType } from '../../shared/Notification';

const { RangePicker } = DatePicker;

const Transactions = () => {
  const auth = useContext(AuthContext);
  const [transactionsList, setTransactionsList] = useState([]);
  const [typeImageUrl, setTypeImageUrl] = useState({});
  const [users, setUsers] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const [maxAmount, setMaxAmount] = useState(15000);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const { isLoading, sendRequest } = useHttpClient();
  const { categorySelected } = useState([]);
  const [filters, setFilters] = useState({});
  const { Panel } = Collapse;
  const [form] = Form.useForm();
  const screens = useBreakpoint();

  const paidOptions = [
    {
      label: 'Yes',
      value: 'yes'
    },
    {
      label: 'No',
      value: 'no'
    }
  ];

  const typeOptions = [
    {
      label: 'Income',
      value: 'INCOME'
    },
    {
      label: 'Expense',
      value: 'EXPENSE'
    }
  ];

  useEffect(async () => {
    try {
      setTypeImageUrl({
        INCOME: 'https://findicons.com/files/icons/766/base_software/128/circle_green.png',
        EXPENSE: 'https://findicons.com/files/icons/766/base_software/128/circle_red.png'
      });
      const initData = await getInitData();
      setUsers(initData.users);
      setCategoryList(initData.categories);
      await updateTransactions();
    } catch (err) {
      console.log(err);
    }
  }, []);

  const updateMaxAmount = (currentMaxAmount) => {
    if (maxAmount < currentMaxAmount) setMaxAmount(currentMaxAmount);
  };

  const getUsersOptions = () => {
    const options = users.map((user) => {
      return (
        <Option name={user.id} key={user.id}>
          {user.name}
        </Option>
      );
    });
    return options;
  };

  const parseData = (data) => {
    return data.map((item) => {
      return {
        ...item,
        key: item.id
      };
    });
  };

  const getGraphData = () => {
    const data = { EXPENSE: {}, INCOME: {} };
    transactionsList.forEach((transaction) => {
      if (Object.prototype.hasOwnProperty.call(data[transaction.type], transaction.category)) {
        data[transaction.type][transaction.category] += transaction.amount;
      } else {
        data[transaction.type][transaction.category] = transaction.amount;
      }
    });
  };

  const setResponseTransactions = (responseData) => {
    const data = parseData(responseData);
    const currentMaxAmount = Math.max.apply(
      Math,
      data.map(function (transaction) {
        return transaction.amount;
      })
    );

    const transactions = data.map((transaction) => {
      return { ...transaction, userName: transaction.user.name };
    });
    updateMaxAmount(currentMaxAmount);
    setTransactionsList(transactions);
    getGraphData();
  };

  const getFiltersQuery = () => {
    if (Object.keys(filters).length === 0) return '';
    const queryString = Object.keys(filters)
      .map((key) => {
        if (Array.isArray(filters[key])) {
          return filters[key]
            .map((value) => {
              return encodeURIComponent(`${key}[]`) + '=' + encodeURIComponent(value);
            })
            .join('&');
        } else {
          return encodeURIComponent(key) + '=' + encodeURIComponent(filters[key]);
        }
      })
      .join('&');

    return `?${queryString}`;
  };

  const getInitData = async () => {
    const response = await sendRequest(
      `${process.env.REACT_APP_SERVER_URL}/transactions/initData`,
      httpMethods.Get,
      auth.token
    );
    return response.data;
  };

  const updateTransactions = async () => {
    const queryString = getFiltersQuery();
    const responseData = await sendRequest(
      `${process.env.REACT_APP_SERVER_URL}/transactions${queryString}`,
      httpMethods.Get,
      auth.token
    );
    setResponseTransactions(responseData.data);
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      responsive: ['xxl']
    },
    {
      title: 'Type',
      dataIndex: 'type',
      render: (type) => <Image width={30} src={typeImageUrl[type]} />
    },
    {
      title: 'User',
      dataIndex: 'user',
      render: (user) => (user ? user.name : '---'),
      responsive: ['xl']
    },
    {
      title: 'Source',
      dataIndex: 'source',
      render: (source) => (source ? source.title : '---'),
      responsive: ['xl']
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      editable: true,
      render: (amount) => (amount ? `${amount} ₪` : '---'),
      sorter: (a, b) => a.amount - b.amount
    },
    {
      title: 'Date',
      dataIndex: 'date',
      sorter: (a, b) => {
        const firstDate = new Date(a.date);
        const secondDate = new Date(b.date);
        return firstDate.getTime() >= secondDate.getTime();
      },
      responsive: ['sm']
    },
    {
      title: 'Title',
      dataIndex: 'title',
      responsive: ['xl']
    },
    {
      title: 'Note',
      dataIndex: 'note',
      responsive: ['xl']
    },
    {
      title: 'Category',
      dataIndex: 'category',
      render: (category) => (category ? category.title : '---'),
      responsive: ['xl']
    },
    {
      title: 'Paid',
      dataIndex: 'paid',
      render: (paid) => (paid ? 'Yes' : 'No'),
      responsive: ['xl']
    },
    {
      title: 'Action',
      key: 'action',
      sorter: true,
      render: (_, record) =>
        transactionsList.length > 1 ? (
          <Space size="middle">
            <Popconfirm title="Sure to delete?" onConfirm={() => handleDelete(record.id)}>
              <a>Delete</a>
            </Popconfirm>
            <a className="ant-dropdown-link">
              More actions <DownOutlined />
            </a>
          </Space>
        ) : null
    }
  ];

  const handleDelete = async (id: number) => {
    const responseData = await sendRequest(
      `${process.env.REACT_APP_SERVER_URL}/transactions/${id}`,
      httpMethods.Delete,
      auth.token
    );
    if (responseData?.type === 1) {
      createNotification(notificationType.Success, 'Transaction deleted successfully');
      await updateTransactions();
    } else {
      createNotification(notificationType.Error, 'failed to delete transaction');
    }
  };

  const onSelectChange = (selectedRowKeysValue) => {
    setSelectedRowKeys(selectedRowKeysValue);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
    selections: [Table.SELECTION_ALL, Table.SELECTION_INVERT, Table.SELECTION_NONE]
  };

  const handleFilterChanged = async (values, isArray = false, notSelectedKey = '') => {
    const localFilters = filters;
    values.forEach((filter) => {
      if ((isArray && filter.value.length === 0) || filter.value === notSelectedKey) {
        delete localFilters[filter.key];
      } else {
        localFilters[filter.key] = filter.value;
      }
    });
    setFilters(localFilters);
    await updateTransactions();
  };
  const handleSearchChanged = (event) => {
    const value = event.target.value;
    handleFilterChanged([{ key: 'title', value }]);
  };

  const handleDatePickerChanged = (value, dates) => {
    handleFilterChanged([
      { key: 'dateStart', value: dates[0] },
      { key: 'dateEnd', value: dates[1] }
    ]);
  };

  const handleAmountsChanged = (values) => {
    handleFilterChanged([
      { key: 'amountMin', value: values[0] },
      { key: 'amountMax', value: values[1] }
    ]);
  };

  const handleTypeChanged = (values) => {
    handleFilterChanged([{ key: 'types', value: values }], true);
  };

  const handleUserChanged = (values) => {
    handleFilterChanged([{ key: 'usersId', value: values }], true);
  };

  const handleCategoryChanged = (values) => {
    console.log(values);
    handleFilterChanged([{ key: 'categories', value: values }], true);
  };

  const handlePaidChanged = (value) => {
    handleFilterChanged([{ key: 'paid', value: value }], false, 'none');
  };

  const handleArchivedChanged = (value) => {
    console.log('HERE', value);
    handleFilterChanged([{ key: 'archived', value: value }], false, 'none');
  };

  const onFinish = (event) => {
    console.log(event);
  };

  return (
    <>
      <Row gutter={[16, 24]}>
        <Col xs={16} sm={16} md={20} lg={20} xl={20}>
          <Table
            rowSelection={rowSelection}
            columns={columns}
            dataSource={transactionsList}
            loading={isLoading}
            summary={() => {
              let total = 0;

              transactionsList.forEach((transaction) => {
                if (transaction.type === 'INCOME') {
                  total += transaction.amount;
                } else {
                  total -= transaction.amount;
                }
              });

              return (
                <>
                  <Table.Summary.Row>
                    <Table.Summary.Cell>Total</Table.Summary.Cell>
                    {screens.xxl && <Table.Summary.Cell>--</Table.Summary.Cell>}
                    {screens.xl && <Table.Summary.Cell>--</Table.Summary.Cell>}
                    {screens.xl && <Table.Summary.Cell>--</Table.Summary.Cell>}
                    <Table.Summary.Cell>--</Table.Summary.Cell>
                    <Table.Summary.Cell>
                      <Text mark>{Math.floor(total)} ₪</Text>
                    </Table.Summary.Cell>
                    {screens.sm && <Table.Summary.Cell>--</Table.Summary.Cell>}
                    {screens.xl && <Table.Summary.Cell>--</Table.Summary.Cell>}
                    {screens.xl && <Table.Summary.Cell>--</Table.Summary.Cell>}
                    {screens.xl && <Table.Summary.Cell>--</Table.Summary.Cell>}
                  </Table.Summary.Row>
                </>
              );
            }}
          />

          {JSON.stringify(screens)}
          <br />
          {JSON.stringify(categoryList)}
        </Col>
        <Col xs={8} sm={8} md={4} lg={4} xl={4}>
          <Form form={form} name="filters" onFinish={onFinish}>
            <Form.Item name="paid" rules={[{ required: false }]}>
              <Checkbox.Group options={paidOptions} onChange={handleArchivedChanged} />
            </Form.Item>
            <Form.Item name="search" rules={[{ required: false }]}>
              <Input placeholder="search..." onChange={handleSearchChanged} />
            </Form.Item>
            <Collapse ghost>
              <Panel header={<Text strong>Dates</Text>} key="dates">
                <Form.Item name="date" rules={[{ required: false }]}>
                  <RangePicker onChange={handleDatePickerChanged} />
                </Form.Item>
              </Panel>
              <Panel header={<Text strong>Users</Text>} key="user">
                <Form.Item name="user" rules={[{ required: false }]}>
                  <Select
                    onChange={handleUserChanged}
                    mode="multiple"
                    allowClear
                    placeholder="Please Select">
                    {getUsersOptions()}
                  </Select>
                </Form.Item>
              </Panel>
              <Panel header={<Text strong>Amounts</Text>} key="amount">
                <Form.Item name="amount" rules={[{ required: false }]}>
                  <Slider
                    range={{ draggableTrack: true }}
                    defaultValue={[0, maxAmount]}
                    max={maxAmount}
                    onAfterChange={handleAmountsChanged}
                    step={100}
                    tooltipVisible={true}
                  />
                </Form.Item>
              </Panel>
              <Panel header={<Text strong>Category</Text>} key="category">
                <Divider orientation="left">Type</Divider>
                <div>
                  <Checkbox.Group options={typeOptions} onChange={handleTypeChanged} />
                </div>
                <Divider orientation="left">Category</Divider>
                <Form.Item name="category" rules={[{ required: false }]}>
                  <TreeSelect
                    style={{ width: '100%' }}
                    value={categorySelected}
                    dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                    treeData={categoryList}
                    placeholder="Please select"
                    treeDefaultExpandAll
                    onChange={handleCategoryChanged}
                    allowClear={true}
                    multiple
                  />
                </Form.Item>
              </Panel>
              <Panel header={<Text strong>Paid</Text>} key="paid">
                <Form.Item name="paid" rules={[{ required: false }]}>
                  <Checkbox.Group options={paidOptions} onChange={handlePaidChanged} />
                  {/*<Select defaultValue="none" onChange={handlePaidChanged}>*/}
                  {/*  {getOptions({ yes: 'Yes', no: 'No' })}*/}
                  {/*</Select>*/}
                </Form.Item>
              </Panel>
            </Collapse>
          </Form>
        </Col>
      </Row>
    </>
  );
};

export default Transactions;
