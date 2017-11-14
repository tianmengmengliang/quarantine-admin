import React, { Component, PropTypes } from 'react';
import { Row, Col, Icon } from 'antd';
import { Router, Route, IndexRoute, Link } from 'react-router';
import styles from './MainLayout.less';
import Header from './Header.jsx';

class MainLayout extends Component{
  static defaultProps={
    contentMinHeight: 600
  };

  constructor(props){
    super(props);
    this.state={
      contentMinHeight: this.props.contentMinHeight
    }
  }

  changeOptionCallback(values){
    let self=this;

    function successCallback(d){
      localStroage.setItem("appId",d.appId)
    }
    //xFetch('listmodule',{appId:values.appId},successCallback,null,'post');

    //successCallback();
  }

  componentDidMount() {
    /*$(window).on("resize",(e)=>{
      this.setState({
        contentMinHeight: ($(window).height()-50-34-20-20) > this.props.contentMinHeight ? $(window).height()-50-34-20-20 : this.props.contentMinHeight
      });
    })*/
  }

  render(){
    return (
        <div className={styles.wrap}>
          <Header
              callback={this.changeOptionCallback.bind(this)}
              />
          <Row className={styles.content} style={{minHeight:this.state.contentMinHeight}}>
            <Col span={24}>
              {this.props.children}
            </Col>
          </Row>
          <Row className={styles.foot}>
            <Col span={24}>©2015 - 2016 Yizhihui Inc. All Rights Reserved.</Col>
          </Row>
        </div>
    )
  }
}

MainLayout.propTypes = {
  children: PropTypes.element.isRequired
};

export default MainLayout;
