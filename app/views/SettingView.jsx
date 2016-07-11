import React from 'React';

import Crawler from '../apis/Crawler';
import Loading from '../components/Loading';

class SettingView extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.clearLocalStorage = this._clearLocalStorage.bind(this);
        this.runCrawl = this._runCrawl.bind(this);
        this.state = {
            crawlCallInfo: 'uncalled',
            crawlError: false,
            crawlMessage: ''
        }
    }
    _clearLocalStorage(e) {
        e.preventDefault();
        window.localStorage.clear();
        alert('已清除本地存储。');
        window.location.reload();
    }
    _runCrawl(e) {
        this.setState({
            crawlCallInfo: 'calling'
        });
        Crawler.CrawlManually()
        .then(result => {
            this.setState({
                crawlCallInfo: 'called',
                crawlError: false,
                crawlMessage: result.message
            });
        }, xhr => {
            let message = '未知错误！';
            try {
                let result = JSON.parse(xhr.responseText);
                message = result.message;
            } catch (ex) { }
            this.setState({
                crawlCallInfo: 'called',
                crawlError: true,
                crawlMessage: message
            });
        })
    }
    render() {
        let crawlInfo = '';
        switch (this.state.crawlCallInfo) {
            case 'uncalled' :
                crawlInfo = (
                    <div onClick={this.runCrawl} className="btn btn-md btn-info">
                        立即戳戳爬虫
                    </div>
                );
                break;
            case 'calling' :
                crawlInfo = (
                    <Loading />
                );
                break;
            case 'called' :
                if (this.state.crawlError) {
                    crawlInfo = (
                        <div className="alert alert-warning">
                            {this.state.crawlMessage}
                        </div>
                    );
                } else {
                    crawlInfo = (
                        <div className="alert alert-success">
                            {this.state.crawlMessage}
                        </div>
                    );
                }
                break;
        }
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
                <div className="panel panel-info">
                    <div className="panel-heading">勤劳的爬虫</div>
                    <div className="panel-body">
                        <p>爬取学校官网的程序每 2 小时运行一次。若要手动运行，请确保新的压缩包还没有被爬取到。</p>
                        {crawlInfo}
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
                        <p>感谢 <a alt="Recursive Land" target="_blank" href="http://recursiveg.me/">Recursive G</a> 的<a alt="记一次坑爹的乱码解决过程 by Recursive G" target="_blank" href="http://recursiveg.me/2014/02/clear-a-special-kind-of-messy-code/">这篇文章</a>解决了压缩包的乱码问题。</p>
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
