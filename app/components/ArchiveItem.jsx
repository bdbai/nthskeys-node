import React from 'React';

class ArchiveItem extends React.Component {
    
    render() {
        let containerClass = 'list-group-item';
        let releaseControl = '';
        if (this.props.archive.status === 'unreleased') {
            containerClass += ' list-group-item-info';
        }
        return (
            <div className={containerClass}>
                <div className="list-group-item-heading">
                    {this.props.archive.title}
                </div>
                {releaseControl}
            </div>
        );
    }
}

export default ArchiveItem;
