import React from 'React';

import Loading from './Loading';
import Extractor from '../apis/Extractor';

class ArchiveItem extends React.Component {
    constructor(props, context) {
        super(props, context);
        
        this.wrongPassword = false;
        this.state = {
            releaseState: 'not running',
            releaseOutput: '',
            errorText: ''
        };
    }
    componentDidUpdate() {
        if (typeof this.refs.outputWell !== 'undefined') {
            this.refs.outputWell.innerText = this.state.releaseOutput;
        }
    }
    submitRelease(e) {
        e.preventDefault();
        try {
            this.wrongPassword = false;
            Extractor(
                this.props.archive._id,
                this.refs.passTxt.value,
                this.refs.nameTxt.value,
                (xhr) => {
                    if (xhr.responseText.indexOf('Wrong password?') !== -1) {
                        this.wrongPassword = true;
                    }
                    this.setState({ releaseOutput: xhr.responseText });
                }
            )
            .then(() => {
                if (this.wrongPassword) {
                    this.setState({ releaseState: 'error', errorText: '密码错了哟~' });
                } else {
                    this.setState({ releaseState: 'success' });
                }
            }, (err) => {
                this.setState({ releaseState: 'error', errorText: err.message });
            });
            this.setState({ releaseState: 'running' });
        } catch (err) {
            this.setState({ releaseState: 'preerror', errorText: err.message });
        }
        
    }
    render() {
        let containerClass = 'list-group-item';
        let releaseControl = '';
        let releaseOutput = '';
        if (this.props.archive.status === 'unreleased') {
            containerClass += ' list-group-item-info';
            releaseControl = (
                <div>
                    <form className="form-inline">
                        <div className="form-group">
                            <input type="text" ref="passTxt" maxLength="16" className="form-control" placeholder="密码" />
                        </div>
                        <div class="form-group">
                            <input type="text" ref="nameTxt" maxLength="10" className="form-control" placeholder="贡献者" />
                        </div>
                        {this.state.releaseState === 'running' || this.state.releaseState === 'success' ?
                            (<button type="submit" disabled="disabled" className="btn btn-default">提交！</button>)
                            :
                            (<button onClick={this.submitRelease.bind(this)} type="submit" className="btn btn-default">提交！</button>)
                        }
                            
                    </form>
                </div>
            );
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
                </div>
                {releaseControl}
                {releaseOutput}
            </div>
        );
    }
}

export default ArchiveItem;
