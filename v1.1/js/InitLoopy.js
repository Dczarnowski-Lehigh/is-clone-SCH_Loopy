function initLoopy(){
        const parentElement = document.getElementById('canvasContainer').parentElement;
        const wrapperComputedStyle = window.getComputedStyle(parentElement, null)
        let wrapperWidth = parentElement.clientWidth
        wrapperWidth -=
        parseFloat(wrapperComputedStyle.marginLeft) +
        parseFloat(wrapperComputedStyle.marginRight) +
        parseFloat(wrapperComputedStyle.paddingLeft) +
        parseFloat(wrapperComputedStyle.paddingRight);
        document.documentElement.style.setProperty('--vw-scale', wrapperWidth / 1366);
        window.loopy = new Loopy();
    }
    if (document.readyState !== 'loading') 
    {
        console.warn('document is already ready, just execute code here');
        initLoopy();
    }else{
        document.addEventListener("DOMContentLoaded", function() {
            console.warn('document was not ready, place code here');
            initLoopy();
        });

    }
