import React, { Component } from 'react';
import { map, range } from 'ramda';
import { Provider } from 'react-redux';
import logo from './logo.svg';
import CodeEditor from './CodeMirrorWithRedux';
import './App.css';
import { configureStore } from './store';
class App extends Component {
  render() {
    const codeEditors = range(0,50);
    return (
      <Provider store={configureStore()}>
        <div className="App">
          <header className="App-header">
            <img src={logo} className="App-logo" alt="logo" />
            <h1 className="App-title">Welcome to React</h1>
          </header>
            {
              map((index) => {
                return (
                  <div>
                    <CodeEditor id={index} />
                    <br />
                  </div>
                )
              }, codeEditors)
            }
        </div>
      </Provider>
    );
  }
}

export default App;
