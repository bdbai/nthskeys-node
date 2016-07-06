import React from 'React';

import config from '../apis/ApiConfig';
import PreviewItem from './PreviewItem';

class FileItem extends React.Component {
    constructor(props, context) {
        super(props, context);
        
        this.state = { isPreviewing: false };
        this.state.isPic = props.file.path.match(/\.(jpg|png|gif)/i);
        this.state.fileUrl = `${config.downloadPrefix}/${props.file.grade_category}/${props.file.subject_category}/${props.file.path}`;
    }
    fileClick(e) {
        e.preventDefault();
        if (this.state.isPic) {
            let isPreviewing = this.state.isPreviewing;
            this.setState({ isPreviewing: !isPreviewing });
        } else {
            window.location.href = this.state.fileUrl;
        }
    }
    render() {
        return (
            <a className="list-group-item file-item" onClick={this.fileClick.bind(this)}>
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
