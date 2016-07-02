(() => {
    // Ensure _hmt
    window._hmt = window._hmt || [];
})();

let hmt = window._hmt;

export function PageView(pageLocation) {
    hmt.push(['_trackPageview', pageLocation]);
}

export function TrackEvent(category, action, opt_label, opt_value) {
    hmt.push(['_trackEvent', category, action, opt_label, opt_value]);
}

export default {
    PageView,
    TrackEvent
}