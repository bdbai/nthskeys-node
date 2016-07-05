import React from 'React';

import Loading from '../components/Loading';
import Statistic from '../apis/Statistic';

class StatisticView extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.state = {
            loading: true,
            rank: []
        }
    }
    componentDidMount() {
        Statistic.getRankList().then(data => {
            this.setState({ loading: false, rank: data });
        }, () => {
            this.setState({ loading: false });
            alert('Error while loading rank list.');
        });
    }
    render() {
        if (this.state.loading) {
            return (<Loading />);
        }
        return (
            <div className="panel panel-info">
                <div className="panel-heading">
                    贡献榜
                </div>
                <div className="panel-body">
                    <div className="list-group">
                        {this.state.rank.map((value, index) => {
                            return (
                                <div className="list-group-item" key={index}>
                                    {value._id}
                                    <span className="badge">{value.count}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    }
}

export default StatisticView;