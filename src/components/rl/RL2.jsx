import React, { Component, PropTypes } from 'react';
import { connect } from 'dva'
import { Layout, Icon } from 'antd';
import cx from 'classnames'
const { Header, Sider, Content } = Layout;
import './rl2.less'
// import MenuSlider from '../../channel/components/menuSlider/MenuSlider.jsx'

/*
 * @constructor 保温箱左右导航，右边内容布局组件
 * @extends Component
 * @export
 * */

class RL extends Component{
    constructor(props){
        super(props);
        this.state={
            collapsed: false
        }
    }

    getLeftContent = (leftContent)=>{
        if(typeof leftContent === 'function'){
            return <leftContent />
        }else{
            return leftContent
        }
    };

    getRightContent = (rightContent)=>{
        if(typeof rightContent === 'function'){
            return <rightContent />
        }else{
            return rightContent
        }
    };

    toggle = () => {
        this.props.dispatch({
            type: 'menuSlider/triggerCollapse',
            payload: {
                collapsed: !this.state.collapsed
            }
        });
        this.setState({
            collapsed: !this.state.collapsed,
        });
    }

    render(){
        const {leftContent,rightContent,leftContentStyle={},rightContentStyle={}}=this.props;
        const LeftContent = this.getLeftContent(leftContent), RightContent = this.getRightContent(rightContent);
        const leftStyle=leftContentStyle.width || typeof leftContentStyle.width==='number' || typeof leftContentStyle.width==='string'
            ? typeof leftContentStyle.width==='number'?{width:`${leftContentStyle.width}px`}:{width:leftContentStyle.width}
            :{};
        const rightStyle=leftContentStyle.width || typeof leftContentStyle.width==='number' || typeof leftContentStyle.width==='string'
            ? typeof leftContentStyle.width==='number' ? {marginLeft:`${leftContentStyle.width}px`} : {marginLeft:leftContentStyle.width}
            :{}

        return (
            <Layout className={'yzh-rl'} style={{backgroundColor: '#ffffff'}}>
                <Sider
                    className={cx({
                        [`yzh-rl-container`]: true,
                        [`yzh-rl-left-container`]: true,
                        [`yzh-rl-left-container-fold`]: this.state.collapsed,
                        [`yzh-rl-left-container-unfold`]: !this.state.collapsed
                    })}
                    style={{backgroundColor: '#ffffff'}}
                    trigger={null}
                    collapsible
                    collapsed={this.state.collapsed}
                    >
                    <div className={'trigger-container'}>
                        <Icon
                            className={'trigger'}
                            type={this.state.collapsed ? 'menu-unfold' : 'menu-fold'}
                            onClick={this.toggle}
                            />
                    </div>
                    {LeftContent}
                </Sider>

                <Content
                    className={
                        cx({
                            [`yzh-rl-container`]: true,
                            [`yzh-rl-right-container`]: true,
                            [`yzh-rl-right-container-fold`]: !this.state.collapsed,
                            [`yzh-rl-right-container-unfold`]: this.state.collapsed
                        })
                    }>
                    <div className="template">
                        {RightContent || this.props.children}
                    </div>
                </Content>
            </Layout>
        )
    }
}

RL.propTypes={
    leftContent:PropTypes.any,
    rightContent:PropTypes.any,
    leftContainerStyle:PropTypes.object.isRequired,
    rightContainerStyle:PropTypes.object.isRequired
};

RL.defaultProps={
    leftContent:undefined,
    rightContent:undefined,
    leftContainerStyle:{},
    rightContainerStyle:{}
};

function mapStateToProps({},ownProps){
    return {

    }
}

export default connect(mapStateToProps)(RL);
