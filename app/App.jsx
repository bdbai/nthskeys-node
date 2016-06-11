import React from 'React';
import { render } from 'ReactDOM';
import { Router, Route, IndexRoute } from 'ReactRouter';

import HeaderSection from './components/HeaderSection';

const ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

class App extends React.Component {
    render() {
        return (
            <div>
                <HeaderSection />
                <ReactCSSTransitionGroup transitionName="tran" transitionEnterTimeout={500} transitionLeaveTimeout={250}>
                    <div className="container" key={this.props.location.pathname}>
                        {this.props.children}
                    </div>
                </ReactCSSTransitionGroup>
            </div>
        );
    }
}

var rootInstance = render((
  <Router>
    <Route path="/" component={App}>
      <IndexRoute component={HeaderSection} />
      <Route path="archives" component={HeaderSection} />
    </Route>
  </Router>
), document.getElementById('app-frame'));

if (module.hot) {
  require('react-hot-loader/Injection').RootInstanceProvider.injectProvider({
    getRootInstances: function () {
      return [rootInstance];
    }
  });
}
