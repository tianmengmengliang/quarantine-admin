import React, { Component, PropTypes } from 'react';
import * as styles from './rl.less'
// import MenuSlider from '../../channel/components/menuSlider/MenuSlider.jsx'

/*
* @constructor 保温箱左右导航，右边内容布局组件
* @extends Component
* @export
* */

class RL extends Component{
    constructor(props){
        super(props);
        this.state={}
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
            <div className={styles["yzh-rl"]}>
                <div className={styles["yzh-rl-left-container"]} style={leftStyle}>
                    {LeftContent}
                </div>
                <div className={styles["yzh-rl-right-container"]} style={rightStyle}>
                    <div className="template">
                        {RightContent || this.props.children}
                    </div>
                </div>
            </div>
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

export default RL;