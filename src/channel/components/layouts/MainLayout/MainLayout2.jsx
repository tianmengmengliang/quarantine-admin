import React, { Component, PropTypes } from 'react';
import { Layout, Menu, Breadcrumb, Icon, Row, Col } from 'antd';
import moment from 'moment'
import Headers from './Header.jsx';
import styles from './MainLayout.less';
import logoImage from 'antd/../../public/assets/img/logo.png'
import { Router, Route, Link, Redirect, hashHistory } from 'react-router'; //引入路由标签,
const { Header, Content, Footer, Sider } = Layout;

class MainLayout2 extends Component{

    static defaultProps={
        contentMinHeight: 600
    };

    constructor(props){
        super(props);
        this.state = {
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
        return (
            <Layout>
                <Header style={{ background: '#fff', padding: 0, height: '100%' }}>
                    <Headers/>
                </Header>

                <Content className={styles.content} style={{minHeight:this.state.contentMinHeight,  background: '#fff'}}>
                    {this.props.children}
                </Content>

                <Footer style={{ textAlign: 'center', background: '#fff', padding: 0 }}>
                    <Row className={styles.foot}>
                        <Col span={24}>友情链接：
                          <a href="https://tswp.wcce.cn/loginController.do?login" target="_blank" >出入境特殊物品卫生检疫监管系统</a> |&nbsp;
                          <a href="http://wwww.zjwst.gov.cn:8088/KJLab/index.htm" target="_blank">浙江省病原微生物实验室管理信息网</a> |&nbsp;
                          <a href="http://www.eciq.cn/" target="_blank">中国检验检疫电子业务网</a> |&nbsp;
                          <a href="http://www.ziq.gov.cn/" target="_blank">浙江出入境检验检疫局</a> |&nbsp;
                          <a href="http://www.ha.ziq.gov.cn/portal/index.htm" target="_blank">杭州出入境检验检疫局</a>
                        </Col>
                        <Col span={24}>
                          <Link to="/note">浙江生物医药特殊物品出入境集中监管平台反馈留言板</Link> |&nbsp;
                          客服热线：0571-89028194 欢迎批评指正
                        </Col>
                        <Col span={24}>©2015 - {moment().get('year')} Yizhihui Inc. All Rights Reserved.</Col>
                    </Row>
                </Footer>
            </Layout>
        )
    }
}

export default MainLayout2
