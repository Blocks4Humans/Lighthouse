import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route } from 'react-router'
import { DrizzleProvider } from 'drizzle-react'
import { Provider } from 'react-redux'

// Layouts
import App from './App'
import { LoadingContainer } from 'drizzle-react-components'

import { history, store } from './store'
import drizzleOptions from './drizzleOptions'

ReactDOM.render((
    <DrizzleProvider options={drizzleOptions} store={store}>
        <Provider store={store}>
          <LoadingContainer>
            <Router history={history} store={store}>
              <Route exact path="/" component={App} />
            </Router>
          </LoadingContainer>
      </Provider>
    </DrizzleProvider>
  ),
  document.getElementById('root')
);
