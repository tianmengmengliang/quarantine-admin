import config from './config';
import superagent from 'superagent';
var iframeCount = 0;

function UploadFiles(options){

    var settings = {
        trigger: null,
        positionDOM:null,
        name: null,
        action: null,
        data: null,
        accept: null,
        beforeUpload:null,
        change: null,
        error: null,
        multiple: true,
        success: null
    };

    this.settings =this.objectExtends(settings,options);
    this.init();
    this.bind();
}

UploadFiles.prototype={
    init:function(){
        var formAttributes={
            method:'post',
            enctype:'multipart/form-data',
            target:'',
            action:this.settings.action
        };
        var form=this.createForm(formAttributes);
        var inputs=this.createInputs(this.settings.data);
        inputs.map(function(input){
            form.appendChild(input)
        });
        this.form=form;
        this.iframe = newIframe();
        this.form.setAttribute('target', this.iframe.attr('name'));

        var input,self= this;
        if(window.FormData){
            input=this.createInputs({"_upload_":"formData"});
        }else{
            input=this.createInputs({"_upload_":"iframe"});
        }
        input.map(function(input){
            self.form.appendChild(input)
        });

        var fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.name = this.settings.name;
        if (this.settings.accept){
            fileInput.accept = this.settings.accept;
        }
        if (this.settings.multiple){
            fileInput.multiple = true;
            fileInput.setAttribute('multiple', 'multiple');
        }
        this.input=fileInput;

        var domTrigger=document.querySelector(this.settings.trigger);
        this.domTrigger=domTrigger;
        this.domTrigger=this.setStyle(this.domTrigger,{
            position:'relative'
        });

        var triggerOffset=this.getOffset(domTrigger);
        // console.log(triggerOffset);
        var width=domTrigger.offsetWidth;
        var height=domTrigger.offsetHeight;
        var zIndex=this.findzIndex(domTrigger);

        this.input.setAttribute('hidefocus',true);
        this.input=this.setStyle(this.input,{
            position: 'absolute',
            top: 0,
            right: 0,
            opacity: 0,
            outline: 0,
            cursor: 'pointer',
            height: height+"px",
            width:width+'px',
            display:'inline-block'
        });
        this.form.appendChild(this.input);

        this.form=this.setStyle(this.form,{
            position: 'absolute',
            top: 0,
            left: 0,
            overflow: 'hidden',
            width: width+'px',
            height: height+'px',
            zIndex: zIndex,
            display:'block'
        });

      /*  if(this.settings.positionDOM){
            document.querySelector(this.settings.positionDOM).appendChild(this.form)
        }else {
            document.body.appendChild(this.form);
        }*/

        //document.body.appendChild(this.form);

        domTrigger.appendChild(this.form);

        return this;

    },
    bind:function(){
        var self=this;
        var domTrigger=this.domTrigger;

        this.setStyle(domTrigger,{
           cursor:'pointer',
            position:"relative"
        });
        domTrigger=this.on(domTrigger,'mouseenter',function(event){
            var e= event||window.event;
            e.stopPropagation();
            var triggerOffset=self.getOffset(domTrigger);
            var width=domTrigger.offsetWidth;
            var height=domTrigger.offsetHeight;
            var zIndex=self.findzIndex(domTrigger);

            self.setStyle(self.form,{
                'position':'absolute',
                top: 0,
                left: 0,
                width: width+'px',
                height: height+'px',
                zIndex:zIndex
            });
        });

        self.bindInput()
    },
    bindInput:function(){
        var self=this;
        this.on(this.input,'change',function(event){
            var e=event||window.event;
            var target=e.target||e.srcElement;
            // console.log(target);
            // ie9 don't support FileList Object
            // http://stackoverflow.com/questions/12830058/ie8-input-type-file-get-files
            self._files = this.files || [{
                    name: target.value
                }];
            var file = $(self.input).val();
            if (self.settings.change) {
                self.settings.change.call(self, self,self._files);
                self.submit();                                              // 自动提交文件的操作
            } else if (file) {
                return self.submit();
            }
        });
    },
    submit : function() {
        var self = this,pass=true;

        // 上传之前验证通过之后处理
      /*  if (window.FormData && self._files) {
            // build a FormData
            var formData = new FormData($(self.form).get(0));
            // use FormData to upload
            formData.append(self.settings.name, self._files);

            var optionXhr;
            if (self.settings.progress) {
                // fix the progress target file
                var files = self._files;
                optionXhr = function() {
                    var xhr = $.ajaxSettings.xhr();
                    if (xhr.upload) {
                        xhr.upload.addEventListener('progress', function(event) {
                            var percent = 0;
                            var position = event.loaded || event.position; /!*event.position is deprecated*!/
                            var total = event.total;
                            if (event.lengthComputable) {
                                percent = Math.ceil(position / total * 100);
                            }
                            self.settings.progress(event, position, total, percent, files);
                        }, false);
                    }
                    return xhr;
                };
            }
            $.ajax({
                url: self.settings.action,
                type: 'post',
                processData: false,
                contentType: false,
                data: formData,
                xhr: optionXhr,
                context: this,
                success: self.settings.success,
                error: self.settings.error
            });
            return this;
        } else{
            // iframe upload
            self.iframe = newIframe();
            self.form.attr('target', self.iframe.attr('name'));
            $('body').append(self.iframe);
            self.iframe.one('load', function() {
                // https://github.com/blueimp/jQuery-File-Upload/blob/9.5.6/js/jquery.iframe-transport.js#L102
                // Fix for IE endless progress bar activity bug
                // (happens on form submits to iframe targets):
                $('<iframe src="javascript:false;"></iframe>')
                    .appendTo(self.form)
                    .remove();
                var response;
                try {
                    response = $(this).contents().find("body").html();
                } catch (e) {
                    response = "cross-domain";
                }
                $(this).remove();
                if (!response) {
                    if (self.settings.error) {
                        self.settings.error(self.input.val());
                    }
                } else {
                    if (self.settings.success) {
                        self.settings.success(response);
                    }
                }
            });
            self.form.submit();
        }*/
        this.submitFiles(this._files);
        return this;
    },
    submitFiles:function(files){
        var self=this;
        files&&[].slice.call(files,0).map(function(file) {

            // 上传之前处理
            var pass;
            if(self.settings.beforeUpload){
                pass=self.settings.beforeUpload(self,file)
            }
            if(pass===false){
                return file;
            }

            if (window.FormData && self._files) {
                // build a FormData
                var formData=new FormData();
                formData.append('name',file.name);
                if(self.settings.data){
                    for(var key in self.settings.data){
                        formData.append(key,self.settings.data[key])
                    }
                }
                formData.append(self.settings.name,file);

                var optionXhr;
                if (self.settings.progress) {
                    // fix the progress target file
                    var files = self._files;
                    optionXhr = function () {
                        var xhr = $.ajaxSettings.xhr();
                        if (xhr.upload) {
                            xhr.upload.addEventListener('progress', function (event) {
                                var percent = 0;
                                var position = event.loaded || event.position;
                                /*event.position is deprecated*/
                                var total = event.total;
                                if (event.lengthComputable) {
                                    percent = Math.ceil(position / total * 100);
                                }
                                self.settings.progress(event, position, total, percent, files);
                            }, false);
                        }
                        return xhr;
                    };
                }
                $.ajax({
                    url: self.settings.action,
                    type: 'post',
                    processData: false,
                    contentType: false,
                    data: formData,
                    xhr: optionXhr,
                    context: this,
                    success: self.success.bind(self),
                    error: self.error.bind(self)
                });
                self._currentFile=file;
                return file
            } else {
                // iframe upload
                self.iframe = newIframe();
                var fileForm=
                self.form.attr('target', self.iframe.attr('name'));
                $('body').append(self.iframe);
                self.iframe.one('load', function () {
                    // https://github.com/blueimp/jQuery-File-Upload/blob/9.5.6/js/jquery.iframe-transport.js#L102
                    // Fix for IE endless progress bar activity bug
                    // (happens on form submits to iframe targets):
                    $('<iframe src="javascript:false;"></iframe>')
                        .appendTo(self.form)
                        .remove();
                    var response;
                    try {
                        response = $(this).contents().find("body").html();
                    } catch (e) {
                        response = "cross-domain";
                    }
                    $(this).remove();
                    if (!response){
                        if (self.settings.error) {
                            self.settings.error(self.input.val());
                        }
                    } else {
                        if (self.settings.success) {
                            self.settings.success(response);
                        }
                    }
                });
                self.form.submit();
            }
            return this;
        });
    },
    start:function(file){
    // 实例化一个表单数据对象
        var formData = new FormData();

    // 遍历图片文件列表，插入到表单数据中
       /* for (var i = 0, file; file = files[i]; i++) {
            // 文件名称，文件对象
            formData.append(file.name, file);
        }*/

        formData.append(file.name, file);


        superagent
            .post(this.url)
            .set({
                'Content-Type':'multipart/form-data'
            })
            .set(this.headers)
            .send(formData)
            .send({
                name:"",
                key:this.data['key'],
                policy:''
            })
            .end(function(err, res) {
                if (err) {                                                 // 网络原因,业务逻辑错误
                    //message.error(err.message);
                    return;
                }
                if (res.ok && res.body && res.body.success) {              // 请求成功
                    this.success && this.success(res.body,formData);
                    return;
                } else if(!res.body) {                                     // 网络通畅，服务端发生错误
                    this.error(err,formData);
                    return;
                } else{                                                    // 请求失败
                    // message.error(res.body.msg&&res.body.errorResponse&&res.body.errorResponse.msg);
                }
                this.error && this.error(res.body,files,formData)
            });
    },
    setOptions:function (options){
        var newSettings=this.objectExtends(this.settings,options);
        this.settings=newSettings;
        return this;
    },
    send:function(data){
        this.data=data
    },
    success:function(res){
        this._files={};
        this.settings.success&&this.settings.success(res,this,this._currentFile)
    },
    error:function(err){
        this.settings.error&&this.settings.error(err,this,this._currentFile)
    },
    end:function(err,res){

    },


    objectExtends:function(defaultSettings,newSettings){
        return Object.assign({},defaultSettings,newSettings)
    },
    createForm:function(attributesObject){
        var keys=Object.keys(attributesObject);
        var form=document.createElement('form');
        keys.map(function(key){
            form.setAttribute(key,attributesObject[key])
        })
        return form;
    },
    createInputs:function(data) {
        var inputs = [], i;
        for (var name in data) {
            i = document.createElement('input');
            i.name = name;
            i.type = "hidden";
            i.value = data[name];
            inputs.push(i)
        }
        return inputs;
    },
    setStyle:function(node,styleObject){
        var cssText='',keys=[];
        keys=Object.keys(styleObject);
        keys.map(function(key){
            cssText=cssText+key+":"+styleObject[key]+";"
        });
        node.setAttribute('style',cssText);
        return node;
    },
    getOffset:function(node){
        function getNodeLeft(node){
            var left=node.offsetLeft;
            var parents=node.parentNode;
            while(parents&&parents.nodeType==1){
                left=left+parents.offsetLeft;
                parents=parents.parentNode;
            }
            return left
        }
        function getNodeTop(node){
            var top=node.offsetTop;
            var parent=node.parentNode;
            while(parent&&parent.nodeType==1){
                top=top+parent.offsetTop;
            //    console.log(parent,top);
                parent=parent.parentNode;
            }
            // console.log(top);
            return top;
        }

        var left=getNodeLeft(node);
        var top=getNodeTop(node);

        return {
            left:left,
            top:top
        }
    },
    getStyle:function(node,name){
        var computedStyle;
        try{
            // console.log(node);
            computedStyle=document.defaultView.getComputedStyle(node,null);
            // console.log(document.defaultView.getComputedStyle(node,null))
        }catch(e){
            // console.log(e);
            computedStyle=node.currentStyle;
        }

        if(name!=='float'){
            return computedStyle[name]
        }else{
            return computedStyle['cssFloat']||computedStyle['styleFloat']
        }
    },
    findzIndex:function(node){
        var zIndex=parseInt(this.getStyle(node,'zIndex'))||0;
        return zIndex
    },
    on:function(node,eventName,eventFunc,useCapture){
        if(window.addEventListener){
            node.addEventListener(eventName,function(e){
                eventFunc&&eventFunc.call(node,e)
            },useCapture||false)
        }else if(window.attachEvent){
            node.attachEvent(eventName,function(){
                eventFunc&&eventFunc.call(node,window.event)
            },useCapture||false)
        }
        return node
    },

};

function newIframe() {
    var iframeName = 'iframe-uploader-' + iframeCount;
    var iframe = $('<iframe name="' + iframeName + '" />').hide();
    iframeCount += 1;
    return iframe;
}

export default UploadFiles;
