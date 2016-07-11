import React from 'React';
import { Link } from 'ReactRouter';

import Archives from '../apis/Archives';

export default class HeaderSection extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.state = {
            newArchiveCount: 0
        };
    }
    componentDidMount() {
        this.newArchiveHandle = Archives.registerNewCount((newCount) => {
            if (newCount > 0) {
                this.setState({ newArchiveCount: newCount });
            }
        });
        try {
            Archives.getArchives();
        } catch (ex) { }
    }
    componentWillUnmount() {
        Archives.unregisterNewCount(this.newArchiveHandle);
    }
    render() {
        let tipIcon = '';
        if (this.state.newArchiveCount !== 0) {
            tipIcon = (
	            <span className="badge new-num">
	                {this.state.newArchiveCount}
	            </span>
	        );
        }
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
                                <Link to="/archives">压缩包{tipIcon}</Link>
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