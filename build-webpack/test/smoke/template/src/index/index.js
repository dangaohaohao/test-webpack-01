'use strict';

import React, { Component } from 'react';
import ReactDom from 'react-dom';
import logo from './assets/logo.jpg';
import cute from './assets/cute.jpg';
import {
  sayHello
} from '../../common/sayHello';
import './search.less';

class SearchButton extends Component {
  componentDidMount() {
    sayHello();
  }
  render() {
    return (
      <div className="container">
        <div className="search"> search button 336</div> <img className="picture" src={logo} />
        <img className="picture" src={cute} />
      </div>
    );
  }
}

ReactDom.render(<SearchButton />, document.querySelector('#root'));
