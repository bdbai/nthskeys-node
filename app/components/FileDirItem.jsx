import React from 'React';

import FileItem from './FileItem';

const ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

class FileDirItem extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.toggleExpansion = this._toggleExpansion.bind(this);
        this.state = {
            expanded: props.expanded
        };
    }
    _toggleExpansion(e) {
        e.stopPropagation();
        this.setState({ expanded: !this.state.expanded });
    }

    render() {
        let content = '';
        if (this.state.expanded) {
            content = (
                <div className="list-group">
                    <ReactCSSTransitionGroup transitionName="tran" transitionEnterTimeout={500} transitionLeaveTimeout={250}>
                        {
                            Array.from(this.props.dir.dirs.values()).map((dir, i) => {
                                return (<FileDirItem key={i} dir={dir} expanded={true} />);
                            })
                        }
                        {
                            this.props.dir.files.map((file, i) => {
                                return (<FileItem key={i} file={file} expanded={true} />);
                            })
                        }
                    </ReactCSSTransitionGroup>
                </div>
            );
        }

        return (
            <div
              className="list-group-item list-group-item-info dir-item clickable"
              onClick={this.toggleExpansion}
            >
                {this.props.dir.name}
                {content}
            </div>
        );
    }
}

export default FileDirItem;
