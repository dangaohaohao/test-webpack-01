'use strict';

import React, { Component } from 'react';
import ReactDom from 'react-dom';
import {
  sayHello
} from '../../common/sayHello';
import { testTreeShaking} from '../../utils/test';

class Search extends Component {
  componentDidMount() {
    sayHello();
  }
  render() {
    return (
      <div className="container">
        search
      </div>
    );
  }
}

ReactDom.render(<Search />, document.querySelector('#root'));
