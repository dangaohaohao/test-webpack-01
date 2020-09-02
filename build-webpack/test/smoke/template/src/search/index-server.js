// import React from 'react';
const React = require('react');
require('./index.less');

class Search extends React.Component {
  render() {
    return (
      <div className="container">
        <div className="pink">search</div>
        <span className="pinkSpan">Hello React</span>
      </div>
    );
  }
}

module.exports = <Search />;
