import React, { Component, PropTypes } from 'react';
import {Modal} from 'antd'
import {ModalA, ModalContent} from '../../components/'
import AddAssOrgContent from './AddAssOrgContent.jsx'

function noop(){}

class AddAssOrg extends Component{
    constructor(props){
        super(props);
        this.state = {
            confirmLoading: false,
        }
    }

    onOk = ()=> {
        return new Promise((resolve, reject) => {
            setTimeout(Math.random() > 0.5 ? resolve : reject, 1000);
        }).catch(() => console.log('Oops errors!'));
    };

    onCancel = ()=> {

    };

    render(){
        const {title, visible, data} = this.props;
        const {confirmLoading} = this.state;
        return (
            <ModalA
                confirmLoading={confirmLoading}
                title={title}
                visible={true}
                okText="确定"
                cancelText="取消"
                onOk={this.onOk}
                onCancel={this.onCancel}
                >
                <ModalContent>
                    <AddAssOrgContent />
                </ModalContent>
            </ModalA>
        )
    }
}

AddAssOrg.propTypes = {

};

AddAssOrg.defaultProps = {
    modalInfo: {},
    callback: noop,
};

export default AddAssOrg;
