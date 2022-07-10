import React, { useContext, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import './../pages/Transactions.css';
import 'antd/dist/antd.css';
import { Form, Image, Popconfirm, Space, Table, TreeSelect } from 'antd';
import Text from 'antd/es/typography/Text';
import useBreakpoint from 'antd/es/grid/hooks/useBreakpoint';
import { DownOutlined } from '@ant-design/icons';
import { httpMethods } from '../../shared/hooks/enum';
import { useHttpClient } from '../../shared/hooks/http-hook';
import { AuthContext } from '../../shared/context/auth-context';
import { createNotification, notificationType } from '../../shared/Notification';

const EditableContext = React.createContext(null);

const TransactionList = ({ filters, columnsType, addAction }) => {
  const auth = useContext(AuthContext);
  const { isLoading, sendRequest } = useHttpClient();
  const [transactionsList, setTransactionsList] = useState([]);
  const [maxAmount, setMaxAmount] = useState(15000);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [users, setUsers] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const [categoryListFlat, setCategoryListFlat] = useState([]);
  const [ruleList, setRuleList] = useState([]);

  const screens = useBreakpoint();

  // useEffect(async () => {
  //   try {
  //     await updateTransactions();
  //   } catch (err) {
  //     console.log(err);
  //   }
  // }, []);

  useEffect(async () => {
    try {
      console.log(users);
      console.log(ruleList);
      await updateTransactions();
      const initData = await getInitData();
      setUsers(initData.users);
      setCategoryList(initData.categories);
      setRuleList(initData.rules);
      const flatCategories = getFlatCategories(initData.categories);
      setCategoryListFlat(flatCategories);
      console.log(flatCategories);
    } catch (err) {
      console.log(err);
    }
  }, [filters]);

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

  const updateMaxAmount = (currentMaxAmount) => {
    if (maxAmount < currentMaxAmount) setMaxAmount(currentMaxAmount);
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

  const onSelectChange = (selectedRowKeysValue) => {
    setSelectedRowKeys(selectedRowKeysValue);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
    selections: [Table.SELECTION_ALL, Table.SELECTION_INVERT, Table.SELECTION_NONE]
  };

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

  const typeImageUrl = {
    INCOME: 'https://findicons.com/files/icons/766/base_software/128/circle_green.png',
    EXPENSE: 'https://findicons.com/files/icons/766/base_software/128/circle_red.png'
  };
  const getDefaultColumns = () => {
    let columns = [];
    if (columnsType === 'full') {
      columns = [
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
          dataIndex: 'categoryId',
          render: (categoryId) => {
            if (categoryId) {
              return (
                categoryListFlat.find((category) => category.id == categoryId)?.title ??
                `not found - ${categoryId}`
              );
            } else {
              return '---';
            }
          },
          responsive: ['xl'],
          editable: true
        }
      ];
    } else if (columnsType === 'minimize') {
      columns = [
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
          title: 'Amount',
          dataIndex: 'amount',
          editable: true,
          render: (amount) => (amount ? `${amount} ₪` : '---'),
          sorter: (a, b) => a.amount - b.amount
        },
        {
          title: 'Title',
          dataIndex: 'title',
          responsive: ['xl']
        }
      ];
    }

    if (addAction) {
      columns.push({
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
      });
    }

    return columns;
  };

  const columns = getDefaultColumns(columnsType).map((col) => {
    if (!col.editable) {
      return col;
    }

    return {
      ...col,
      onCell: (record) => ({
        record,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
        handleSave
      })
    };
  });

  const EditableRow = ({ ...props }) => {
    const [form] = Form.useForm();
    return (
      <Form form={form} component={false}>
        <EditableContext.Provider value={form}>
          <tr {...props} />
        </EditableContext.Provider>
      </Form>
    );
  };

  const EditableCell = ({ editable, children, dataIndex, record, handleSave, ...restProps }) => {
    const [editing, setEditing] = useState(false);
    const inputRef = useRef(null);
    const form = useContext(EditableContext);
    useEffect(() => {
      if (editing) {
        inputRef.current.focus();
      }
    }, [editing]);

    const toggleEdit = () => {
      setEditing(!editing);
      form.setFieldsValue({
        [dataIndex]: record[dataIndex]
      });
    };

    const save = async () => {
      try {
        const values = await form.validateFields();
        toggleEdit();
        handleSave({ ...record, ...values });
      } catch (errInfo) {
        console.log('Save failed:', errInfo);
      }
    };

    let childNode = children;

    if (editable) {
      childNode = editing ? (
        <Form.Item
          style={{
            margin: 0
          }}
          name={dataIndex}>
          <TreeSelect
            ref={inputRef}
            style={{ width: '100%' }}
            // value={categorySelected}
            dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
            treeData={categoryList}
            placeholder="Please select"
            treeDefaultExpandAll
            allowClear={true}
            onPressEnter={save}
            onBlur={save}
          />
        </Form.Item>
      ) : (
        <div
          className="editable-cell-value-wrap"
          style={{
            paddingRight: 24
          }}
          onClick={toggleEdit}>
          {children}
        </div>
      );
    }

    return <td {...restProps}>{childNode}</td>;
  };

  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell
    }
  };

  const handleSave = (row) => {
    console.log(row);
    const newData = [...transactionsList];
    const index = newData.findIndex((item) => row.key === item.key);
    const item = newData[index];
    newData.splice(index, 1, { ...item, ...row });
    console.log(newData);
    setTransactionsList(newData);
  };

  const getSummeryRow = (total) => {
    if (columnsType === 'full') {
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
          </Table.Summary.Row>
        </>
      );
    } else if (columnsType === 'minimize') {
      return (
        <>
          <Table.Summary.Row>
            <Table.Summary.Cell>Total</Table.Summary.Cell>
            {screens.xxl && <Table.Summary.Cell>---</Table.Summary.Cell>}
            {screens.sm && <Table.Summary.Cell>---</Table.Summary.Cell>}
            {<Table.Summary.Cell>---</Table.Summary.Cell>}
            <Table.Summary.Cell>
              <Text mark>{Math.floor(total)} ₪</Text>
            </Table.Summary.Cell>
            {screens.xl && <Table.Summary.Cell>---</Table.Summary.Cell>}
          </Table.Summary.Row>
        </>
      );
    }
  };

  return (
    <div>
      <Table
        components={components}
        rowSelection={rowSelection}
        rowClassName={() => 'editable-row'}
        loading={isLoading}
        dataSource={transactionsList}
        columns={columns}
        summary={() => {
          let total = 0;

          transactionsList.forEach((transaction) => {
            if (transaction.type === 'INCOME') {
              total += transaction.amount;
            } else {
              total -= transaction.amount;
            }
          });

          return getSummeryRow(total);
        }}
      />
    </div>
  );
};

TransactionList.propTypes = {
  filters: PropTypes.any.isRequired,
  columnsType: PropTypes.string.isRequired,
  addAction: PropTypes.bool.isRequired
};

export default TransactionList;
