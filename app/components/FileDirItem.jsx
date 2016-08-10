import React from 'React';

import FileItem from './FileItem';

const ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

class FileDirItem extends React.Component {
    static storeExpansionState(dirPath, state) {
        try {
            window.sessionStorage.setItem(`expanded_${dirPath}`, state);
        } catch (_) { }
    }
    static getInitialExpansion(dirPath, defaultValue = false) {
        try {
            let expanded = JSON.parse(window.sessionStorage.getItem('expanded_' + dirPath));
            if (expanded === null) {
                FileDirItem.storeExpansionState(dirPath, defaultValue);
                return defaultValue;
            } else {
                return expanded;
            }
        } catch (ex) {
            return defaultValue;
        }
    }
    constructor(props, context) {
        super(props, context);

        this.dir = props.dir;
        this.path = this.props.path;
        this.dirName = props.dir.name;
        if (!(props.nestCheck === false)) {
            while (this.dir.dirs.size === 1 && this.dir.files.length === 0) {
                let nextDir = this.dir.dirs.values().next().value;
                let nameToAppend = '/' + nextDir.name;
                this.dirName += nameToAppend;
                this.path += nameToAppend;
                this.dir = nextDir;
            }
        }

        let initialExpanded = FileDirItem.getInitialExpansion(this.path, props.expanded);
        this.toggleExpansion = this._toggleExpansion.bind(this);
        this.state = {
            expanded: initialExpanded
        };
    }
    _toggleExpansion(e) {
        e.stopPropagation();
        FileDirItem.storeExpansionState(this.path, !this.state.expanded);
        this.setState({ expanded: !this.state.expanded });
    }
    getDirItems() {
        let path = this.path;
        return Array.from(this.dir.dirs.values()).map((dir, i) => {
            return (
                <FileDirItem
                    path={`${path}/${dir.name}`}
                    key={i}
                    dir={dir}
                    expanded={false}
                />
            );
        });
    }
    getFileItems() {
        return this.dir.files.map((file, i) => {
            return (<FileItem key={i} file={file} />);
        });
    }

    render() {
        let content = '';
        if (this.state.expanded) {
            content = (
                <div className="list-group">
                    { this.getDirItems() }
                    { this.getFileItems() }
                </div>
            );
        }

        return (
            <div
              className="list-group-item list-group-item-info dir-item clickable"
              onClick={this.toggleExpansion}
            >
                {this.dirName}
                <ReactCSSTransitionGroup transitionName="tran" transitionEnterTimeout={500} transitionLeaveTimeout={250}>
                    {content}
                </ReactCSSTransitionGroup>
            </div>
        );
    }
}

export default FileDirItem;
