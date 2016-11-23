import {globalToken} from '../stores/WidgetStore'

var chooseFileCallback = (w)=> {  //tag
    if (w.files.length > 0) {
        var allowExt = null;
        if (w.userType == 'font') {
            allowExt = ['ttf', 'otf'];
        } else if (w.userType == 'image') {
            allowExt = ['png', 'jpg', 'jpeg', 'gif'];
        } else if (w.userType == 'imagelist') {
            allowExt = ['zip'];
        } else if (w.userType == 'zip') {
            allowExt = ['zip'];
        } else if (w.userType == 'video') {
            allowExt = ['mov', 'mp4', 'avi'];
        } else {
            return;
        }
        var name = w.files[0]['name'];
        var dot = name.lastIndexOf('.');
        if (dot <= 0)
            return;
        var ext = name.substr(dot + 1);
        if (!allowExt || allowExt.indexOf(ext) >= 0) {
            if (w.userUpload) {
                var xhr = new XMLHttpRequest();
                if(window.location.hostname==='localhost'&&window.location.port!=='8050'){
                    xhr.open('POST', 'http://test-beta.ih5.cn/editor3b/'+'app/uploadFile');
                }else{
                    xhr.open('POST', 'app/uploadFile');
                }
                if (globalToken){
                    xhr.setRequestHeader('Authorization', 'Bearer {' + globalToken + '}');
                }
                var form = new FormData();
                form.append('type', w.userType);
                form.append('file', w.files[0]);

                xhr.upload.onprogress= w.showProgress;

                xhr.send(form);

                xhr.onreadystatechange = function() {
                    if (xhr.readyState == 4) {
                        w.userCallback(w, xhr.responseText);
                    }
                };
            } else {
                w.userCallback(w, ext);
            }
        }
    }
};


var chooseFile = (type, upload, callback,showProgress) => {
    var w = document.getElementById('upload-box');
    w.value = '';
    w.userType = type;
    w.userUpload = upload;
    w.userCallback = callback;
    w.showProgress=showProgress?showProgress:null;
    w.sysCallback = chooseFileCallback;
    w.click();
};

export {chooseFile};



