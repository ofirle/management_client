import {Fragment, useContext, useEffect, useState} from "react";
import {AuthContext} from "../../shared/context/auth-context";
import LoadingSpinner from "../../shared/components/UIElements/LoadingSpinner";
import {useHttpClient} from "../../shared/hooks/http-hook";
import 'antd/dist/antd.min.css';
import {Col, DatePicker, Form, Input, Row, Select, Slider, Space, Table} from 'antd';
import { DownOutlined } from '@ant-design/icons';
import {Option} from "antd/es/mentions";
const { RangePicker } = DatePicker;


const Transactions = () => {
    const Language = 'EN';
    const auth = useContext(AuthContext);
    const [transactionsList, setTransactionsList] = useState(null);
    const [typeMappingTitles, setTypeMappingTitles] = useState({});
    const [categoryList, setCategoryList] = useState(null);
    const [ selectedRowKeys, setSelectedRowKeys ] = useState([]);
    const { isLoading, error, sendRequest, clearError } = useHttpClient();
    const [ filters, setFilters ] = useState({});
    const [form] = Form.useForm();

    useEffect(async () => {
        try {
            const responseData = await sendRequest('http://localhost:3000/transactions', 'GET', null, {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
                    'Authorization': 'Bearer ' + auth.token
                }
            )
            let data = responseData.data;
            let categoryMapping = responseData.categoryMapping;
            // console.log(responseData.categoryMapping.keys());
            // const typeMapping = responseData.typeMapping;
            console.log(responseData.categoryMapping)
            data = data.map(item => { return {...item, key: item.id, paid: item.paid ? 'Yes' : 'No', category: categoryMapping[data[0].category], }});
            console.log(data);
            setTransactionsList(data);
            setTypeMappingTitles(responseData.typeMapping);

        }
        catch ( err ) {

        }}, []);


    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
        },
        {
            title: 'Type',
            dataIndex: 'type',
            render: type => typeMappingTitles[type],
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
            title: 'Note',
            dataIndex: 'note',
        },
        {
            title: 'Category',
            dataIndex: 'category',
            // filters: [
            //     {
            //         text: 'Rent',
            //         value: 'RENT',
            //     },
            //     {
            //         text: 'Rent 3',
            //         value: 'RENT3',
            //     },
            // ],
            // onFilter: (value, record) => record.category.indexOf(value) === 0,
        },
        {
            title: 'Paid',
            dataIndex: 'paid',
            render: paid => paid ? 'Yes' : 'No',
            filters: [
                {
                    text: 'Yes',
                    value: 'Yes',
                },
                {
                    text: 'No',
                    value: 'No',
                },
            ],
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
        console.log('selectedRowKeys changed: ', selectedRowKeysValue);
        setSelectedRowKeys( selectedRowKeysValue );
    };



    const handleDelete = (value) => {
        console.log(value);
    }

    const rowSelection = {
        selectedRowKeys,
        onChange: onSelectChange,
        selections: [
            Table.SELECTION_ALL,
            Table.SELECTION_INVERT,
            Table.SELECTION_NONE
        ],
    }

    const handleFilterChanged = (key, value, notSelectedKey = 'none') => {
        const localFilters = filters;
        if(value === notSelectedKey){
            delete localFilters[key];
            setFilters(localFilters);
            return;
        }

        localFilters[key] = value;
        setFilters( localFilters )
    }

    const handleDatePickerChanged = (value, dates) => {
        handleFilterChanged('dateStart', dates[0], '');
        handleFilterChanged('dateEnd', dates[1], '');
    }


    const handleTypeChanged = (value) => {
        handleFilterChanged('type', value);
        console.log(filters);
    }

    const onFinish = (event) => {
        console.log(event);
    }

    const getOptions = (mappingTitles) => {
        const options = [];
        options.push(<Option key='none' value='none'>-- Select</Option>)
        for (const key of Object.keys(mappingTitles)) {
            options.push(<Option key={key} value={key}>{mappingTitles[key]}</Option>)
        }
        return options;
    }

    return <div>
        <RangePicker onChange={handleDatePickerChanged} />
        <Slider range={{ draggableTrack: true }} defaultValue={[0, 5000]} max={5000} />
        <Form
            form={form}
            name="filters"
            className="ant-advanced-search-form"
            onFinish={onFinish}
        >
            <Row gutter={24}><Col span={8} key='type'>
                <Form.Item name={`type`} label={`Type`} rules={[{ required: false }]}>
                    <Select defaultValue="none" onChange={handleTypeChanged}>
                        { getOptions(typeMappingTitles) }
                    </Select>
                </Form.Item>
            </Col></Row>
        </Form>
        <Table rowSelection={rowSelection} columns={columns} dataSource={transactionsList} loading={isLoading} />;
    </div>
}

export default Transactions;