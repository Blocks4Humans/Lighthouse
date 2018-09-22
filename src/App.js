import React, { Component } from 'react'
import { Route } from 'react-router'
import Home from './layouts/home/Home'


// Styles
import './css/oswald.css'
import './css/open-sans.css'
import './css/pure-min.css'
import './App.css'

class App extends Component {
  render() {
    return (
      <div className="App">
        <Route exact path="/" component={Home}/>
      </div>
    );
  }
}

export default App
