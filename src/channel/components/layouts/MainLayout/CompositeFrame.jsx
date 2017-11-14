import React, { Component, PropTypes } from 'react';
import MainLayout from './MainLayout2.jsx';

class CompositeFrame extends Component {

    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render(){
        return (
            <MainLayout>
                {this.props.children}
            </MainLayout>
        );
    }
}

export default CompositeFrame;
