// ==UserScript==
// @name         Voxus.TV to HTML5
// @namespace    http://github.com/rafasirotheau/voxustv-2-html5
// @version      0.9.1
// @description  Troca o Voxus.TV Player pelo HTML5
// @author       Rafael Sirotheau
// @match        http://*/*
// @grant        none
// @require      https://raw.githubusercontent.com/jfriend00/docReady/master/docready.js
// ==/UserScript==

if(self!=top) {
	// Não executar script em iframes.
	return false;
}

var scriptName = "Voxus.TV to HTML5",
	debug = true,
	version = "1.0.0";

function debugThis(msg) {
	if(!debug)
		return false;

	console.log('['+scriptName+' v.'+version+'] '+msg);
}

/* Ajax Class */
var AjaxRequest = function() {
	this.url = null;
	this.ifr = null;
	this.xmlhttp = null;

	this.doRequest = function(url,ifr,count) {
		debugThis(count+'º player: Iniciando requisição Ajax!');

		this.url = url;
		this.ifr = ifr;
		this.xmlhttp=GetXmlHttpObject();

		// Verifica se a requisição foi criada sem erros.
		if (this.xmlhttp==null) {
			alert('Seu navegador não suporta AJAX!');
			return false;
		}
		
		var requisicao = this.xmlhttp;

		requisicao.onreadystatechange=function() {
			
			if(typeof requisicao === 'undefined') {
				return false;
			}

			if (requisicao.readyState==4 && requisicao.status==200) { 
				
				var response = requisicao.responseText.replace(/<script[^>]+?\/>|<script(.|\s)*?\/script>/gi, '');				

				var thumbSrc = response.split('.png"');
					thumbSrc = thumbSrc[0].split('content="');
					thumbSrc = thumbSrc[thumbSrc.length-1] + '.png';
				
					
				var video_name = thumbSrc.split('videos/')[1];
					video_name = video_name.split('.')[0];
					video_name = video_name.split('_')[0];
					video_name = video_name.substr(1);
				
				debugThis(count+'º player: Resposta OK! Substituindo....');

				var videoSrc = "http://d37qvuz6ev41ur.cloudfront.net/v_"+video_name+".mp4";
				debugThis(count+'º player: Video SRC: '+videoSrc);
				
				ifr.parentNode.innerHTML = '<video width="640" height="360" controls><source src="'+videoSrc+'" type="video/mp4">Seu navegador não suporta videos HTML5.</video>';
				
				debugThis(count+"º player: Substituído com sucesso!");
			}
		};

		requisicao.open("GET",url,true);
		requisicao.send();
	}
}
function GetXmlHttpObject() {
	var xmlHttp=null;
	try {
		// Firefox, Opera 8.0+, Safari
		xmlHttp=new XMLHttpRequest();
	}
	catch (e) {
		// Internet Explorer
		try {
			xmlHttp=new ActiveXObject("Msxml2.XMLHTTP");
		}
		catch (e) {
			xmlHttp=new ActiveXObject("Microsoft.XMLHTTP");
		}
	}
	return xmlHttp;
}

var avoid = [],
	ajax_request= [];

docReady(function() {
	debugThis("Iniciando script...");

	var iframes = document.querySelectorAll('iframe[data-original^="http://www.voxus.tv/player/view"], iframe[src^="http://www.voxus.tv/player/view"]');
	if(iframes.length <= 0) {
		debugThis("Nenhum player encontrado. Finalizando o script...");
		return false;
	}

	// Remover elementos escondidos - NaoSalvo não é o que chamamos de responsivo. Sendo assim, existem dois elementos de iframe: um para mobile e outro para desktop
	var found = 0;
	for (var i = iframes.length-1; i >= 0; i--) {
		if (iframes[i].offsetWidth > 0 && iframes[i].offsetHeight > 0) {
			avoid[i] = false;
			found++;
		} else {
			avoid[i] = true;
			
		}
	}
	
	debugThis("Encontrado(s) "+found+" Voxus.TV Player(s)");
	var count = 1;
	for(i=0;i<iframes.length;i++) {
		if(!avoid[i]) {
			var curr_iframe = iframes[i];
			debugThis(count+"º player: Tentando substituir...");

			var src= curr_iframe.getAttribute('data-original') || curr_iframe.getAttribute('src');
			var requestUrl = 'http://query.yahooapis.com/v1/public/yql?'+
			'q='+encodeURIComponent('select * from html where url="'+src+'" and xpath="*"')+
			'&format=xml';

			ajax_request[i] = new AjaxRequest;
			ajax_request[i].doRequest(requestUrl, curr_iframe, count)
			count++;
		}
	}
});