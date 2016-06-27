import React from 'React';

import config from '../apis/ApiConfig';

class FileItem extends React.Component {
    constructor(props, context) {
        super(props, context);
        
        this.state = { isPreviewing: false };
        this.state.isPic = props.file.path.indexOf('.jpg') !== -1
                        || props.file.path.indexOf('.png') !== -1
                        || props.file.path.indexOf('.gif') !== -1;
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
                        (<img className="img-responsive" alt="预览" src={this.state.fileUrl} />) : ''
                    }
                </div>
            </a>
        );
    }
}

export default FileItem;
