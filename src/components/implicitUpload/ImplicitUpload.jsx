import React, { Component, PropTypes } from 'react';
import {Button, Icon} from 'antd'

class ImplicitUpload extends Component{
    constructor(props){
        super(props)
    }

    render(){
        console.log(props);
        const {children, name, uploadProps, ...props} = this.props;
        return (
                <Upload name={} {...props}>
                    {children}
                    <Input type="hidden" />
                </Upload>
        )
    }
}

ImplicitUpload.propTypes = {
    prefix: PropTypes.string,
    children: PropTypes.any
};

ImplicitUpload.defaultProps = {
    clsPrefix: 'yzh',
    children:  <Button><Icon type="upload" /> Click to Upload</Button>
};

export default ImplicitUpload;