
if(!window.Elliptical){
    window.Elliptical={};
    Elliptical.context={
        get:function(){
            window.$$=window.$$ || {};
            $$.elliptical=$$.elliptical || {};
            $$.elliptical.context=$$.elliptical.context || {};
            return $$.elliptical.context;
        },
        set:function(prop,val){
            var context=this.get();
            context[prop]=val;
        },
        clear:function(){
            var context=this.get();
            context={};
        }
    };
}
