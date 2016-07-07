import React from 'React';

class SettingView extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.clearLocalStorage = this._clearLocalStorage.bind(this);
    }
    _clearLocalStorage() {
        window.localStorage.clear();
        alert('已清除本地存储。');
        window.location.reload();
    }
    render() {
        return (
            <div>
                <div className="panel panel-info">
                    <div className="panel-heading">Local Storage</div>
                    <div className="panel-body">
                        <p>本地存储用于在离线情况下加载文件和压缩包列表。在线加载时会自动刷新。</p>
                        <div onClick={this.clearLocalStorage} className="btn btn-md btn-info">
                            清除本地存储
                        </div>
                    </div>
                </div>
                <div className="panel panel-default">
                    <div className="panel-heading">Credit</div>
                    <div className="panel-body">
                        <p>
                            NthsKeys-node 是一个基于 MIT 协议发布的开源项目。
                            <a alt="Fork nthskeys-node on GitHub" target="_blank" href="https://github.com/bdbai/nthskeys-node">Fork on GitHub!</a>
                        </p>
                        <p>感谢 MintShen 和 某位不愿意透露姓名的雷峰 对本项目的大力支持。</p>
                        <hr />
                        With <span className="glyphicon glyphicon-heart love" aria-hidden="true"></span> By&nbsp;
                        <a href="http://bdbai.22web.org/blog/" target="_blank" alt="布丁的博客">
                            bdbai
                        </a>
                    </div>
                </div>
            </div>
        );
    }
}

export default SettingView;