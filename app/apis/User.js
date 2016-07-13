(() => {
    if (typeof window.daovoice === 'undefined' && process.env.DAOVOICE_ID) {
        (function(i,s,o,g,r,a,m){i["DaoVoiceObject"]=r;i[r]=i[r]||function(){(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)})(window,document,"script","//widget.daovoice.io/widget/" + process.env.DAOVOICE_ID + ".js","daovoice");
    }
})();

export function getUser() {
    try {
        return window.localStorage.getItem('user_name');
    } catch (ex) {
        return null;
    }
}

export function initialUser() {
    let userName = getUser();
    let isVisitor = userName === null;
    let options = {
        app_id: process.env.DAOVOICE_ID
    }
    try {
        if (!isVisitor) {
            options.user_id = userName;
            options.name = userName;
        }
        window.daovoice('init', options);
        window.daovoice('update');
    } catch (ex) { }
}

export function updateUser(userName = null) {
    if (userName === null) return;
    if (getUser() === userName) return;
    try {
        window.localStorage.setItem('user_name', userName);
        initialUser();
    } catch (ex) { }
}
