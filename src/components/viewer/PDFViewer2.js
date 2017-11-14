const pdfViewerHtmlPath = '/public/assets/services/pdf/web/viewer.html';
function PDFViewer2(){}

function open(pdfUrl, options){
    if(typeof options === 'number'){
        options = `number=${options}`
    }else if(typeof options === 'string'){

    }else if(options){
        if(options instanceof Array){
            options = options.join('&')
        }else if(typeof options === 'object'){
            const keys = Object.keys(options)
            const values = keys.map((key)=>{
                return `${key}=${options[key]}`
            });
            options = values.join('&')
        }
    }
    window.open(`${pdfViewerHtmlPath}?file=${pdfUrl}${options ? `&${options}` : ''}`)
}

PDFViewer2.prototype = {
    open: function (pdfUrl, options){
            if(!pdfUrl){
                throw new TypeError({
                    name: 'TypeError',
                    message: `the PDFViewer pdfUrl is required, but you convert is ${typeof pdfUrl}`
                })
            }
            open.bind(this, pdfUrl, options)
    }
};

PDFViewer2.open = open.bind(undefined)

export { PDFViewer2 }
export default PDFViewer2;
