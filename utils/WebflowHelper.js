
export class WebflowHelper {
    static init(pageId) {
        if (typeof document !== 'undefined') {
            document.querySelector("HTML").dataset.wfPage = pageId;
            document.querySelector("HTML").dataset.wfSite = "62f2af52c96fcad263ea1d2a";
            setTimeout(() => {
                window.Webflow && window.Webflow.destroy();
                window.Webflow && window.Webflow.ready();
                window.Webflow && window.Webflow.require('ix2').init();
                document.dispatchEvent(new Event('readystatechange'))
            }, 500);
        }
    }
}