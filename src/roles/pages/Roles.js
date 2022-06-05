import {useContext, useEffect, useState} from "react";
import {AuthContext} from "../../shared/context/auth-context";
import {useHttpClient} from "../../shared/hooks/http-hook";
import 'antd/dist/antd.min.css';
import {
    Button,
    Checkbox,
    Col, Form, Input, Modal,
    Row, Select, Space,
    Table,
} from 'antd';
import {Option} from "antd/es/mentions";
import {ExclamationCircleOutlined} from "@ant-design/icons";
const { confirm } = Modal;


const layout = {
    labelCol: {
        span: 8,
    },
    wrapperCol: {
        span: 16,
    },
};
const tailLayout = {
    wrapperCol: {
        offset: 8,
        span: 16,
    },
};
const permissionsOptions = [];

const Roles = () => {
    const auth = useContext(AuthContext);
    const { isLoading, error, sendRequest, clearError } = useHttpClient();
    const [ dataTest, setDataTest ] = useState([]);
    const [ isLoadingColumns, setIsLoadingColumns ] = useState(true);
    const [ permissions, setPermissions ] = useState([]);
    const [ actionOptions, setActionsOptions ] = useState([]);
    const [ isAddRoleModalVisible, setAddRoleModalVisible ] = useState(false);
    const [ isEditMode, setEditMode ] = useState(false);
    const [form] = Form.useForm();

    const onFinish = async (values) => {
        const roleId = values.id;
        if(roleId){
            await updateRole(roleId, values.title, values.actions);
        }else{
            await createRole(values.title, values.actions);
        }
        await reloadData();
        setAddRoleModalVisible(false)
    };

    const onReset = () => {
        form.resetFields();
    };


    useEffect(async () => {
        try {

            const permissionsData = await getPermissions();
            permissionsData.forEach((permission) =>{
                permissionsOptions.push(<Option key={permission.action}>{permission.title}</Option>);
            })
            setPermissions(permissionsData);
            // setActionsOptions(permissionsOptions);
            console.log(permissionsData);
            await reloadData();

            // getColumns()
        }
        catch ( err ) {
            console.log(err);
        }}, []);

    const reloadData = async () => {
        const rolesData = await getRoles();
        const roles = rolesData.data;
        const basicDataSet = {
            key: null,
            title: null
        };
        permissions.forEach((permission) => {
            basicDataSet[permission.action] = false;
        })

        const dataSet = [];
        roles.forEach((role) => {
            const roleData = {...basicDataSet};
            roleData.key = role.id;
            roleData.title = role.title;
            role.permissions.forEach((permission) => {
                roleData[permission.action] = true
            })
            dataSet.push(roleData);
        })
        setDataTest(dataSet);
    }

    const getRoles = async () => {
        return await sendRequest(`http://localhost:3000/roles`, 'GET', null, {
                'Authorization': `Bearer ${auth.token}`
            }
        );
    }

    const getPermissions = async () => {
        return await sendRequest(`http://localhost:3000/permissions`, 'GET', null, {
                'Authorization': `Bearer ${auth.token}`
            }
        );
    }

    const createRole = async (title, actions) => {
        return await sendRequest(`http://localhost:3000/roles`, 'POST',
            JSON.stringify({
                title: title,
                actions: actions
            }), {
                'Authorization': `Bearer ${auth.token}`,
                'Content-Type': 'application/json'
            }
        );
    }

    const updateRolePermission = async (roleId, action, value) => {
        return await sendRequest(`http://localhost:3000/roles/${roleId}/${action}`, 'PUT',
            JSON.stringify({
                value: value
            }), {
                'Authorization': `Bearer ${auth.token}`,
                'Content-Type': 'application/json'
            }
        );
    }

    const updateRole = async (roleId, title, actions) => {
        return await sendRequest(`http://localhost:3000/roles/${roleId}`, 'PUT',
            JSON.stringify({
                title: title,
                actions: actions,
            }), {
                'Authorization': `Bearer ${auth.token}`,
                'Content-Type': 'application/json'
            }
        );
    }

    const deleteRoleRequest = async (roleId) => {
        return await sendRequest(`http://localhost:3000/roles/${roleId}`, 'DELETE', null, {
                'Authorization': `Bearer ${auth.token}`,
            }
        );
    }

    const deleteRole = async (roleId) => {
        await deleteRoleRequest(roleId);
        await reloadData();
    }



    const openEditModal = (record) => {
        console.log(record);

        const actions = [];
        permissions.forEach((permission) => {
            if(record.hasOwnProperty(permission.action)){
                actions.push(permission.action)
            }
        })
        form.setFieldsValue({
            id: record.key,
            title: record.title,
            actions: actions
        });
        setEditMode(true);
        setAddRoleModalVisible(true);
    }

    const getColumns = (LocalPermissions) => {
        const columns = [
            {
                title: 'Id',
                dataIndex: 'key',
                key: 'key',
            },
            {
                title: 'Role',
                dataIndex: 'title',
                key: 'title',
            },
        ];

        LocalPermissions.forEach((permission) =>{
            columns.push({
                title: permission.title,
                dataIndex: permission.action,
                key: permission.action,
                render: (text, record, index) => <Checkbox checked={text} name={{...record, action: permission.action}} onChange={onRolePermissionChanged}/>
            })
        })

        columns.push({
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Button onClick={() => openEditModal(record)}>Edit</Button>
                    <Button type="danger" onClick={() => showDeleteConfirm(record.key)}>Delete</Button>
                </Space>
            ),
        })
        console.log(columns);
        return columns;
    }

    const onRolePermissionChanged = (event) => {
        const { key, action } = event.target.name;
        console.log("onChange", dataTest);


        const newData = dataTest.map((row) => {
            if(row.key === key) {
                row[action] = event.target.checked;
            }
            return row;
        });
        updateRolePermission(key, action, event.target.checked);

        setDataTest(newData);
    }

    const showDeleteConfirm = (roleId) => {
        confirm({
            title: 'Are you sure delete this role?',
            icon: <ExclamationCircleOutlined />,
            content: 'Some descriptions',
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',

            async onOk() {
                await deleteRole(roleId)
            },

            onCancel() {
                console.log('Cancel');
            },
        });
    };

    const showModal = () => {
        setAddRoleModalVisible(true);
    };

    const handleCancel = () => {
        setAddRoleModalVisible(false);
        setEditMode(false);
    };

    return <>
        <Row>
            <Button type="primary" onClick={showModal}>Add Role</Button>
            <Modal title="Basic Modal" visible={isAddRoleModalVisible} onCancel={handleCancel} footer={null}>
                <Form {...layout} form={form} name="control-hooks" onFinish={onFinish}>
                    <Form.Item name="id" label="Id" hidden={true}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="title" label="Title" rules={[{required: true}]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="actions" label="Actions" rules={[{required: true}]}>
                        <Select
                            mode="multiple"
                            size="middle"
                            placeholder="Please select"
                            style={{
                                width: '100%',
                            }}
                        >
                            {permissionsOptions}
                        </Select>
                    </Form.Item>
                    <Form.Item {...tailLayout}>
                        <Button type="primary" htmlType="submit">
                            Submit
                        </Button>
                        <Button htmlType="button" onClick={onReset}>
                            Reset
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
            <Col span={24}>
                <Table dataSource={dataTest} columns={getColumns(permissions)}/>;
            </Col>
        </Row>
    </>
}

export default Roles;