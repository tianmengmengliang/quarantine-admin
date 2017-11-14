import React, { Component, PropTypes } from 'react';
import MainLayout from '../components/layouts/MainLayout/MainLayout';
import styles from './index.less';

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
    };
  }

  render(){
    return (
      <MainLayout>
        <div className={styles.wrap}>用户中心-首页</div>
      </MainLayout>
    );
  }
};

export default App;
