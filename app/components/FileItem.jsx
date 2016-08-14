import React from 'React';

import config from '../apis/ApiConfig';
import PreviewItem from './PreviewItem';

class FileItem extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.fileClick = this._fileClick.bind(this);
        this.state = { isPreviewing: false };
        this.state.isPic = props.file.path.match(/\.(jp(e)?g|png|gif)/i);
        this.state.fileUrl = `${config.downloadPrefix}/${props.file.grade_category}/${props.file.subject_category}/${props.file.path}`;
    }
    _fileClick(e) {
        if (this.state.isPic) {
            e.preventDefault();
            e.stopPropagation();
            this.setState({ isPreviewing: !this.state.isPreviewing });
        }
    }
    render() {
        return (
            <a href={this.state.fileUrl} target="_blank" className="list-group-item clickable" onClick={this.fileClick}>
                <div>
                    {this.props.file.path}
                    {this.state.isPreviewing ?
                        (<PreviewItem file={this.props.file} />) : ''
                    }
                </div>
            </a>
        );
    }
}

export default FileItem;

