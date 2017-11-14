import React, { Component, PropTypes } from 'react';
import {Form, Input, Checkbox, Radio, Upload, Button, Icon} from 'antd'
import {ButtonContainer, UploadButton, GridForm} from '../../../../components/'
const FormInlineItem = GridForm.InlineItem;

class EditOrgInfo extends Component{

    _retInitialState = ()=>{
        return {
            confirmLoading: false,
        }
    };

    constructor(props){
        super(props);
        super(props);
        this.state = this._retInitialState()
    }

    /*
     * @interface 表单提交给上层组件
     * @param {object} 事件对象
     * */
    handleSubmit = (e)=>{
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (err) {
                console.log('form has err', err)
                return ;
            }

            console.log('form has values', values)
        });
    };

    /*
     * @interface 重置表单域
     * @param {array | undefined} fieldsName 表单域的name
     * */
    resetFields = (fieldsName)=>{
        e.preventDefault();
        this.props.form.resetFields(fieldsName)
    };

    /*
    * @interface 上传文件钱的hook
    * @param {object} 当前上传文件信息
    * */
    beforeUpload = (file)=> {

    };

    handlePreview = (file) => {
       console.log(file)
    };

    handleRemove = (file)=>{
        console.log(file)
    };

    /*
    * @interface
    * */
    handleUploadChange = (info) => {
        console.log(info);

        let fileList = info.fileList;

        // 1. Limit the number of uploaded files
        //    Only to show two recent uploaded files, and old ones will be replaced by the new
        fileList = fileList.slice(-2);

        // 2. read from response and show file link
        fileList = fileList.map((file) => {
            if (file.response) {
                // Component will show file.url as link
                file.url = file.response.filePath;
            }
            return file;
        });

        // 3. filter successfully uploaded files according to response from server
        fileList = fileList.filter((file) => {
            if (file.response) {
                return file.response.success;
            }
        });


        if (info.file.status === 'done') {
            // Get this url from response in real world.
            // getBase64(info.file.originFileObj, imageUrl => this.setState({ imageUrl }));
        }
    };

    render(){
        const {prefix, ...props} = this.props;
        const { getFieldDecorator } = this.props.form;
        const blockFromItemLayout = {
            labelCol: { span:4 },
            wrapperCol: { span: 20 },
        };
        const formItemLayout = {
            labelCol: { span:8 },
            wrapperCol: { span: 16 },
        };

        const uploadProps = {
            action: 'http://192.168.1.101:8080/upload',
            data: {orgId: 1},
            headers: {},
            // accept: '',
            multiple: false,
            onChange: this.handleUploadChange,
           /* customRequest:{
                action: '',
                headers: {},
                onProgress: ,
                onError: ,
                data: {},
                filename: '',
                file: {},
                withCredentials: false,

            },*/
            showUploadList: false

        };
        return (
            <div {...props}>
            <GridForm
                horizontal>
                <FormInlineItem
                    {...formItemLayout}
                    label="单位名称"
                    hasFeedback
                    >
                        {getFieldDecorator('input1', {
                            rules: [
                                { required: true, message: 'Please select your country!' },
                            ]
                        })(
                            <Input // style={{ width: '65%', marginRight: '3%' }}
                                />
                        )}
                </FormInlineItem>
                <FormInlineItem
                    {...formItemLayout}
                    label="机构代码"
                    hasFeedback
                    >
                    {getFieldDecorator('input2', {
                        rules: [
                            { required: true, message: 'Please select your country!' },
                        ]
                    })(
                        <Input // style={{ width: '65%', marginRight: '3%' }}
                            />
                    )}
                </FormInlineItem>

                <FormInlineItem
                    {...formItemLayout}
                    label="单位英文名称"
                    hasFeedback
                    >
                    {getFieldDecorator('input3', {
                        rules: [
                            { required: true, message: 'Please select your country!' },
                        ]
                    })(
                        <Input // style={{ width: '65%', marginRight: '3%' }}
                            />
                    )}
                </FormInlineItem>
                <FormInlineItem
                    {...formItemLayout}
                    label="法人代表"
                    hasFeedback
                    >
                    {getFieldDecorator('input4', {
                        rules: [
                            { required: true, message: 'Please select your country!' },
                        ]
                    })(
                        <Input // style={{ width: '65%', marginRight: '3%' }}
                            />
                    )}
                </FormInlineItem>

                <FormInlineItem
                    {...formItemLayout}
                    label="生物安全负责人"
                    hasFeedback
                    >
                    {getFieldDecorator('input5', {
                        rules: [
                            { required: true, message: 'Please select your country!' },
                        ]
                    })(
                        <Input // style={{ width: '65%', marginRight: '3%' }}
                            />
                    )}
                </FormInlineItem>
                <FormInlineItem
                    {...formItemLayout}
                    label="经营范围"
                    hasFeedback
                    >
                    {getFieldDecorator('input6', {
                        rules: [
                            { required: true, message: 'Please select your country!' },
                        ]
                    })(
                        <Input // style={{ width: '65%', marginRight: '3%' }}
                            />
                    )}
                </FormInlineItem>

                    <FormInlineItem
                        span={24}
                        {...formItemLayout}
                        labelCol={{span: 4}}
                        wrapperCol={{span: 20}}
                        label="单位性质"
                        hasFeedback
                        >
                        {getFieldDecorator('input7', {
                            valuePropName: 'value',
                            initialValue: ['Apple'],
                            rules: [
                                { required: true, message: 'Please select your country!' },
                            ]
                        })(
                            <Checkbox.Group options={[
  { label: 'Apple', value: 'Apple' },
  { label: 'Pear', value: 'Pear' },
  { label: 'Orange', value: 'Orange' }
]} />
                        )}
                    </FormInlineItem>

                    <FormInlineItem
                        {...formItemLayout}
                        label="单位营业执照/事业单位法人证书"
                        hasFeedback
                        >
                        {getFieldDecorator('input8', {
                            rules: [
                                { required: true, message: 'Please select your country!' },
                            ]
                        })(
                            <Input type="hidden" // style={{ width: '65%', marginRight: '3%' }}
                                />
                        )}
                        <Upload
                            {...uploadProps}
                           >
                            <Button>
                                <Icon type="upload" /> Click to upload
                            </Button>
                        </Upload>
                    </FormInlineItem>
                    <FormInlineItem
                        {...formItemLayout}
                        label="实验室生物安全登记证明"
                        hasFeedback
                        >
                        {getFieldDecorator('input9', {
                            rules: [
                                { required: true, message: 'Please select your country!' },
                            ]
                        })(
                            <Input // style={{ width: '65%', marginRight: '3%' }}
                                />
                        )}
                    </FormInlineItem>

                    <FormInlineItem
                        {...formItemLayout}
                        label="组织机构证"
                        hasFeedback
                        >
                        {getFieldDecorator('input10', {
                            rules: [
                                { required: true, message: 'Please select your country!' },
                            ]
                        })(
                            <Input // style={{ width: '65%', marginRight: '3%' }}
                                />
                        )}
                    </FormInlineItem>
                    <FormInlineItem
                        {...formItemLayout}
                        label="单位基本情况资料"
                        hasFeedback
                        >
                        {getFieldDecorator('input11', {
                            rules: [
                                { required: true, message: 'Please select your country!' },
                            ]
                        })(
                            <Input // style={{ width: '65%', marginRight: '3%' }}
                                />
                        )}
                    </FormInlineItem>

                    <FormInlineItem
                        {...formItemLayout}
                        label="生物安全体系文件"
                        hasFeedback
                        >
                        {getFieldDecorator('input12', {
                            rules: [
                                { required: true, message: 'Please select your country!' },
                            ]
                        })(
                            <Input // style={{ width: '65%', marginRight: '3%' }}
                                />
                        )}
                    </FormInlineItem>
                    <FormInlineItem
                        {...formItemLayout}
                        label="其他特殊说明资质"
                        hasFeedback
                        >
                        {getFieldDecorator('input13', {
                            rules: [
                                { required: true, message: 'Please select your country!' },
                            ]
                        })(
                            <Input // style={{ width: '65%', marginRight: '3%' }}
                                />
                        )}
                    </FormInlineItem>

                <FormInlineItem
                    {...formItemLayout}
                    span={24}
                    label="生产资质及认证证书"
                    hasFeedback
                    >
                    {getFieldDecorator('input-m1', {
                        rules: [
                            { required: true, message: 'Please select your country!' },
                        ]
                    })(
                        <Input type="hidden" // style={{ width: '65%', marginRight: '3%' }}
                            />
                    )}
                    <Upload
                        {...uploadProps}
                        >
                        <Button>
                            <Icon type="upload" /> Click to upload
                        </Button>
                    </Upload>
                </FormInlineItem>

                <FormInlineItem
                    {...formItemLayout}
                    label="对外贸易经营者备案登记表"
                    hasFeedback
                    >
                    {getFieldDecorator('input-m1', {
                        rules: [
                            { required: true, message: 'Please select your country!' },
                        ]
                    })(
                        <Input type="hidden" // style={{ width: '65%', marginRight: '3%' }}
                            />
                    )}
                    <Upload
                        {...uploadProps}
                        >
                        <Button>
                            <Icon type="upload" /> Click to upload
                        </Button>
                    </Upload>
                </FormInlineItem>
                <FormInlineItem
                    {...formItemLayout}
                    label="仓库"
                    hasFeedback
                    >
                    {getFieldDecorator('input-m1', {
                        rules: [
                            { required: true, message: 'Please select your country!' },
                        ]
                    })(
                        <Input type="hidden" // style={{ width: '65%', marginRight: '3%' }}
                            />
                    )}
                    <Upload
                        {...uploadProps}
                        >
                        <Button>
                            <Icon type="upload" /> Click to upload
                        </Button>
                    </Upload>
                </FormInlineItem>

                    <FormInlineItem
                        {...formItemLayout}
                        label="拟出入境物品清单"
                        hasFeedback
                        >
                        {getFieldDecorator('input14', {
                            rules: [
                                { required: true, message: 'Please select your country!' },
                            ]
                        })(
                            <Input // style={{ width: '65%', marginRight: '3%' }}
                                />
                        )}
                    </FormInlineItem>
                    <FormInlineItem
                        {...formItemLayout}
                        label="其他材料"
                        hasFeedback
                        >
                        {getFieldDecorator('input15', {
                            rules: [
                                { required: true, message: 'Please select your country!' },
                            ]
                        })(
                            <Input // style={{ width: '65%', marginRight: '3%' }}
                                />
                        )}
                    </FormInlineItem>

                    <FormInlineItem
                        span={24}
                        labelCol={{span: 4}}
                        wrapperCol={{span: 20}}
                        label="特殊物品类别"
                        hasFeedback
                        >
                        {getFieldDecorator('input16', {
                            rules: [
                                { required: true, message: 'Please select your country!' },
                            ]
                        })(
                            <Input // style={{ width: '65%', marginRight: '3%' }}
                                />
                        )}
                    </FormInlineItem>

                    <FormInlineItem
                        {...formItemLayout}
                        label="联系人"
                        hasFeedback
                        >
                        {getFieldDecorator('input17', {
                            rules: [
                                { required: true, message: 'Please select your country!' },
                            ]
                        })(
                            <Input // style={{ width: '65%', marginRight: '3%' }}
                                />
                        )}
                    </FormInlineItem>
                    <FormInlineItem
                        {...formItemLayout}
                        label="手机号码"
                        hasFeedback
                        >
                        {getFieldDecorator('input18', {
                            rules: [
                                { required: true, message: 'Please select your country!' },
                            ]
                        })(
                            <Input // style={{ width: '65%', marginRight: '3%' }}
                                />
                        )}
                    </FormInlineItem>

                    <FormInlineItem
                        span={24}
                        labelCol={{span: 4}}
                        wrapperCol={{span: 20}}
                        label="联系人QQ"
                        hasFeedback
                        >
                        {getFieldDecorator('input19', {
                            rules: [
                                { required: true, message: 'Please select your country!' },
                            ]
                        })(
                            <Input // style={{ width: '65%', marginRight: '3%' }}
                                />
                        )}
                    </FormInlineItem>

                    <FormInlineItem
                        {...formItemLayout}
                        label="电子邮件"
                        hasFeedback
                        >
                        {getFieldDecorator('input20', {
                            rules: [
                                { required: true, message: 'Please select your country!' },
                            ]
                        })(
                            <Input // style={{ width: '65%', marginRight: '3%' }}
                                />
                        )}
                    </FormInlineItem>
                    <FormInlineItem
                        {...formItemLayout}
                        label="辖区监管机构"
                        hasFeedback
                        >
                        {getFieldDecorator('input21', {
                            rules: [
                                { required: true, message: 'Please select your country!' },
                            ]
                        })(
                            <Input // style={{ width: '65%', marginRight: '3%' }}
                                />
                        )}
                    </FormInlineItem>

                    <FormInlineItem
                        {...formItemLayout}
                        label="固定电话"
                        hasFeedback
                        >
                        {getFieldDecorator('input22', {
                            rules: [
                                { required: true, message: 'Please select your country!' },
                            ]
                        })(
                            <Input // style={{ width: '65%', marginRight: '3%' }}
                                />
                        )}
                    </FormInlineItem>
                    <FormInlineItem
                        {...formItemLayout}
                        label="邮政编码"
                        hasFeedback
                        >
                        {getFieldDecorator('input23', {
                            rules: [
                                { required: true, message: 'Please select your country!' },
                            ]
                        })(
                            <Input // style={{ width: '65%', marginRight: '3%' }}
                                />
                        )}
                    </FormInlineItem>

                    <FormInlineItem
                        {...formItemLayout}
                        label="传真"
                        hasFeedback
                        >
                        {getFieldDecorator('input24', {
                            rules: [
                                { required: true, message: 'Please select your country!' },
                            ]
                        })(
                            <Input // style={{ width: '65%', marginRight: '3%' }}
                                />
                        )}
                      </FormInlineItem>
                    <FormInlineItem
                        {...formItemLayout}
                        label="注册地址"
                        hasFeedback
                        >
                        {getFieldDecorator('input25', {
                            rules: [
                                { required: true, message: 'Please select your country!' },
                            ]
                        })(
                            <Input // style={{ width: '65%', marginRight: '3%' }}
                                />
                        )}
                    </FormInlineItem>

                    <FormInlineItem
                        {...formItemLayout}
                        label="地址"
                        hasFeedback
                        >
                        {getFieldDecorator('input26', {
                            rules: [
                                { required: true, message: 'Please select your country!' },
                            ]
                        })(
                            <Input // style={{ width: '65%', marginRight: '3%' }}
                                />
                        )}
                    </FormInlineItem>
                    <FormInlineItem
                        {...formItemLayout}
                        label="注册资金(万美元)"
                        hasFeedback
                        >
                        {getFieldDecorator('input27', {
                            rules: [
                                { required: true, message: 'Please select your country!' },
                            ]
                        })(
                            <Input // style={{ width: '65%', marginRight: '3%' }}
                                />
                        )}
                    </FormInlineItem>

                    <FormInlineItem
                        span={24}
                        labelCol={{span: 4}}
                        wrapperCol={{span: 20}}
                        label="公司简介"
                        hasFeedback
                        >
                        {getFieldDecorator('input28', {
                            rules: [
                                { required: true, message: 'Please select your country!' },
                            ]
                        })(
                            <Input // style={{ width: '65%', marginRight: '3%' }}
                                />
                        )}
                    </FormInlineItem>

                <FormInlineItem span={24}>
                    <ButtonContainer>
                        <UploadButton onClick={this.handleSubmit} />
                    </ButtonContainer>
                </FormInlineItem>
                </GridForm>
            </div>
        )
    }
}

EditOrgInfo.propTypes = {
    prefix: PropTypes.string,
};

EditOrgInfo.defaultProps = {
    prefix: 'yzh'
};

EditOrgInfo = GridForm.create()(EditOrgInfo);

export default EditOrgInfo;