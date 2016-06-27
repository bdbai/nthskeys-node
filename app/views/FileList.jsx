import React from 'React';

import FileModel from '../apis/Files';
import Loading from '../components/Loading';
import FileDirItem from '../components/FileDirItem';

class FileList extends React.Component {
    constructor(props, context) {
        super(props, context);
        
        this.state = { loaded: false, dirs: {} };
    }
    componentDidMount() {
        FileModel.getFiles()
        .then(dirs => {
            this.setState({ loaded: true, dirs: dirs });
        }, err => {
            this.setState({ loaded: true });
            alert('Error while loading files.');
            console.log(err);
        });
    }
    render() {
        if (this.state.loaded) {
            return (
                <div className="list-group">
                    {Array.from(this.state.dirs.dirs.values()).map((dir, index) => {
                        return (<FileDirItem key={index} dir={dir} />);
                    })}
                </div>
            );
        } else {
            return (<Loading />);
        }
    }
}

export default FileList;