
/*
 * =============================================================
 * An es6 Map dependency injection container
 * =============================================================
 *
 */

//umd pattern

(function (root, factory) {
    if (typeof module !== 'undefined' && module.exports) {
        //commonjs
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([], factory);
    } else {
        // Browser globals (root is window)
        root.elliptical = root.elliptical || {};
        root.elliptical.Container=factory();
        root.returnExports = root.elliptical.Container;
    }
}(this, function () {
    var GET_TYPE_MAX_COUNT=10;
    var GET_TYPE_INTERVAL=200;
    var MAP_TYPE_MAX_COUNT=6;
    var MAP_TYPE_INTERVAL=400;

    return {
        _registrations:{
            _container:null,
            get container() {
                if (this._container) {
                    return this._container;
                } else {
                    this._container=new Map();
                    return this._container;
                }
            }
        },

        //configurable props for registered POJOs
        classNameProp:'@resource',
        providerProp:'$provider',
        defaultTypeName:'Service',

        //overwritable defaultType extend method, called on the defaultType before returning
        extend:function(type){
            return type.extend({}, {});
        },

        /**
         * registers a type
         * @param {string} name 
         * @param {object} type
         */
        registerType:function(name,type){
            var container=this._registrations.container;
            container.set(name,type);
        },

        /**
         * returns the registered type associated with the name
         * @param {string} name
         * @param {boolean} useDefaultTypeIfNotFound
         * @returns {object}
         */
        getType:function(name,useDefaultTypeIfNotFound){
            if(useDefaultTypeIfNotFound===undefined) useDefaultTypeIfNotFound=true;
            var container=this._registrations.container;
            var type=container.get(name);
            if(type!==undefined){
                return type;
            }
            if (!useDefaultTypeIfNotFound) {
                return null;
            } else {
                type = container.get(this.defaultTypeName);
                if (type !== undefined) {
                    try {
                        type =this.extend(type); //if defaultType, call extend to create a derived/sub-class of the type
                    } catch (ex) {

                    }
                    type[this.classNameProp] = name;
                    return type
                } else {
                    return null;
                }
            }
        },

        /**
         * asynchronously returns the registered type associated with the name
         * @param {string} name - type name
         * @param {function} callback - callback
         */
        getTypeAsync:function(name,callback){
            if(callback===undefined){
                throw 'Error: getTypeAsync requires a callback function';
            }
            var self=this;
            var count=0;
            var type=this.getType(name,false);
            if(type){
                callback(type);
            }else{
                var timeoutId=setInterval(function(){
                    //on the last attempt, we set useDefaultTypeIfNotFound to true
                    var useDefaultTypeIfNotFound=(count ===(GET_TYPE_MAX_COUNT-1));
                    type=self.getType(name,useDefaultTypeIfNotFound);
                    if(type){
                        clearInterval(timeoutId);
                        callback(type);
                    }else if(count < GET_TYPE_MAX_COUNT){
                        count++;
                    }else{
                        clearInterval(timeoutId);
                    }
                },GET_TYPE_INTERVAL);
            }
        },

        /**
         *  maps a registered provider to a type by the string name of the provider type
         *  or: directly maps a provider type to a type
         * @param {string} [name] - optional, string name of type
         * @param {object} type - the type
         * @param {*} $name - string name of a registered provider type, or a provider type
         */
        mapType:function(name,type,$name){
            var container=this._registrations.container;
            var classNameProp=this.classNameProp;
            var providerProp=this.providerProp;
            var count=0;

            if($name===undefined){
                $name=type;
                type=name;
                name=null;
            }

            ///**** internal ********************************************************
            // internal function that intermediates the correct parameter call to internal _mapType
            var mapType_=function(t,$n,n){
                var $providerType=self.getType($n);
                if($providerType){
                    (n) ? _mapType(n,t,$providerType) : _mapType(t,$providerType);
                    return $providerType;
                }else{
                    return null;
                }
            };

            //internal function that sets the mapping in the container
            var _mapType=function(n,t,p){
                //support 2-3 args
                if(typeof n !=='string'){
                    p=t;
                    t=n;
                    n=t[classNameProp];
                    t[providerProp]=p;

                }else if(p!==undefined){
                    t[providerProp]=p;
                }
                container.set(n,t);
            };
            ///**** end internal ******************************************************

            if(typeof $name!=='string'){
                (name) ? _mapType(name,type,$name) : _mapType(type,$name);
                return;
            }

            if(!mapType_(type,$name,name)){
                var timeoutId=setInterval(function(){
                    if(mapType_(type,$name,name)){
                        clearInterval(timeoutId);
                    }else{
                        count++;
                        if(count > MAP_TYPE_MAX_COUNT){
                            clearInterval(timeoutId);
                        }
                    }
                },MAP_TYPE_INTERVAL)
            }
        }

    }

}));
