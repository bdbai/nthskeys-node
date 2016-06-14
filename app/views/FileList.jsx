import React from 'React';

import FileModel from '../apis/Files';
import Loading from '../components/Loading';
import FileItem from '../components/FileItem';

class FileList extends React.Component {
    constructor(props, context) {
        super(props, context);
        
        this.state = { loaded: false, files: [] };
    }
    componentDidMount() {
        FileModel.getFiles()
        .then(files => {
            this.setState({ loaded: true, files: files });
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
                    {this.state.files.map((file, index) => {
                        return (<FileItem key={index} file={file} />);
                    })}
                </div>
            );
        } else {
            return (<Loading />);
        }
    }
}

export default FileList;