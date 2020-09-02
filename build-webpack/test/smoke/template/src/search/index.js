'use strict';

import React, { Component } from 'react';
import ReactDom from 'react-dom';
import {
  sayHello
} from '../../common/sayHello';
import { testTreeShaking} from '../../utils/test';

class Search extends Component {
  constructor() {
    super();
    this.state = {
      Text: null
    }
  }
  componentDidMount() {
    sayHello();
  }
  handleClick() {
    import('./testDynamic.js').then((Text) => {
      this.setState({
        Text: Text.default,
      })
    })
  }
  render() {
    let {Text} = this.state;
    return (
      <div className="container">
        <button onClick={this.handleClick.bind(this)}>点击</button>
        {
          Text ? <Text /> : null
        }
      </div>
    );
  }
}

ReactDom.render(<Search />, document.querySelector('#root'));
