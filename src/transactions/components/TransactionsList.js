import React, { useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import './../pages/Transactions.css';
import 'antd/dist/antd.css';
import { Image, Popconfirm, Space, Table } from 'antd';
import Text from 'antd/es/typography/Text';
import useBreakpoint from 'antd/es/grid/hooks/useBreakpoint';
import { DownOutlined } from '@ant-design/icons';
import { httpMethods } from '../../shared/hooks/enum';
import { useHttpClient } from '../../shared/hooks/http-hook';
import { AuthContext } from '../../shared/context/auth-context';
import { createNotification, notificationType } from '../../shared/Notification';

const TransactionList = ({ filters }) => {
  const auth = useContext(AuthContext);
  const { isLoading, sendRequest } = useHttpClient();
  const [transactionsList, setTransactionsList] = useState([]);
  const [maxAmount, setMaxAmount] = useState(15000);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

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
      console.log('useEffect props filters changed');
      await updateTransactions();
    } catch (err) {
      console.log(err);
    }
  }, [filters]);

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

  return (
    <>
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
      {JSON.stringify(filters)}
    </>
  );
};

TransactionList.propTypes = {
  filters: PropTypes.any.isRequired
};

export default TransactionList;
