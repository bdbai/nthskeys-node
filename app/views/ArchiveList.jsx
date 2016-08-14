import React from 'React';

import ArchiveModel from '../apis/Archives';
import Loading from '../components/Loading';
import ArchiveItem from '../components/ArchiveItem';

class ArchiveList extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.state = { loaded: false, archives: [] };
    }
    componentDidMount() {
        ArchiveModel.getArchives()
        .then(archives => {
            this.setState({ loaded: true, archives: archives });
        }, err => {
            this.setState({ loaded: true });
            alert('Error while loading archives.');
            console.log(err);
        });
    }
    render() {
        if (this.state.loaded) {
            return (
                <div className="list-group">
                    {this.state.archives.map((archive, index) => {
                        return (<ArchiveItem key={index} archive={archive} />);
                    })}
                </div>
            );
        } else {
            return (<Loading />);
        }
    }
}

export default ArchiveList;

