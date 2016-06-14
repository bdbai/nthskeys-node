import React from 'React';

import config from '../apis/ApiConfig';

class FileItem extends React.Component {
    fileClick(e) {
        e.preventDefault();
        let file = this.props.file;
        window.location.href = `${config.downloadPrefix}/${file.grade_category}/${file.subject_category}/${file.path}`;
    }
    render() {
        return (
            <div className="list-group-item" onClick={this.fileClick.bind(this)}>
                <div className="list-group-item-heading">
                    {this.props.file.path}
                </div>
            </div>
        );
    }
}

export default FileItem;
