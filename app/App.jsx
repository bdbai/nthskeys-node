import React from 'React';
import { render } from 'ReactDOM';
import { Router, Route, IndexRoute } from 'ReactRouter';

import { PageView } from './apis/BdTongji';

import HeaderSection from './components/HeaderSection';
import ArchiveList from './views/ArchiveList';
import FileList from './views/FileList';
import StatisticView from './views/StatisticView';

import Styles from './styles/styles.css';

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

function onRouterChange(prevState, nextState) {
    PageView(nextState.location.pathname);
}

var rootInstance = render((
  <Router>
    <Route path="/" component={App} onChange={onRouterChange}>
      <IndexRoute component={FileList} />
      <Route path="archives" component={ArchiveList} />
      <Route path="files" component={FileList} />
      <Route path="statistic" component={StatisticView} />
    </Route>
  </Router>
), document.getElementById('app-frame'));

if (process.env.NODE_ENV === 'development' && module.hot) {
  require('react-hot-loader/Injection').RootInstanceProvider.injectProvider({
    getRootInstances: function () {
      return [rootInstance];
    }
  });
}
