import React, { Component, PropTypes } from 'react';
import { Row, Col, Icon } from 'antd';
import { Router, Route, IndexRoute, Link } from 'react-router';
import * as styles from './loginMainLayout.less'
import * as img from 'antd/../../public/assets/img/login.jpg'

class LoginMainLayout extends Component{
    static defaultProps={
        contentMinHeight: "100%"
    };

    constructor(props){
        super(props);
        this.state={
            contentMinHeight: this.props.contentMinHeight
        }
    }

    componentDidMount() {
       /* $(window).on("resize",(e)=>{
            this.setState({
                contentMinHeight: ($(window).height()-50-34-20-20) > this.props.contentMinHeight ? $(window).height()-50-34-20-20 : this.props.contentMinHeight
            });
        })*/
    }

    render(){
        {/*<div className={styles.wrap} style={{minHeight: this.state.contentMinHeight}}>
         {/!*<Row className={styles.head}>
         <Col span={18} className={styles.logo}>
         <a href="/#">浙江省特殊物品出入境集中查验监管信息平台</a>
         </Col>
         </Row>*!/}
         <Row className={styles.content} style={{minHeight:this.state.contentMinHeight,backgroundImage:`url(${img.default})`,backgroundSize:"cover",backgroundPosition:"0 50%",marginLeft:"-6%", backgroundRepeat:"no-repeat"}}>
         {this.props.children}
         </Row>
         {/!*<Row className={styles.foot}>
         <Col span={24}>©2015 - 2016 Yizhihui Inc. All Rights Reserved.</Col>
         </Row>*!/}
         </div>*/}
        return (
        <Row className={styles.content} style={{minHeight:this.state.contentMinHeight, height: '100%', backgroundImage:`url(${img.default})`,backgroundSize:"cover",backgroundPosition:"50% 50%",backgroundRepeat:"no-repeat"}}>
            {this.props.children}
        </Row>
        )
    }
}

LoginMainLayout.propTypes = {
    children: PropTypes.element.isRequired
};

export default LoginMainLayout;
