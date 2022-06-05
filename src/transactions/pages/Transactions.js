import {useContext, useEffect, useState} from "react";
import {AuthContext} from "../../shared/context/auth-context";
import {useHttpClient} from "../../shared/hooks/http-hook";
import 'antd/dist/antd.min.css';
import {
    Col,
    DatePicker,
    Form,
    Image,
    Row,
    Select,
    Slider,
    Space,
    Table,
    TreeSelect
} from 'antd';
import {DownOutlined} from '@ant-design/icons';
import {Option} from "antd/es/mentions";
import Text from "antd/es/typography/Text";

const { RangePicker } = DatePicker;

const Transactions = () => {
    const Language = 'EN';
    const auth = useContext(AuthContext);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [transactionsList, setTransactionsList] = useState([]);
    const [typeMappingTitles, setTypeMappingTitles] = useState({});
    const [users, setUsers] = useState([]);
    const [typeImageUrl, setTypeImageUrl] = useState({});
    const [categoryList, setCategoryList] = useState([]);
    const [maxAmount, setMaxAmount] = useState(15000);
    const [ selectedRowKeys, setSelectedRowKeys ] = useState([]);
    const { isLoading, error, sendRequest, clearError } = useHttpClient();
    const {categorySelected, setCategorySelected } = useState([]);
    const [ filters, setFilters ] = useState({});
    const [form] = Form.useForm();
    const [form2] = Form.useForm();

    useEffect(async () => {
        try {
            setTypeImageUrl({
                INCOME:  'https://findicons.com/files/icons/766/base_software/128/circle_green.png',
                EXPENSE:  'https://findicons.com/files/icons/766/base_software/128/circle_red.png',
            })
            const initData = await getInitData();
            setUsers(initData.users);
            setTypeMappingTitles(initData.typeMapping);
            setCategoryList(initData.categories);
            console.log(categoryList);
            await updateTransactions();
        }
        catch ( err ) {

        }}, []);

    const updateMaxAmount = (currentMaxAmount) => {
        if(maxAmount < currentMaxAmount) setMaxAmount(currentMaxAmount);
    }

    const getUsersOptions = () => {
        const options = users.map((user) => {
            return <Option name={user.id} key={user.id}>{user.name}</Option>
        })
        return options;
    }

    const parseData = (data) => {
        return data.map(item => {
            return {
                ...item,
                key: item.id,
            }
        });
    }

    const getGraphData = () => {
        const data = {EXPENSE: {}, INCOME: {}};
        transactionsList.forEach((transaction) => {
            if(data[transaction.type].hasOwnProperty(transaction.category)){
                data[transaction.type][transaction.category] += transaction.amount;
            } else {
                data[transaction.type][transaction.category] = transaction.amount;
            }
        });
    }

    const setResponseTransactions = (responseData) => {
        const data = parseData(responseData.data);
        const currentMaxAmount = Math.max.apply(Math, data.map(function(transaction) { return transaction.amount; }))
        updateMaxAmount(currentMaxAmount);
        setTransactionsList(data);
        getGraphData();
    }

    const getFiltersQuery = () => {
        if(Object.keys(filters).length === 0) return '';
        const queryString = Object.keys(filters).map((key) => {
            if(Array.isArray(filters[key])){
                return filters[key].map((value) => {
                    return encodeURIComponent(`${key}[]`) + '=' + encodeURIComponent(value)
                }).join('&');
            }else{
                return encodeURIComponent(key) + '=' + encodeURIComponent(filters[key])
            }
        }).join('&');

        return `?${queryString}`;
    }
    const getInitData = async () => {
        return await sendRequest(`http://localhost:3000/transactions/initData`, 'GET', null, {
                'Authorization': `Bearer ${auth.token}`
            }
        );
    }

    const updateTransactions = async () => {
        const queryString = getFiltersQuery();
        console.log(queryString);
        const responseData = await sendRequest(`http://localhost:3000/transactions${queryString}`, 'GET', null, {
                'Authorization': `Bearer ${auth.token}`
            }
        )

        setResponseTransactions(responseData);
    }


    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
        },
        {
            title: 'Type',
            dataIndex: 'type',
            render: type => <Image
                width={30}
                src={typeImageUrl[type]}
            />,

        },
        {
            title: 'Amount',
            dataIndex: 'amount',
            editable: true,
            sorter: (a, b) => a.amount - b.amount,
        },
        {
            title: 'Date',
            dataIndex: 'date',
            sorter: (a, b) => {
                const firstDate = new Date(a.date);
                const secondDate = new Date(b.date);
                return firstDate.getTime() >= secondDate.getTime()
            }
        },
        {
            title: 'Title',
            dataIndex: 'title',
        },
        {
            title: 'Description',
            dataIndex: 'description',
        },
        {
            title: 'Note',
            dataIndex: 'note',
        },
        {
            title: 'Category',
            dataIndex: 'category',
            render: (category) => category? category.title : '---',
        },
        {
            title: 'Paid',
            dataIndex: 'paid',
            render: paid => paid ? 'Yes' : 'No',
        },
        {
            title: 'Action',
            key: 'action',
            sorter: true,
            render: () => (
                <Space size="middle">
                    <a>Delete</a>
                    <a className="ant-dropdown-link">
                        More actions <DownOutlined />
                    </a>
                </Space>
            ),
        },
    ];

    const onSelectChange = (selectedRowKeysValue) => {
        setSelectedRowKeys( selectedRowKeysValue );
    };

    const rowSelection = {
        selectedRowKeys,
        onChange: onSelectChange,
        selections: [
            Table.SELECTION_ALL,
            Table.SELECTION_INVERT,
            Table.SELECTION_NONE
        ],
    }

    const handleFilterChanged = async (values, isArray = false, notSelectedKey = '') => {
        const localFilters = filters;
        values.forEach(filter => {
            if (isArray && filter.value.length === 0 || filter.value === notSelectedKey) {
                delete localFilters[filter.key];
            }else{
                localFilters[filter.key] = filter.value;
            }
        });
        setFilters(localFilters)
        await updateTransactions();
    }

    const handleDatePickerChanged = (value, dates) => {
        handleFilterChanged([{ key: 'dateStart', value: dates[0] }, { key: 'dateEnd', value: dates[1] }])
    }

    const handleAmountsChanged = (values) => {
        handleFilterChanged([{ key: 'amountMin', value: values[0] }, { key: 'amountMax', value: values[1] }]);
    }

    const handleTypeChanged = (values) => {
        handleFilterChanged([{ key: 'types', value: values}], true);
    }

    const handleUserChanged = (values) => {
        handleFilterChanged([{ key: 'usersId', value: values}], true);
    }


    const handleCategoryChanged = (values) => {
        handleFilterChanged([{ key: 'categories', value: values}], true);
    }

    const handlePaidChanged = (value) => {
        handleFilterChanged([{ key: 'paid', value: value}], false, 'none');
    }

    const onFinish = (event) => {
        console.log(event);
    }

    const getOptions = (mappingTitles, hasNoneOption = true) => {
        const options = [];
        hasNoneOption && options.push(<Option key='none' value='none'>-- Select</Option>)
        for (const key of Object.keys(mappingTitles)) {
            options.push(<Option key={key} value={key}>{mappingTitles[key]}</Option>)
        }
        return options;
    }

    return <>
        <Row>
            <Col span={24}>
                <Form form={form} name="filters" onFinish={onFinish}>
                    <Form.Item name='date' label='Date Range' rules={[{ required: false }]}>
                        <RangePicker onChange={handleDatePickerChanged} />
                    </Form.Item>
                    <Form.Item name='user' label='User' rules={[{ required: false }]}>
                        <Select onChange={handleUserChanged} mode="multiple" allowClear placeholder="Please Select">
                            { getUsersOptions() }
                        </Select>
                    </Form.Item>
                    <Form.Item name='amount' label='Amount Range' rules={[{ required: false }]}>
                        <Slider range={{ draggableTrack: true }} defaultValue={[0, maxAmount]} max={maxAmount} onAfterChange={handleAmountsChanged} step={100} />
                    </Form.Item>
                    <Form.Item name='type' label='Type' rules={[{ required: false }]}>
                        <Select onChange={handleTypeChanged} mode="multiple" allowClear placeholder="Please Select">
                            { getOptions(typeMappingTitles, false) }
                        </Select>
                    </Form.Item>
                    <Form.Item name='category' label='Category' rules={[{ required: false }]}>
                        <TreeSelect
                            style={{ width: '100%' }}
                            value={categorySelected}
                            dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                            treeData={categoryList}
                            placeholder="Please select"
                            treeDefaultExpandAll
                            onChange={handleCategoryChanged}
                            multiple

                        />
                    </Form.Item>
                    <Form.Item name='paid' label='Paid' rules={[{ required: false }]}>
                        <Select defaultValue="none" onChange={handlePaidChanged}>
                            { getOptions({yes: 'Yes', no: 'No'}) }
                        </Select>
                    </Form.Item>
                </Form>
            </Col>
        </Row>
        <Row>
            <Col span={16}>
            <Table rowSelection={rowSelection} columns={columns} dataSource={transactionsList} loading={isLoading} summary={pageData => {
                let total = 0;

                transactionsList.forEach((transaction) => {
                    if(transaction.type === 'INCOME') {
                        total += transaction.amount;
                    }else{
                        total -= transaction.amount;
                    }
                });

                return (
                    <>
                        <Table.Summary.Row>
                            <Table.Summary.Cell>Total</Table.Summary.Cell>
                            <Table.Summary.Cell>--</Table.Summary.Cell>
                            <Table.Summary.Cell>--</Table.Summary.Cell>
                            <Table.Summary.Cell><Text mark>{total}</Text></Table.Summary.Cell>
                        </Table.Summary.Row>
                    </>
                );
            }}
            />
            </Col>
            <Col span={8}>Cols</Col>
            </Row>
    </>
}

export default Transactions;