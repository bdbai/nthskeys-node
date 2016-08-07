import React from 'React';

import config from '../apis/ApiConfig';

class PreviewItem extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.state = this.state || {};
        this.state.filePath = `${props.file.grade_category}/${props.file.subject_category}/${props.file.path}`;
        this.state.fileUrl = `${config.downloadPrefix}/${this.state.filePath}`;
        this.state.previewUrl = `${config.previewPrefix}/${encodeURIComponent(this.state.filePath)}`;
    }

    render() {
        if (typeof window.navigator.standalone === 'undefined' || window.navigator.standalone === false) {
            return (
                <img className="img-responsive" alt="预览" src={this.state.fileUrl} />
            );
        } else {
            return (
                <iframe src={this.state.previewUrl} />
            );
        }
    }
}

export default PreviewItem;
