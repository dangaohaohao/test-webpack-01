'use strict';

import React, { Component } from 'react';
import ReactDom from 'react-dom';

class Search extends Component {
  render() {
    return (
      <div className="container">
        search
      </div>
    );
  }
}

ReactDom.render(<Search />, document.querySelector('#root'));
