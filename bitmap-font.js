/**
 * Created by David Osborne on 17/09/2016.
 */
ig.module(
    "plugins.bitmap-font"
)
.requires(
    "impact.image"
)
.defines(function(){ "use strict";
    ig.BitmapFont = ig.Class.extend({
        fontFile: "",
        _parser: null,
        _pagesLoaded: [],
        _pages: [],
        _characters: {},

        loaded: false,
        failed: false,
        loadCallback: null,
        path: '',

        staticInstantiate: function( path ) {
            return ig.BitmapFont.cache[path] || null;
        },

        init: function(path){
            this.path = path;
            this.load();
        },

        load: function( loadCallback ) {
            if( this.loaded ) {
                if( loadCallback ) {
                    loadCallback( this.path, true );
                }
                return;
            }
            else if( !this.loaded && ig.ready ) {
                this.loadCallback = loadCallback || null;

                var xhr = new XMLHttpRequest();
                xhr.addEventListener("load", this._onFontDefinitionLoaded.bind(this));
                xhr.open("GET", "media/" + this.path);
                xhr.send();
            }
            else {
                ig.addResource( this );
            }

            ig.BitmapFont.cache[this.path] = this;
        },

        _onFontDefinitionLoaded: function(e){
            if(e.responseXML){
                this._parser = new ig.BitmapFont.XmlParser(e.responseXML);
            }
            else{
                this._parser = new ig.BitmapFont.TextParser(e.responseText);
            }
            this._parser.parse();
            this._parser.info;
        },
        _onPageLoaded: function(path, status){

            if(status === false){
                throw( 'Failed to load font page: ' + path );
            }
            if(this._pages.every(function(e){ return e.loaded})){
                this.onload();
            }
        },

        onload: function() {

            this.loaded = true;

            if( this.loadCallback ) {
                this.loadCallback( this.path, true );
            }
        },


        onerror: function( event ) {
            this.failed = true;

            if( this.loadCallback ) {
                this.loadCallback( this.path, false );
            }
        },
        draw: function(text, x, y){

        }
    });

    ig.BitmapFont.cache = {};

    ig.BitmapFont.AbstractParser = ig.Class.extend({
        pages: [],
        info: {},
        init: function(data){
            this.data = data;
        },
        parse: function(){
            throw new Error("Abstract method!")
        }
    });

    ig.BitmapFont.TextParser = ig.Class.extend({
        init: function(data){
            this.parent(data);
        },
        parse: function(){
            var lines,
                info,
                common,
                pages,
                chars,
                kernings;

            lines = data.split("\n");

            // info face=font size=72 bold=0 italic=0 charset= unicode= stretchH=100 smooth=1 aa=1 padding=2,2,2,2 spacing=0,0 outline=0
            info = lines.filter(function(e){
                return e.startsWith("info");
            }).forEach(function(e){
                e.split(" ").forEach(function(e){
                if(e !== "info"){
                    var kv = e.split("=");
                    this.info = kv[e[0]] = e[1];
                }
            }.bind(this))});

            // common lineHeight=80 base=57 scaleW=361 scaleH=512 pages=1 packed=0
            common = lines.filter(function(e){
                return e.startsWith("common");
            });

            // page id=0 file="font.png"
            pages = lines.filter(function(e){
                return e.startsWith("page");
            }).forEach(function(e){
                
                e.split(" ").forEach(function(e){
                    if(e !== "page"){

                    }
                });
            });

            // char id=97 x=2 y=2 width=37 height=41 xoffset=3 yoffset=18 xadvance=40 page=0 chnl=15
            chars = lines.filter(function(e){
                return e.startsWith("char");
            });

            // kerning first=32 second=65 amount=-4
            kernings = lines.filter(function(e){
                return e.startsWith("kerning");
            })


        }
    });

    ig.BitmapFont.XmlParser = ig.Class.extend({
        init: function(data){
            this.parent(data);
        },
        parse: function(){

        }
    });

});