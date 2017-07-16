(function () {
    let global = {
        currScript: null,
        finishModule: {},
        loadingModule: {}
    };

    function require(dept, cb) {
        let node = document.currentScript || global.currScript; //currentScript兼容。实际上写法有误：由于这里先于node.onload事件处理函数执行，所以global.currScript应该改在nextTick去取
        let deptLen = dept.length;
        let arg = [];
        if (deptLen) {
            dept.forEach(function (src, index) {
                if (global.finishModule[src]) {
                    updateState(src, index);
                }
                else {
                    if (global.loadingModule[src]) {
                        let node = global.loadingModule[src];
                        node.addEventListener('finish', function () {
                            updateState(src, index);
                        });
                    }
                    else {
                        let node = creatNode(src);
                        global.loadingModule[src] = node;
                        node.onload = function () {
                            global.currScript = node;
                        };
                        node.addEventListener('finish', function () {
                            updateState(src, index);
                            node.remove();
                        });
                    }
                }
            });
        }
        else {
            finishDef();
        }

        function updateState(src, index) {
            deptLen--;
            arg[index] = global.finishModule[src];
            if (deptLen === 0) {
                finishDef();
            }
        }

        function finishDef() {
            if (node && node.getAttribute('src')) {
                global.finishModule[node.getAttribute('src')] = cb.apply(this, arg);
                let evt = document.createEvent("HTMLEvents");
                evt.initEvent("finish", false, false);
                node.dispatchEvent(evt);
            }
            else {
                cb.apply(this, arg);
            }
        }
    }

    function creatNode(src) {
        let node = document.createElement('script');
        node.async = true;
        document.body.appendChild(node);
        node.src = src;
        return node;
    }

    window.define = window.require = require;
})();