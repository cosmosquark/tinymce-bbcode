function isInArray(list,string){
	return list.indexOf(string.toLowerCase()) > -1
}



function conv(o,htmlbb){
//    var test_patt = /\[|\</;
//    var bb = test_patt.exec(main_in)=='[';

	// define some elements
    var brac, open_b, li_elem_patt


	function pre(temp_o) {
		// define the regex for open and close paranthesis
		var pt_patt  = /([^\[\]<>\n]+)(?![^\[\]<>\n]*[\]>])/g;
		var nl_patt  = new RegExp ('(\\\\n|'+open_b+'br /'+close_b+')','g');
		var p_patt   = new RegExp ('('+open_b+'\\s*br\\s*'+close_b+open_b+'\\s*\\/br\\s*'+close_b+'){2}','g');
		temp_o = temp_o.replace(li_elem_patt,brac("list_element")+"$1"+brac("/list_element"));
		temp_o = temp_o.replace(nl_patt,brac("br")+brac("/br"));
		temp_o = temp_o.replace(p_patt,brac("p")+brac("/p"));
		temp_o = temp_o.replace(pt_patt,brac("plain")+"$1"+brac("/plain"));
		return temp_o;
	}



	function init(htmlbb) {
       // conditions for if html or bbcode
	   if (htmlbb) {
		brac         = function (str) { return "["+str+"]";};
		open_b       ="\\[", close_b="\\]", type = "BB";
		li_elem_patt = new RegExp (open_b+"\\*"+close_b+"(.*?)("+open_b+"\\*"+close_b+"|\\n)","g");
		} else {
		brac = function (str) { return "<"+str+">";};
		open_b="\\<", close_b="\\>", type = "HTML";
		li_elem_patt = new RegExp (open_b+"li"+close_b+"(.*?)"+open_b+"li"+close_b,"g");
		}
	}

	function calc(temp_o) {
        // find the tags, put them all into objects
		var out = [];
		var curr = 0;
		var all = "(?:.|\n)"
		var main_patt = new RegExp (open_b+"\\s*(\\w+)"+all+"*?"+open_b+"\\s*\\/\\s*\\1\\s*"+close_b);
		var tag_patt = new RegExp (open_b+"\\s*(\\w+)\\s*");
		var att_patt = new RegExp ("(\\w+)=(\\d+|([\\\"']).*?\\3|\\w+)\\s*");
		var cont_patt = new RegExp (open_b+"\\s*(\\w+).*?"+close_b+"("+all+"*?)"+open_b+"\\s*\\/\\s*\\1\\s*"+close_b);
		var brac_tag = new RegExp ("^[^"+close_b+"]");

		while (main_patt.test(temp_o)) {
			var input = main_patt.exec(temp_o)[0];
			var match = tag_patt.exec(input);
			out.push({format:type, type:match[1], content:"", attributes:{}, sub_layer:false});
			match=cont_patt.exec(input);
			out[curr].content=calc(match[2]);
			if (typeof out[curr].content == typeof []) { out[curr].sub_layer=true; }
	 	  	input = input.replace(tag_patt,"");
			while (brac_tag.test(input)) {
				match=att_patt.exec(input);
				if (match) {
				out[curr].attributes[match[1]] = match[2].replace(/["']/g,"");
				input = input.replace(att_patt,"");
				} else {
				alert('Bad '+type+'Code');
				return [];
				}
			}
			temp_o =  temp_o.replace(main_patt,"");
			curr++;
		}
		if (out.length ==  0) {
		return temp_o;
		} else if (out.length == 1 && out[0].type == "plain") {
		return out[0].content;
		} else {
		return out;
		}
	}

//	function preproc_insert_image(temp_o){
//		console.log("prec image");
//		var html_patt = new RegExp(/\<img\s(:?.+)\/\>/);
//		console.log(html_patt.test(temp_o));
//		while (html_patt.test(temp_o)) {
//			var match = html_patt.exec(temp_o);
//			//var att_patt = new RegExp ("(\\w+)=(\\d+|([\\\"']).*?\\3|\\w+)\\s*");
//			var replace_str = "[img " + match[1] + "][/img]";
//			temp_o = temp_o.replace(match[0],replace_str); 
//		}
//		return temp_o;
//	}

	function res_to_string(res,htmlbb_flip) {
        // process those objects and do the conversion
		var temp_o = "";
		var i = 0;

//		if (res.hasOwnProperty("content") ){
//			if (res.content != "" && res.hasOwnProperty("length")) {
			for (i = 0; i < res.length; i++) {
				var sub_res = res[i];
				if (sub_res.sub_layer == false) {
					if (sub_res.type != "plain" && sub_res.type != "br"){
						if (sub_res.type == "p" && htmlbb_flip){
							// if html
							if (sub_res.attributes.hasOwnProperty("style")){
								temp_o += brac(inner_brac_process(sub_res,htmlbb_flip) + " ") + sub_res.content +  brac("/" + sub_res.type) + "\n\n";
							} else {
								temp_o += sub_res.content + "\n\n";
							}
						} else {
							temp_o += brac(inner_brac_process(sub_res,htmlbb_flip)) + sub_res.content + brac("/" + sub_res.type);
						}
					} else if (sub_res.type == "br"){
						if (htmlbb == true) {
							temp_o += "<br />";
						} else {
							temp_o += "\n";
						} 
					} else {
						temp_o += sub_res.content;
					}

				} else {
					if (sub_res.type != "plain" && sub_res.type != "br"){
						if (sub_res.type == "p" && htmlbb_flip){
							// if html
							if (sub_res.attributes.hasOwnProperty("style")){
								temp_o += brac(inner_brac_process(sub_res,htmlbb_flip) + " ") + res_to_string(sub_res.content) + brac("/" + sub_res.type) + "\n\n";
							} else {
								temp_o += res_to_string(sub_res.content) + "\n\n";
							}
						} else {
							temp_o += brac(inner_brac_process(sub_res,htmlbb_flip)) + res_to_string(sub_res.content) + brac("/" + sub_res.type);
						}
					} else if (sub_res.type == "br"){
						if (htmlbb == true) {
							temp_o += "<br />";
						} else {
							temp_o += "\n";
						} 
					} else {
						temp_o += res.content;
					}
				}
			}
//			}
//		}

		return temp_o;
	}

	function inner_brac_process(res,htmlbb_flip) {
		var ostring = "";
		// lets define the type
		//ostring += //res.type.toString();
		ostring += res.type
		// now list the attributes
		var attributes = res.attributes;
		// loop over the properties and convert them to string
		for (var property in attributes) {
			if (attributes.hasOwnProperty(property)) {
/*				if (htmlbb_flip){
					// html
					if (property == "style"){ // we need to do something different with this
						ostring += " " + property + "=\"" + attributes[property] + "\"";
					} else {
						ostring += " " + property + "=\"" + attributes[property] + "\"";
					}
				} else { 
					// bbcode
					if (property == "style"){ // we need to do something different with this
						ostring += " " + property + "=\"" + attributes[property] + "\"";
					} else {
						ostring += " " + property + "=\"" + attributes[property] + "=\"";
					}
				} */
				ostring += " " + property + "=\"" + attributes[property] + "\"";
			}
		}
		return ostring;
	}

	function html_emot(r,gif,temp_o){
		// May need to alter this variable
		i = "/tinymce/";
//				var string = '<img src="' + i + 'plugins/emoticons/img/' + gif + '">';
		// for some reason, does not
		var string = '<img alt="' + r + '" src="' + i + 'plugins/emoticons/img/' + gif  + '" />';
		var regthing = RegExp(string,'gi');
		rep_string = ":" + r + ":";
		temp_o = temp_o.replace(regthing,rep_string);
 
		var string = '<img alt="' + r + '" src="' + i + 'plugins/emoticons/img/' + gif + '" data-mce-src="' + i + 'plugins/emoticons/img/' + gif  + '" />';
		var regthing = RegExp(string,'gi');
		rep_string = ":" + r + ":";
		temp_o = temp_o.replace(regthing,rep_string);

//		var string = '[img alt="' + r + '"]' + i + 'plugins/emoticons/img/' + gif + '[/img]';
//		rep_string = ":" + r + ":";
//		temp_o = temp_o.replace(string,rep_string);

//		var string = '[img]' + i + 'plugins/emoticons/img/' + gif + '[/img]';
//		rep_string = ":" + r + ":";
//		temp_o = temp_o.replace(string,rep_string);
		return temp_o;
	}

	function bb_emot(e,gif,temp_o){);
		var rep_string = ":" + e + ":";
		// may need to alter this
		var i = "/tinymce/";
		var img_string = '<img alt="' + e + '" src="' + i + 'plugins/emoticons/img/' + gif  + '" />';
		var regthing = RegExp(rep_string,'gi');
		temp_o = temp_o.replace(regthing,img_string);

		var img_string = '<img alt="' + e + '" src="' + i + 'plugins/emoticons/img/' + gif + '" data-mce-src="' + i + 'plugins/emoticons/img/' + gif  + '" />';
		var regthing = RegExp(rep_string,'gi');
		temp_o = temp_o.replace(regthing,img_string);
		return temp_o;
	}


	var temp_o = o;
	if (htmlbb == true) {
		// preprocessing


		// btw this bbcode to html
		temp_o = bb_emot("cool","smiley-cool.gif",temp_o);
		temp_o = bb_emot("cry", "smiley-cry.gif",temp_o);
		temp_o = bb_emot("embarassed", "smiley-embarassed.gif",temp_o);
		temp_o = bb_emot("foot-in-mouth", "smiley-foot-in-mouth.gif",temp_o);
		temp_o = bb_emot("frown", "smiley-frown.gif",temp_o);
		temp_o = bb_emot("innocent", "smiley-innocent.gif",temp_o);
		temp_o = bb_emot("kiss", "smiley-kiss.gif",temp_o);
		temp_o = bb_emot("laughing", "smiley-laughing.gif",temp_o);
		temp_o = bb_emot("money-mouth", "smiley-money-mouth.gif",temp_o);
		temp_o = bb_emot("sealed", "smiley-sealed.gif",temp_o);
		temp_o = bb_emot("smile", "smiley-smile.gif",temp_o);
		temp_o = bb_emot("suprised", "smiley-suprised.gif",temp_o);
		temp_o = bb_emot("tongue-out", "smiley-tongue-out.gif",temp_o);
		temp_o = bb_emot("undecided", "smiley-undecided.gif",temp_o);
		temp_o = bb_emot("wink", "smiley-wink.gif",temp_o);
		temp_o = bb_emot("yell", "smiley-yell.gif",temp_o);
		// this is messing up the pasting part, need some way of retaining this 
		// life hack right below
		// somewhat solves all of lifes problems.
		// ok for real, duplicate <p> tags are destroyed, and this allows for retention of <p> styles too
		// likewise, wrapping <p> around the entire body of text is a bad idea since 1) tinymce handles this for you
		// and 2) it has unfound consequences with pasting into tinymce.
		temp_o = temp_o.replace(new RegExp('\<br \/\>','g'),"[br][/br]");
		temp_o = temp_o.replace(new RegExp('([\s\S]?:\n\n|\n\n)','g'), '[plain]</p><p>[/plain]');
		temp_o = temp_o.replace(new RegExp('([\s\S]?:\r\r|\r\r)','g'), '[plain]</p><p>[plain]');
		temp_o = temp_o.replace(new RegExp('([\s\S]?:\n|\n)','g'), '[br][/br]');
		temp_o = temp_o.replace(new RegExp('([\s\S]?:\r|\r)','g'), '[br][/br]');
//		temp_o = temp_o.replace(new RegExp('\<([a-z][a-z0-9]*)\b(.*)[^>]\/\>$','gi'),"<$1 $2 ></$1>");
//		temp_o = temp_o.replace(new RegExp('\<([a-z][a-z0-9]*)\b(.*)[^>]\>$','gi'),"<$1 $2 ></$1>");
		temp_o = temp_o.replace(/\<img\b(.*)\>$/gi,'<img$1></img>[/plain]');  // handle pasting of images (hence the $)
		temp_o = temp_o.replace(/\<img\b(.*)\s\/\>/gi,'[plain]<img$1></img>[/plain]'); // handle how tinymce handles things
		temp_o = temp_o.replace(new RegExp('<span id="mce_marker" data-mce-type="bookmark">﻿È</span>','g'),'');

		temp_o = temp_o + "[/plain]";
	}  else {
		temp_o = html_emot("cool","smiley-cool.gif",temp_o);
		temp_o = html_emot("cry", "smiley-cry.gif",temp_o);
		temp_o = html_emot("embarassed", "smiley-embarassed.gif",temp_o);
		temp_o = html_emot("foot-in-mouth", "smiley-foot-in-mouth.gif",temp_o);
		temp_o = html_emot("frown", "smiley-frown.gif",temp_o);
		temp_o = html_emot("innocent", "smiley-innocent.gif",temp_o);
		temp_o = html_emot("kiss", "smiley-kiss.gif",temp_o);
		temp_o = html_emot("laughing", "smiley-laughing.gif",temp_o);
		temp_o = html_emot("money-mouth", "smiley-money-mouth.gif",temp_o);
		temp_o = html_emot("sealed", "smiley-sealed.gif",temp_o);
		temp_o = html_emot("smile", "smiley-smile.gif",temp_o);
		temp_o = html_emot("suprised", "smiley-suprised.gif",temp_o);
		temp_o = html_emot("tongue-out", "smiley-tongue-out.gif",temp_o);
		temp_o = html_emot("undecided", "smiley-undecided.gif",temp_o);
		temp_o = html_emot("wink", "smiley-wink.gif",temp_o);
		temp_o = html_emot("yell", "smiley-yell.gif",temp_o);

		temp_o = temp_o + "</plain>";
		temp_o = temp_o + "</p>";
		temp_o = temp_o.replace(new RegExp('\<br \/\>','g'),"<plain>\n</plain>");
//		temp_o = temp_o.replace(new RegExp('\<([a-z][a-z0-9]*)\b(.*)[^>]\/\>$','gi'),"[$1 $2 ][/$1]");
//		temp_o = temp_o.replace(new RegExp('\<([a-z][a-z0-9]*)\b(.*)[^>]\>$','gi'),"[$1 $2 ][/$1]");
		temp_o = temp_o.replace(/\<img\b(.*)\s\/\>/gi,'<plain>[img$1][/img]</plain>');
		temp_o = temp_o.replace(/\<img\b(.*)\>$/gi,'<plain>[img$1][/img]</plain>');
		// editor haxors
		temp_o = temp_o.replace(new RegExp('<span id="mce_marker" data-mce-type="bookmark">﻿È</span>','g'),'');
	}

    init(htmlbb);
    temp_o = pre(temp_o);
    var res = calc(temp_o);

	if (typeof res == "string"){
        // i.e if nothing much really changed
		o = temp_o.replace(temp_o,res);
	} else {
        // change the html to bbcode
		var htmlbb_flip = !htmlbb;
		init(htmlbb_flip);
        // process the string and replace
		o = temp_o.replace(temp_o,res_to_string(res,htmlbb_flip));
	}
	return o;

}



! function() {
	tinymce.create("tinymce.plugins.BBCodePlugin", {
		init: function(o) {
			var e = this,
				t = o.getParam("bbcode_dialect", "punbb").toLowerCase();
			o.on("beforeSetContent", function(o) {
				o.content = e["_" + t + "_bbcode2html"](o.content)
			}), o.on("postProcess", function(o) {
				o.set && (o.content = e["_" + t + "_bbcode2html"](o.content)), o.get && (o.content = e["_" + t + "_html2bbcode"](o.content))
			})
		},
		getInfo: function() {
			return {
				longname: "SACMS BBCode Plugin",
				author: 'Cosmosquark',
				authorurl: 'http://www.cosmosquark.com.com',
				infourl: "http://www.tinymce.com/wiki.php/Plugin:bbcode"
			}
		},





		_punbb_html2bbcode: function(o) {
			o = tinymce.trim(o);

			function rep(e, t) {
				o = o.replace(e, t);
			}


			//rep(/<img.*?src=\"(.*?)\".*?\/>/gi,"[img]$1[/img]");

			o = conv(o,false);

			rep(/&lt;/gi, "<");
			rep(/&gt;/gi, ">");
			rep(/&amp;/gi, "&");
			rep(/&nbsp;|\u00a0/gi," ");
			rep(/&quot;/gi, '"');

			return o

		},
		_punbb_bbcode2html: function(o) {

			o = tinymce.trim(o);

			function rep(e, t) {
				// somehow want to do something so that if [break] is on the same line.. then don't replace
				o = o.replace(e, t);
			}

			//rep(/\[img\](.*?)\[\/img\]/gi, '<img src="$1" />');
			o = conv(o,true);
			return o;
		}
	}), tinymce.PluginManager.add("bbcode_sacms", tinymce.plugins.BBCodePlugin)
}();
