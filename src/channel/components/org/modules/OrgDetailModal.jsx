import React, { Component, PropTypes } from 'react';
import {ModalA, BodyGridTable} from '../../../../components/'

function noop(){}

class OrgDetailModal extends Component{
    _retInitialState = ()=>{
        return {
            confirmLoading: false,
        }
    };
    constructor(props){
        super(props);
        this.state = this._retInitialState()
    }

    onOk = ()=> {
        return new Promise((resolve, reject) => {
            setTimeout(Math.random() > 0.5 ? resolve : reject, 1000);
        }).catch(() => console.log('Oops errors!'));
    };

    onCancel = ()=> {

    };

    render(){
        const {title, visible, ...props} = this.props;
        const {confirmLoading} = this.state;
        const rows=[
            [
                {
                    key: 'r1 c1',
                    title: '单位名称',
                    span: 3
                },
                {
                    key: 'r1 c2',
                    title: '单位名称',
                    span: 9,
                    formatter:(colMetaData)=>{

                    }
                },

                {
                    key: 'r1 c3',
                    title: '机构代码',
                    span: 3
                },
                {
                    key: 'r1 c4',
                    title: '单位名称',
                    span: 9,
                    formatter:(colMetaData)=>{

                    }
                }
            ],
            [
                {
                    key: 'r1 c1',
                    title: '单位英文名称',
                    span: 3
                },
                {
                    key: 'r1 c2',
                    title: '单位名称',
                    span: 9,
                    formatter:(colMetaData)=>{

                    }
                },

                {
                    key: 'r1 c3',
                    title: '经营范围',
                    span: 3
                },
                {
                    key: 'r1 c4',
                    title: '单位名称',
                    span: 9,
                    formatter:(colMetaData)=>{

                    }
                }
            ],
            [
                {
                    key: 'r3 c1',
                    title: '生物安全负责人',
                    span: 3
                },
                {
                    key: 'r3 c2',
                    title: '单位名称',
                    span: 9,
                    formatter:(colMetaData)=>{

                    }
                },

                {
                    key: 'r3 c3',
                    title: '法人代表',
                    span: 3
                },
                {
                    key: 'r3 c4',
                    title: '单位名称',
                    span: 9,
                    formatter:(colMetaData)=>{

                    }
                }
            ],
            [
                {
                    key: 'r1 c1',
                    title: '单位性质',
                    span: 6
                },
                {
                    key: 'r1 c2',
                    title: '单位名称',
                    span: 18,
                    formatter:(colMetaData)=>{

                    }
                }
            ],
            [
                {
                    key: 'r1 c1',
                    title: '单位营业执照/事业单位法人证书',
                    span: 3
                },
                {
                    key: 'r1 c2',
                    title: '单位名称',
                    span: 9,
                    formatter:(colMetaData)=>{

                    }
                },

                {
                    key: 'r1 c3',
                    title: '单位营业执照/事业单位法人证书',
                    span: 3
                },
                {
                    key: 'r1 c4',
                    title: '单位名称',
                    span: 9,
                    formatter:(colMetaData)=>{

                    }
                }
            ],
            [
                {
                    key: 'r1 c1',
                    title: '组织机构证',
                    span: 3
                },
                {
                    key: 'r1 c2',
                    title: '单位名称',
                    span: 9,
                    formatter:(colMetaData)=>{

                    }
                },

                {
                    key: 'r1 c3',
                    title: '单位基本情况资料',
                    span: 3
                },
                {
                    key: 'r1 c4',
                    title: '单位名称',
                    span: 9,
                    formatter:(colMetaData)=>{

                    }
                }
            ],
            [
                {
                    key: 'r1 c1',
                    title: '生物安全体系文件',
                    span: 3
                },
                {
                    key: 'r1 c2',
                    title: '单位名称',
                    span: 9,
                    formatter:(colMetaData)=>{

                    }
                },

                {
                    key: 'r1 c3',
                    title: '其他特殊说明资质',
                    span: 3
                },
                {
                    key: 'r1 c4',
                    title: '单位名称',
                    span: 9,
                    formatter:(colMetaData)=>{

                    }
                }
            ],
            [
                {
                    key: 'r1 c1',
                    title: '拟出入境物品清单',
                    span: 3
                },
                {
                    key: 'r1 c2',
                    title: '单位名称',
                    span: 9,
                    formatter:(colMetaData)=>{

                    }
                },

                {
                    key: 'r1 c3',
                    title: '其他材料',
                    span: 3
                },
                {
                    key: 'r1 c4',
                    title: '单位名称',
                    span: 9,
                    formatter:(colMetaData)=>{

                    }
                }
            ],
            [
                {
                    key: 'r1 c1',
                    title: '特殊物品类别',
                    span: 6
                },
                {
                    key: 'r1 c2',
                    title: '单位名称',
                    span: 18,
                    formatter:(colMetaData)=>{

                    }
                }
            ],
            [
                {
                    key: 'r1 c1',
                    title: '联系人',
                    span: 3
                },
                {
                    key: 'r1 c2',
                    title: '单位名称',
                    span: 9,
                    formatter:(colMetaData)=>{

                    }
                },

                {
                    key: 'r1 c3',
                    title: '手机号码',
                    span: 3
                },
                {
                    key: 'r1 c4',
                    title: '单位名称',
                    span: 9,
                    formatter:(colMetaData)=>{

                    }
                }
            ],
            [
                {
                    key: 'r1 c1',
                    title: '联系人QQ',
                    span: 6
                },
                {
                    key: 'r1 c2',
                    title: '单位名称',
                    span: 18,
                    formatter:(colMetaData)=>{

                    }
                }
            ],
            [
                {
                    key: 'r1 c1',
                    title: '电子邮件',
                    span: 3
                },
                {
                    key: 'r1 c2',
                    title: '单位名称',
                    span: 9,
                    formatter:(colMetaData)=>{

                    }
                },

                {
                    key: 'r1 c3',
                    title: '监管辖区机构',
                    span: 3
                },
                {
                    key: 'r1 c4',
                    title: '单位名称',
                    span: 9,
                    formatter:(colMetaData)=>{

                    }
                }
            ],
            [
                {
                    key: 'r1 c1',
                    title: '固定电话',
                    span: 3
                },
                {
                    key: 'r1 c2',
                    title: '单位名称',
                    span: 9,
                    formatter:(colMetaData)=>{

                    }
                },

                {
                    key: 'r1 c3',
                    title: '邮政编码',
                    span: 3
                },
                {
                    key: 'r1 c4',
                    title: '单位名称',
                    span: 9,
                    formatter:(colMetaData)=>{

                    }
                }
            ],
            [
                {
                    key: 'r1 c1',
                    title: '传真',
                    span: 3
                },
                {
                    key: 'r1 c2',
                    title: '单位名称',
                    span: 9,
                    formatter:(colMetaData)=>{

                    }
                },

                {
                    key: 'r1 c3',
                    title: '注册地址',
                    span: 3
                },
                {
                    key: 'r1 c4',
                    title: '单位名称',
                    span: 9,
                    formatter:(colMetaData)=>{

                    }
                }
            ],
            [
                {
                    key: 'r1 c1',
                    title: '经营地址',
                    span: 3
                },
                {
                    key: 'r1 c2',
                    title: '单位名称',
                    span: 9,
                    formatter:(colMetaData)=>{

                    }
                },

                {
                    key: 'r1 c3',
                    title: '仓储地址',
                    span: 3
                },
                {
                    key: 'r1 c4',
                    title: '单位名称',
                    span: 9,
                    formatter:(colMetaData)=>{

                    }
                }
            ],
            [
                {
                    key: 'r1 c1',
                    title: '注册资金',
                    span: 3
                },
                {
                    key: 'r1 c2',
                    title: '单位名称',
                    span: 9,
                    formatter:(colMetaData)=>{

                    }
                },

                {
                    key: 'r1 c3',
                    title: '生产总值（万美元）',
                    span: 3
                },
                {
                    key: 'r1 c4',
                    title: '单位名称',
                    span: 9,
                    formatter:(colMetaData)=>{

                    }
                }
            ],
            [
                {
                    key: 'r1 c1',
                    title: '公司简介',
                    span: 6
                },
                {
                    key: 'r1 c2',
                    title: '单位名称',
                    span: 18,
                    formatter:(colMetaData)=>{

                    }
                }
            ]
        ];
        return (
            <ModalA
                confirmLoading={confirmLoading}
                title={title}
                visible={visible}
                okText="确定"
                cancelText="取消"
                onOk={this.onOk}
                onCancel={this.onCancel}
                {...props}
                >
                <BodyGridTable rows={rows}/>
            </ModalA>
        )
    }
}

OrgDetailModal.propTypes = {
    data: PropTypes.any,
    visible: PropTypes.bool.isRequired,
    title: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.node
    ]),
    okText: PropTypes.string,
    cancelText: PropTypes.string,
    onOk: PropTypes.func,
    onCancel: PropTypes.func,
    confirmLoading: PropTypes.bool,

    footer: PropTypes.any,
    maskClosable: PropTypes.bool,
    closable: PropTypes.bool,
    afterClose: PropTypes.func,
    style: PropTypes.object,
    width: PropTypes.any,
    prefix: PropTypes.string.isRequired
};

OrgDetailModal.defaultProps = {
    prefix: 'yzh',
    visible: false,
    callback: noop,
};

export default OrgDetailModal;
