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
        if (typeof Map === 'undefined') {
            alert('您的浏览器比较陈旧，我们无法加载文件列表。\r\n请使用"压缩包"一栏来浏览存档和文件，或考虑使用较新的浏览器。');
            this.props.history.push({ pathname: '/archives' });
            return;
        }
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
    getFileDirItems(dirs) {
        return Array.from(dirs).map((dir, index) => {
            return (<FileDirItem path={dir.name} key={index} dir={dir} nestCheck={false} expanded={true} />);
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
                            {
                                this.getFileDirItems(Array.from(this.state.dirs.newDirs.dirs.values()))
                            }
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
                        {
                            this.getFileDirItems(Array.from(this.state.dirs.allDirs.dirs.values()))
                        }
                    </div>
                </section>
            </div>
        )
    }
}

export default FileList;