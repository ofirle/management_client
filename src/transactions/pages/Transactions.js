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
  Input,
  Row,
  Select,
  Slider,
  TreeSelect
} from 'antd';
import { Option } from 'antd/es/mentions';
import Text from 'antd/es/typography/Text';
import { httpMethods } from '../../shared/hooks/enum';
import TransactionList from '../components/TransactionsList';

const { RangePicker } = DatePicker;

const Transactions = () => {
  const auth = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const [ruleList, setRuleList] = useState([]);
  const { sendRequest } = useHttpClient();
  const { categorySelected } = useState([]);
  const [filters, setFilters] = useState({});
  const { Panel } = Collapse;
  const [form] = Form.useForm();

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
      const initData = await getInitData();
      setUsers(initData.users);
      setCategoryList(initData.categories);
      setRuleList(initData.rules);
    } catch (err) {
      console.log(err);
    }
  }, []);

  // const updateMaxAmount = (currentMaxAmount) => {
  //   if (maxAmount < currentMaxAmount) setMaxAmount(currentMaxAmount);
  // };

  const getRulesOptions = () => {
    return ruleList.map((rule) => {
      return (
        <Option name={rule.id} key={rule.id}>
          {rule.title}
        </Option>
      );
    });
  };

  const getUsersOptions = () => {
    return users.map((user) => {
      return (
        <Option name={user.id} key={user.id}>
          {user.name}
        </Option>
      );
    });
  };

  // const parseData = (data) => {
  //   return data.map((item) => {
  //     return {
  //       ...item,
  //       key: item.id
  //     };
  //   });
  // };

  // const getGraphData = () => {
  //   const data = { EXPENSE: {}, INCOME: {} };
  //   transactionsList.forEach((transaction) => {
  //     if (Object.prototype.hasOwnProperty.call(data[transaction.type], transaction.category)) {
  //       data[transaction.type][transaction.category] += transaction.amount;
  //     } else {
  //       data[transaction.type][transaction.category] = transaction.amount;
  //     }
  //   });
  // };

  // const setResponseTransactions = (responseData) => {
  //   const data = parseData(responseData);
  //   const currentMaxAmount = Math.max.apply(
  //     Math,
  //     data.map(function (transaction) {
  //       return transaction.amount;
  //     })
  //   );
  //
  //   const transactions = data.map((transaction) => {
  //     return { ...transaction, userName: transaction.user.name };
  //   });
  //   updateMaxAmount(currentMaxAmount);
  //   setTransactionsList(transactions);
  //   getGraphData();
  // };

  // const getFiltersQuery = () => {
  //   if (Object.keys(filters).length === 0) return '';
  //   const queryString = Object.keys(filters)
  //     .map((key) => {
  //       if (Array.isArray(filters[key])) {
  //         return filters[key]
  //           .map((value) => {
  //             return encodeURIComponent(`${key}[]`) + '=' + encodeURIComponent(value);
  //           })
  //           .join('&');
  //       } else {
  //         return encodeURIComponent(key) + '=' + encodeURIComponent(filters[key]);
  //       }
  //     })
  //     .join('&');
  //
  //   return `?${queryString}`;
  // };

  const getInitData = async () => {
    const response = await sendRequest(
      `${process.env.REACT_APP_SERVER_URL}/transactions/initData`,
      httpMethods.Get,
      auth.token
    );
    return response.data;
  };

  // const updateTransactions = async () => {
  //   const queryString = getFiltersQuery();
  //   const responseData = await sendRequest(
  //     `${process.env.REACT_APP_SERVER_URL}/transactions${queryString}`,
  //     httpMethods.Get,
  //     auth.token
  //   );
  //   setResponseTransactions(responseData.data);
  // };

  // const updateTransactionsRule = async (ruleId) => {
  //   const responseData = await sendRequest(
  //     `${process.env.REACT_APP_SERVER_URL}/transactions/rules/${ruleId}`,
  //     httpMethods.Get,
  //     auth.token
  //   );
  //   // setResponseTransactions(responseData.data);
  // };
  //
  // const onSelectChange = (selectedRowKeysValue) => {
  //   setSelectedRowKeys(selectedRowKeysValue);
  // };
  //
  // const rowSelection = {
  //   selectedRowKeys,
  //   onChange: onSelectChange,
  //   selections: [Table.SELECTION_ALL, Table.SELECTION_INVERT, Table.SELECTION_NONE]
  // };

  const handleFilterChanged = (values, isArray = false, notSelectedKey = '') => {
    const localFilters = { ...filters };
    values.forEach((filter) => {
      if ((isArray && filter.value.length === 0) || filter.value === notSelectedKey) {
        delete localFilters[filter.key];
      } else {
        localFilters[filter.key] = filter.value;
      }
    });
    console.log(localFilters);
    setFilters(localFilters);
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
    handleFilterChanged([{ key: 'categories', value: values }], true);
  };

  const handlePaidChanged = (value) => {
    handleFilterChanged([{ key: 'paid', value: value }], false, 'none');
  };

  const handleArchivedChanged = (value) => {
    handleFilterChanged([{ key: 'archived', value: value }], false, 'none');
  };

  const handleRuleChanged = (ruleId: string) => {
    console.log(ruleId);
    handleFilterChanged([{ key: 'ruleId', value: ruleId }], false, 'none');
    // updateTransactionsRule(ruleId);
  };

  return (
    <>
      <Row gutter={[16, 24]}>
        <Col xs={16} sm={16} md={20} lg={20} xl={20}>
          <TransactionList filters={filters} />
          <br />
        </Col>
        <Col xs={8} sm={8} md={4} lg={4} xl={4}>
          <Form form={form} name="filters">
            <Form.Item name="paid" rules={[{ required: false }]}>
              <Checkbox.Group options={paidOptions} onChange={handleArchivedChanged} />
            </Form.Item>
            <Form.Item name="search" rules={[{ required: false }]}>
              <Input placeholder="search..." onChange={handleSearchChanged} />
            </Form.Item>
            <Collapse ghost>
              <Panel header={<Text strong>Rules</Text>} key="rules">
                <Form.Item name="rule" rules={[{ required: false }]}>
                  <Select onChange={handleRuleChanged} placeholder="Please Select">
                    {getRulesOptions()}
                  </Select>
                </Form.Item>
              </Panel>
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
                    defaultValue={[0, 15000]}
                    max={30000}
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
