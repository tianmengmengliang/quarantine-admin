import React, { Component, PropTypes } from 'react';
import { Row, Col, Icon } from 'antd';
import moment from 'moment'
import { Router, Route, IndexRoute, Link } from 'react-router';
import styles from '../MainLayout/MainLayout.less';
import logoImage from 'antd/../../public/assets/img/logo.png'

class SampleMainLayout extends Component{
  static defaultProps={
    contentMinHeight: 600
  };

  constructor(props){
    super(props);
    this.state={
      contentMinHeight: this.props.contentMinHeight
    }
  }

  componentDidMount() {
    $(window).on("resize",(e)=>{
      this.setState({
        contentMinHeight: ($(window).height()-50-34-20-20) > this.props.contentMinHeight ? $(window).height()-50-34-20-20 : this.props.contentMinHeight
      });
    })
  }

  render(){
    return (
        <div className={styles.wrap}>
          <Row className={styles.head}>
              <div className={styles.logo} style={{display: 'inline-block'}}>
                <img src={logoImage} style={{display: 'inline-block', height:64, marginRight: 16, verticalAlign: 'middle'}}/>
                <a href="/#">浙江生物医药特殊物品出入境集中监管平台</a>
              </div>
          </Row>
          <Row className={styles.content} style={{minHeight:this.state.contentMinHeight}}>
            <Col span={24}>
              {this.props.children}
            </Col>
          </Row>
          <Row className={styles.foot}>
            <Col span={24}>©2015 - {moment().get('year')} Yizhihui Inc. All Rights Reserved.</Col>
          </Row>
        </div>
    )
  }
}

SampleMainLayout.propTypes = {
  children: PropTypes.element.isRequired
};

export default SampleMainLayout;
