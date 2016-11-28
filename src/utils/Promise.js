/**
 * Created by Brian on 28/11/2016.
 */
let Promise = function() {
    this.queue = [];
    this.value = null;
    this.status = 'pending';// pending fulfilled rejected
};

Promise.prototype.getQueue = function() {
    return this.queue;
};
Promise.prototype.getStatus = function() {
    return this.status;
};
Promise.prototype.setStatus = function(s, value) {
    if (s === 'fulfilled' || s === 'rejected') {
        this.status = s;
        this.value = value || null;
        this.queue = [];
        var freezeObject = Object.freeze || function(){};
        freezeObject(this);// promise的状态是不可逆的
    } else {
        throw new Error({
            message: "doesn't support status: " + s
        });
    }
};
Promise.prototype.isFulfilled = function() {
    return this.status === 'fulfilled';
};
Promise.prototype.isRejected = function() {
    return this.status === 'rejected';
};
Promise.prototype.isPending = function() {
    return this.status === 'pending';
};
Promise.prototype.then = function(onFulfilled, onRejected) {
    var handler = {
        'fulfilled': onFulfilled,
        'rejected': onRejected
    };
    handler.deferred = new Deferred();

    if (!this.isPending()) {//这里允许先改变promise状态后添加回调
        utils.procedure(this.status, handler, this.value);
    } else {
        this.queue.push(handler);//then may be called multiple times on the same promise;规范2.2.6
    }
    return handler.deferred.promise;//then must return a promise;规范2.2.7
};

var utils = (function(){
    var makeSignaler = function(deferred, type) {
        return function(result) {
            transition(deferred, type, result);
        }
    };

    var procedure = function(type, handler, result) {
        var func = handler[type];
        var def = handler.deferred;

        if (func) {
            try {
                var newResult = func(result);
                if (newResult && typeof newResult.then === 'function') {//thenable
                    // 此种写法存在闭包容易造成内存泄露，我们通过高阶函数解决
                    // newResult.then(function(data) {
                    //     def.resolve(data);
                    // }, function(err) {
                    //     def.reject(err);
                    // });
                    //PromiseA+规范，x代表newResult，promise代表def.promise
                    //If x is a promise, adopt its state [3.4]:
                    //If x is pending, promise must remain pending until x is fulfilled or rejected.
                    //If/when x is fulfilled, fulfill promise with the same value.
                    //If/when x is rejected, reject promise with the same reason.
                    newResult.then(makeSignaler(def, 'fulfilled'), makeSignaler(def, 'rejected'));//此处的本质是利用了异步闭包
                } else {
                    transition(def, type, newResult);
                }
            } catch(err) {
                transition(def, 'rejected', err);
            }
        } else {
            transition(def, type, result);
        }
    };

    var transition = function(deferred, type, result) {
        if (type === 'fulfilled') {
            deferred.resolve(result);
        } else if (type === 'rejected') {
            deferred.reject(result);
        } else if (type !== 'pending') {
            throw new Error({
                'message': "doesn't support type: " + type
            });
        }
    };

    return {
        'procedure': procedure
    }
})();

let Deferred = function() {
    this.promise = new Promise();
};

Deferred.prototype.resolve = function(result) {
    if (!this.promise.isPending()) {
        return;
    }

    var queue = this.promise.getQueue();
    for (var i = 0, len = queue.length; i < len; i++) {
        utils.procedure('fulfilled', queue[i], result);
    }
    this.promise.setStatus('fulfilled', result);
};

Deferred.prototype.reject = function(err) {
    if (!this.promise.isPending()) {
        return;
    }

    var queue = this.promise.getQueue();
    for (var i = 0, len = queue.length; i < len; i++) {
        utils.procedure('rejected', queue[i], err);
    }
    this.promise.setStatus('rejected', err);
};

export {Deferred};