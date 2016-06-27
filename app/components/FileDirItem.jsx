import React from 'React';

import FileItem from './FileItem';

class FileDirItem extends React.Component {
    render() {
        return (
            <div className="list-group-item list-group-item-info dir-item">
                {this.props.dir.name}
                <div className="list-group">
                    {
                        Array.from(this.props.dir.dirs.values()).map((dir, i) => {
                            return (<FileDirItem key={i} dir={dir} />);
                        })
                    }
                    {
                        this.props.dir.files.map((file, i) => {
                            return (<FileItem key={i} file={file} />);
                        })
                    }
                </div>
            </div>
        );
    }
}

export default FileDirItem;
