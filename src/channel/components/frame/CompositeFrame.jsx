import React, { Component, PropTypes } from 'react';

class CompositeFrame extends Component {

    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render(){
        return (
            <div>
                {this.props.children}
            </div>
        );
    }
}

export default CompositeFrame;
