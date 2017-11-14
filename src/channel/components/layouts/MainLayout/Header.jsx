import React, { Component, PropTypes } from 'react';
import {Link} from 'react-router'
import { Row, Col, Icon, Select, Menu, Dropdown } from 'antd';
import styles from './header.less'
import xFetch from '../../../../services/xFetch.js'
import {connect} from 'dva'
import {fetch, CONFIG} from '../../../../services/'
import logoImage from 'antd/../../public/assets/img/logo.png'

class Header extends Component{

    constructor(props){
        super(props);
        this.state={
           user: {}
        };


    }

    componentDidMount(){
        /*this.getUserRoles({}, (err, res)=> {
            if (err) {
                return;
            }

            const {lsName, dispatch} = this.props;
            const {responseObject = []} = res;
            localStorage.setItem(lsName, JSON.stringify(responseObject));
            dispatch({
                type: 'userRole/changeUserRole',
                payload: responseObject
            });
            this.setState({
                user: Object.assign({}, responseObject[0])
            })
        });*/
        this.setState({
            user: Object.assign({}, JSON.parse(localStorage.getItem(CONFIG.lsNames.platform.USER)))
        })
    }


    componentWillReceiveProps(nextProps){

    }

    /*
    * @interface 获取用户角色身份信息
    * @param {object} _props 参数对象
    * @param {func} callback 回调函数
    * */
    getUserRoles = (data, callback)=>{
        fetch('platform.user.roles', {
            data: {...data},
            success: (res)=>{
                callback && callback(null, res);
            },
            error: (err)=>{
                callback && callback(err, null);
            },
            beforeSend: ()=>{

            },
            complete: (err, res)=>{

            }
        })
    };

    loginOut = ()=>{
        localStorage.setItem(`${CONFIG.token}`, '')
    };

    createNavMenu({user}){
        /*let {currentEmployee,channelList}=this.props;
         let isAdmin=currentEmployee&&currentEmployee.isAdmin;*/
        return (
            <Menu
                // onClick={this.handleClick.bind(this)}
                  mode="horizontal"
                  style={{backgroundColor:"transparent",border:"0",color:"#ffffff"}}
                >
                <Menu.SubMenu title={<span><Icon type="user" />{user.realName}</span>}>
                    <Menu.Item key="setting:1"><Link to="/user/reset">修改密码</Link></Menu.Item>
                    <Menu.Item key="setting:2"><Link to="/"  onClick={this.loginOut}>注销</Link></Menu.Item>
                </Menu.SubMenu>

                <Menu.SubMenu title={<span><Icon type="pushpin-o" />帮助</span>}>
                  <Menu.Item><a href="http://ciq.yizhijie.com/fileDownload/help.docx">使用说明</a></Menu.Item>
                  <Menu.Item>Q&A </Menu.Item>
                </Menu.SubMenu>
            </Menu>
        )
    }

    render(){
        const {user} = this.state;
        return (
            <Row className={styles.head}>
                <div>
                    <div className={styles.logo} style={{display: 'inline-block'}}>
                        <img src={logoImage} style={{display: 'inline-block', height:64, marginRight: 16, verticalAlign: 'middle'}}/>
                        <a href="/#">浙江生物医药特殊物品出入境集中监管平台</a>
                    </div>
                    <div className={styles.navMenu}>
                        {this.createNavMenu({user})}
                    </div>
                </div>
            </Row>
        )
    }
}

const mapStateToProps=({user},ownProps)=>{
    return {

    }
};

Header.propTypes = {
    prefix: PropTypes.string,
    lsName: PropTypes.string
};

Header.defaultProps = {
    prefix: 'yzh',
    lsName: `${CONFIG.lsNames.platform['USER_ROLE']}`
};

Header = connect(mapStateToProps)(Header);

export default Header;
