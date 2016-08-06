import React from 'React';

import Loading from './Loading';
import FileItem from './FileItem';
import { getUser, updateUser } from '../apis/User';
import Files from '../apis/Files';
import Archives from '../apis/Archives';
import Extractor from '../apis/Extractor';

const ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

class ArchiveItem extends React.Component {
    constructor(props, context) {
        super(props, context);
        
        this.wrongPassword = false;
        this.loadFileList = this._loadFileList.bind(this);
        this.previewBtnClick = this._previewBtnClick.bind(this);
        this.submitRelease = this._submitRelease.bind(this);
        this.fillName = this._fillName.bind(this);
        this.state = {
            releaseState: 'not running',
            releaseOutput: '',
            errorText: '',
            loadingFilelist: false,
            loadedFileList: false,
            displayFileList: true,
            files: []
        };
    }
    componentDidUpdate() {
        if (typeof this.refs.outputWell !== 'undefined') {
            this.refs.outputWell.innerText = this.state.releaseOutput;
        }
    }
    _loadFileList() {
        if (this.state.loadingFilelist) {
            return;
        }
        if (this.state.loadedFileList) {
            this.setState({ displayFileList: !this.state.displayFileList });
            return;
        }
        this.setState({ loadingFilelist: true });
        Files.getFilesByArchive(this.props.archive._id)
        .then(files => {
            this.setState({
                loadedFileList: true,
                loadingFilelist: false,
                files: files
            });
        }, () => {
            this.setState({ loadingFilelist: false });
        });
    }
    _previewBtnClick(e) {
        e.preventDefault();
        this.loadFileList();
    }
    _submitRelease(e) {
        e.preventDefault();
        try {
            this.wrongPassword = false;
            this.moreError = false;
            Extractor(
                this.props.archive._id,
                this.refs.passTxt.value,
                this.refs.nameTxt.value,
                (xhr) => {
                    if (xhr.responseText.indexOf('Wrong password?') !== -1) {
                        this.wrongPassword = true;
                    }
                    if (xhr.responseText.indexOf('解压时出错了。') !== -1) {
                        this.moreError = true;
                    }
                    this.setState({ releaseOutput: xhr.responseText });
                }
            )
            .then(() => {
                if (this.wrongPassword) {
                    this.setState({ releaseState: 'error', errorText: '密码错了哟~' });
                } else if (this.moreError) {
                    this.setState({ releaseState: 'error', errorText: '诡异的错误发生了！' });
                } else {
                    this.loadFileList();
                    this.setState({ releaseState: 'success' });
                    Archives.getArchives();
                }
            }, (err) => {
                this.setState({ releaseState: 'error', errorText: err.message });
            });
            this.setState({ releaseState: 'running' });
            updateUser(this.refs.nameTxt.value);
        } catch (err) {
            this.setState({ releaseState: 'preerror', errorText: err.message });
        }
        
    }
    _fillName(e) {
        if (this.refs.nameTxt.value === '') {
            this.refs.nameTxt.value = getUser();
        }
    }
    render() {
        let containerClass = 'archive-item list-group-item';
        let releaseControl = '';
        let releaseOutput = '';
        let infoLine = '';
        let filesPreview = '';

        if (this.state.displayFileList && this.state.loadedFileList) {
            filesPreview = (
                <div key="dummy" className="list-group archive-preview-con">
                    {this.state.files.map((file, index) => {
                        return (<FileItem file={file} key={index} />);
                    })}
                </div>
            );
        }
        switch (this.props.archive.status) {
            case 'unreleased' :
                containerClass += ' list-group-item-info';
                releaseControl = (
                    <div>
                        <form className="form-inline">
                            <div className="form-group">
                                <input type="text" ref="passTxt" maxLength="20" className="form-control" placeholder="密码" />
                            </div>
                            <div class="form-group">
                                <input type="text" ref="nameTxt" onClick={this.fillName} maxLength="10" className="form-control" placeholder="贡献者" />
                            </div>
                            {this.state.releaseState === 'running' || this.state.releaseState === 'success' ?
                                (<button type="submit" disabled="disabled" className="btn btn-default">提交！</button>)
                                :
                                (<button onClick={this.submitRelease} type="submit" className="btn btn-default">提交！</button>)
                            }
                        </form>
                    </div>
                );
                break;
            case 'released' :
                infoLine = (
                    <div className="row text-muted clearfix">
                        <div className="col-xs-6">
                            <span className="glyphicon glyphicon-lock" aria-hidden="true" />
                            {this.props.archive.password}
                        </div>
                        <div className="col-xs-6">
                            <span className="glyphicon glyphicon-user" aria-hidden="true" />
                            {this.props.archive.released_by}
                        </div>
                    </div>
                );
                break;
        }
        switch (this.state.releaseState) {
            case 'running':
                releaseOutput = (
                    <div>
                        <Loading />
                        <div className="alert alert-warning" role="alert">
                            正在处理它...
                        </div>
                        <div ref="outputWell" className="well" />
                    </div>
                );
                break;
            case 'success':
                releaseOutput = (
                    <div>
                        <div className="alert alert-success" role="alert">
                            <strong>解压完成！</strong>
                            <br />hiahiahia~
                        </div>
                        <div ref="outputWell" className="well" />
                    </div>
                );
                break;
            case 'preerror':
                releaseOutput = (
                    <div className="alert alert-danger" role="alert">
                        <strong>嘿！</strong>
                        <br />{this.state.errorText}
                    </div>
                );
                break;
            case 'error':
                releaseOutput = (
                    <div>
                        <div className="alert alert-danger" role="alert">
                            <strong>解压失败了...</strong>
                            {this.state.errorText}
                            <br />请保留下面的日志，也许有帮助。
                        </div>
                        <div ref="outputWell" className="well" />
                    </div>
                );
                break;
        }
        return (
            <div className={containerClass}>
                <div className="list-group-item-heading">
                    {this.props.archive.title}
                    {
                        this.props.archive.status === 'released' ?
                        <button onClick={this.previewBtnClick}
                                className={(
                                    this.state.loadingFilelist
                                    || this.state.loadedFileList && this.state.displayFileList
                                    ? 'active ' : '') + 'btn btn-default clickable pull-right text-muted'}>
                            <span className="glyphicon glyphicon-list" aria-hidden="true"></span>
                            &nbsp;预览内容
                        </button>
                        : ''
                    }
                </div>
                {this.state.loadingFilelist ? <Loading /> : ''}
                {infoLine}
                {releaseControl}
                <ReactCSSTransitionGroup transitionName="tran" transitionEnterTimeout={500} transitionLeaveTimeout={250}>
                	{filesPreview}
                </ReactCSSTransitionGroup>
                {releaseOutput}
            </div>
        );
    }
}

export default ArchiveItem;
