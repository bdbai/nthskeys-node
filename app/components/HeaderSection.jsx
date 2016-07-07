import React from 'React';
import { Link } from 'ReactRouter';

export default class HeaderSection extends React.Component {
    render() {
        return (
            <nav className="navbar navbar-default">
                <div className="container-fluid">
                    <div className="navbar-header">
                        <Link className="navbar-brand" to="/">NthsKeys</Link>
                    </div>
                    <div className="navbar-collapse">
                        <ul className="nav navbar-nav navbar-left">
                            <li>
                                <Link to="/files">文件</Link>
                            </li>
                            <li>
                                <Link to="/archives">压缩包</Link>
                            </li>
                            <li>
                                <Link to="/statistic">统计</Link>
                            </li>
                        </ul>
                        <ul className="nav navbar-nav navbar-right">
                            <li>
                                <Link to="/setting"><span className="glyphicon glyphicon-cog" aria-hidden="true"></span></Link>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>
        );
    }
}