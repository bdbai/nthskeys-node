import React from 'React';

import FileModel from '../apis/Files';
import Loading from '../components/Loading';
import FileDirItem from '../components/FileDirItem';

class FileList extends React.Component {
    constructor(props, context) {
        super(props, context);
        
        this.state = { loaded: false, dirs: {} };
    }
    componentDidMount() {
        FileModel.getFiles().then(dirs => {
            if (typeof dirs === 'undefined') {
                throw new Error('Unknow error.');
            }
            this.setState({ loaded: true, dirs: dirs });
        }).catch(err => {
            this.setState({ loaded: true });
            alert('Error while loading files.');
            console.log(err);
        });
    }
    render() {
        if (!this.state.loaded) {
            return (<Loading />);
        }
        if (typeof this.state.dirs === 'undefined' || typeof this.state.dirs.allDirs === 'undefined') {
            return (
                <div className="alert alert-danger">
                    <strong>加载失败了哟。</strong>
                </div>
            );
        }
        let recentView = '';
        if (this.state.dirs.newDirs !== null) {
            recentView = (
                <section className="panel panel-primary">
                    <div className="panel-heading">
                        最近更新
                    </div>
                    <div className="panel-body">
                        <div className="list-group">
                            {Array.from(this.state.dirs.newDirs.dirs.values()).map((dir, index) => {
                                return (<FileDirItem key={index} dir={dir} />);
                            })}
                        </div>
                    </div>
                </section>
            );
        }
        return (
            <div>
                {recentView}
                <section className="panel panel-default">
                    <div className="panel-heading">
                        所有文件
                    </div>
                    <div className="panel-body">
                        {Array.from(this.state.dirs.allDirs.dirs.values()).map((dir, index) => {
                            return (<FileDirItem key={index} dir={dir} />);
                        })}
                    </div>
                </section>
            </div>
        )
    }
}

export default FileList;