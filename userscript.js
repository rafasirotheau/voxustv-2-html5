// ==UserScript==
// @name         Voxus.TV to HTML5
// @namespace    http://github.com/rafasirotheau/voxustv-2-html5
// @version      0.9
// @description  Troca o Voxus.TV Player pelo HTML5
// @author       Rafael Sirotheau
// @match        http://www.naosalvo.com.br/*
// @grant        none
// ==/UserScript==

var scriptName = "Voxus.TV to HTML5",
    debug = true,
    version = 0.9;

function debugThis(msg) {
    if(!debug)
        return false;
    
    console.log('['+scriptName+' v.'+version+'] '+msg);
}

/**
 * jQuery.ajax mid - CROSS DOMAIN AJAX 
 * ---
 * @author James Padolsey (http://james.padolsey.com)
 * @version 0.11
 * @updated 12-JAN-10
 * ---
 * Note: Read the README!
 * ---
 * @info http://james.padolsey.com/javascript/cross-domain-requests-with-jquery/
 */

jQuery.ajax = (function(_ajax){
    
    var protocol = location.protocol,
        hostname = location.hostname,
        exRegex = RegExp(protocol + '//' + hostname),
        YQL = 'http' + (/^https/.test(protocol)?'s':'') + '://query.yahooapis.com/v1/public/yql?callback=?',
        query = 'select * from html where url="{URL}" and xpath="*"';
    
    function isExternal(url) {
        return !exRegex.test(url) && /:\/\//.test(url);
    }
    
    return function(o) {
        
        var url = o.url;
        
        if ( /get/i.test(o.type) && !/json/i.test(o.dataType) && isExternal(url) ) {
            
            // Manipulate options so that JSONP-x request is made to YQL
            
            o.url = YQL;
            o.dataType = 'json';
            
            o.data = {
                q: query.replace(
                    '{URL}',
                    url + (o.data ?
                        (/\?/.test(url) ? '&' : '?') + jQuery.param(o.data)
                    : '')
                ),
                format: 'xml'
            };
            
            // Since it's a JSONP request
            // complete === success
            if (!o.success && o.complete) {
                o.success = o.complete;
                delete o.complete;
            }
            
            o.success = (function(_success){
                return function(data) {
                    
                    if (_success) {
                        // Fake XHR callback.
                        _success.call(this, {
                            responseText: (data.results[0] || '')
                                // YQL screws with <script>s
                                // Get rid of them
                                .replace(/<script[^>]+?\/>|<script(.|\s)*?\/script>/gi, '')
                        }, 'success');
                    }
                    
                };
            })(o.success);
            
        }
        
        return _ajax.apply(this, arguments);
        
    };
    
})(jQuery.ajax);



$(function() {
    
    debugThis("Iniciando script...");
    var $iframes = $('iframe[data-original^="http://www.voxus.tv/player/view"]');
    
    debugThis("Encontrado(s) "+$iframes.length+" Voxus.TV Player(s)");
    console.log($iframes);
    
    $iframes.each(function(i) {
        debugThis("Tentando substituir o "+(i+1)+"º player...");
        var src= $(this).data('original');
        
        console.log($(this).parent());
        
        $.ajax({
            url: src,
            type: 'GET',
            success: function(res) {
                console.log(res.responseText)
                
                var thumbMeta = $(res.responseText).filter('meta[content$="png"]').attr('content');
                
                var video_name = thumbMeta.split('videos/')[1];
                    video_name = video_name.split('.')[0];
                    video_name = video_name.split('_')[0];
                    video_name = video_name.substr(1);

                var HTML5_SRC = "http://d37qvuz6ev41ur.cloudfront.net/v_"+video_name+".mp4";
                var $PARENT = $iframes.filter(":eq("+i+")").parent();
                $iframes.filter(":eq("+i+")").remove();
                $PARENT.html('<video width="640" height="360" controls><source src="'+HTML5_SRC+'" type="video/mp4">Your browser does not support the video tag.</video>');
                
                debugThis("Player "+(i+1)+" substituído!");
            }
        });
    })
    
});