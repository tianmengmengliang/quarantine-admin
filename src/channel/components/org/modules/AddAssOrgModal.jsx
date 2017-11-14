import React, { Component, PropTypes } from 'react';
import {ModalA} from '../../../../components/'

function noop(){}

class AddAssOrgModal extends Component{

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
        const {title, visible, confirmLoading, ...props} = this.props;
        return (
            <ModalA
                confirmLoading={confirmLoading}
                title={title}
                visible={visible}
                okText="确定"
                cancelText="取消"
                onOk={this.onOk}
                onCancel={this.onCancel}
                {...props}>
            </ModalA>
        )
    }
}

AddAssOrgModal.propTypes = {
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

AddAssOrgModal.defaultProps = {
    prefix: 'yzh',
    visible: false,
    callback: noop,
};

export default AddAssOrgModal;
