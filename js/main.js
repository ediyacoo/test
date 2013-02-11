var app={
      	map:null,
      	css:{map_height:'100%',
			 menuWidget_width:0,
			 infoWidget_height:200,
			 infoWidget_width:0,
			 contextmenu_right:255
      	},
      	mapTypes:[new OpenLayers.Layer.OSM("OpenStreetMap"),
      			  new OpenLayers.Layer.Google("Google Streets", {visibility: false, type:"roadmap", numZoomLevels: 20}),
      			  new OpenLayers.Layer.Google("Google Satellite", {visibility: false, type:"satellite",numZoomLevels: 22}),
      			  new OpenLayers.Layer.Google("Google Hybrid", {visibility: false, type:"hybrid", numZoomLevels: 20}),
      			  new OpenLayers.Layer.Google("Google Terrain", {visibility: false, type:"terrain"}),
      			  new OpenLayers.Layer.XYZ("Google Traffic",["http://mt0.googleapis.com/vt?lyrs=m@189000000,traffic&src=apiv3&hl=en-US&x=${x}&y=${y}&z=${z}&s=&style=api%7Csmartmaps","http://mt1.googleapis.com/vt?lyrs=m@189000000,traffic&src=apiv3&hl=en-US&x=${x}&y=${y}&z=${z}&s=&style=api%7Csmartmaps","http://mt2.googleapis.com/vt?lyrs=m@189000000,traffic&src=apiv3&hl=en-US&x=${x}&y=${y}&z=${z}&s=&style=api%7Csmartmaps","http://mt3.googleapis.com/vt?lyrs=m@189000000,traffic&src=apiv3&hl=en-US&x=${x}&y=${y}&z=${z}&s=&style=api%7Csmartmaps"], {attribution: "",sphericalMercator: true,wrapDateLine: true,transitionEffect: "resize",buffer: 1,numZoomLevels: 18}),
      			  //new OpenLayers.Layer.XYZ("Google Weather",["http://mt0.googleapis.com/vt?lyrs=m@189000000,weather_c_kph&src=apiv3&hl=en-US&x=${x}&y=${y}&z=${z}&s=&style=api%7Csmartmaps"], {attribution: "",sphericalMercator: true,wrapDateLine: true,transitionEffect: "resize",buffer: 1,numZoomLevels: 18}),
      			  new OpenLayers.Layer.Bing({name:"Bing Roadmap", type:"Road", key:"AqpqMtccs90inKd61BNUi-LnEPDhQIlSpfvIm-qY4zM4Bv3_KzF7NMTAzYmco4wZ"}),
      			  new OpenLayers.Layer.Bing({name:"Bing Satellite", type:"Aerial", key:"AqpqMtccs90inKd61BNUi-LnEPDhQIlSpfvIm-qY4zM4Bv3_KzF7NMTAzYmco4wZ"}),
      			  new OpenLayers.Layer.Bing({name:"Bing Hybrid", type:"AerialwithLabels", key:"AqpqMtccs90inKd61BNUi-LnEPDhQIlSpfvIm-qY4zM4Bv3_KzF7NMTAzYmco4wZ"}),
      			  new OpenLayers.Layer.XYZ("Nokia Map",["http://1.maps.nlp.nokia.com/maptile/2.1/maptile/b9e8949142/normal.day/${z}/${x}/${y}/256/png8?app_id=SqE1xcSngCd3m4a1zEGb&token=r0sR1DzqDkS6sDnh902FWQ&lg=ENG","http://2.maps.nlp.nokia.com/maptile/2.1/maptile/b9e8949142/normal.day/${z}/${x}/${y}/256/png8?app_id=SqE1xcSngCd3m4a1zEGb&token=r0sR1DzqDkS6sDnh902FWQ&lg=ENG","http://3.maps.nlp.nokia.com/maptile/2.1/maptile/b9e8949142/normal.day/${z}/${x}/${y}/256/png8?app_id=SqE1xcSngCd3m4a1zEGb&token=r0sR1DzqDkS6sDnh902FWQ&lg=ENG", "http://4.maps.nlp.nokia.com/maptile/2.1/maptile/b9e8949142/normal.day/${z}/${x}/${y}/256/png8?app_id=SqE1xcSngCd3m4a1zEGb&token=r0sR1DzqDkS6sDnh902FWQ&lg=ENG"], {attribution: "",sphericalMercator: true,wrapDateLine: true,transitionEffect: "resize",buffer: 1,numZoomLevels: 19}),
      			  new OpenLayers.Layer.XYZ("Nokia Satellite",["http://1.maps.nlp.nokia.com/maptile/2.1/maptile/b9e8949142/hybrid.day/${z}/${x}/${y}/256/png8?app_id=SqE1xcSngCd3m4a1zEGb&token=r0sR1DzqDkS6sDnh902FWQ&lg=ENG","http://2.maps.nlp.nokia.com/maptile/2.1/maptile/b9e8949142/hybrid.day/${z}/${x}/${y}/256/png8?app_id=SqE1xcSngCd3m4a1zEGb&token=r0sR1DzqDkS6sDnh902FWQ&lg=ENG","http://3.maps.nlp.nokia.com/maptile/2.1/maptile/b9e8949142/hybrid.day/${z}/${x}/${y}/256/png8?app_id=SqE1xcSngCd3m4a1zEGb&token=r0sR1DzqDkS6sDnh902FWQ&lg=ENG", "http://4.maps.nlp.nokia.com/maptile/2.1/maptile/b9e8949142/hybrid.day/${z}/${x}/${y}/256/png8?app_id=SqE1xcSngCd3m4a1zEGb&token=r0sR1DzqDkS6sDnh902FWQ&lg=ENG"], {attribution: "",sphericalMercator: true,wrapDateLine: true,transitionEffect: "resize",buffer: 1,numZoomLevels: 19}),
      			  new OpenLayers.Layer.XYZ("Nokia Terrain",["http://1.maps.nlp.nokia.com/maptile/2.1/maptile/b9e8949142/terrain.day/${z}/${x}/${y}/256/png8?app_id=SqE1xcSngCd3m4a1zEGb&token=r0sR1DzqDkS6sDnh902FWQ&lg=ENG","http://2.maps.nlp.nokia.com/maptile/2.1/maptile/b9e8949142/terrain.day/${z}/${x}/${y}/256/png8?app_id=SqE1xcSngCd3m4a1zEGb&token=r0sR1DzqDkS6sDnh902FWQ&lg=ENG","http://3.maps.nlp.nokia.com/maptile/2.1/maptile/b9e8949142/terrain.day/${z}/${x}/${y}/256/png8?app_id=SqE1xcSngCd3m4a1zEGb&token=r0sR1DzqDkS6sDnh902FWQ&lg=ENG", "http://4.maps.nlp.nokia.com/maptile/2.1/maptile/b9e8949142/terrain.day/${z}/${x}/${y}/256/png8?app_id=SqE1xcSngCd3m4a1zEGb&token=r0sR1DzqDkS6sDnh902FWQ&lg=ENG"], {attribution: "",sphericalMercator: true,wrapDateLine: true,transitionEffect: "resize",buffer: 1,numZoomLevels: 19}),
      			  new OpenLayers.Layer.XYZ("NASA 2012 Night Map",["https://earthbuilder.google.com/10446176163891957399-13737975182519107424-4/2/maptile/maps?v=2&authToken=Cgg5OyyBxpoOuRD80eCGBQ==&x=${x}&y=${y}&z=${z}&s="], {attribution: "",sphericalMercator: true,wrapDateLine: true,transitionEffect: "resize",buffer: 1,numZoomLevels: 8}),
      			  new OpenLayers.Layer.XYZ("Gray Styled Map",["http://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/${z}/${y}/${x}",], {attribution: "",sphericalMercator: true,wrapDateLine: true,transitionEffect: "resize",buffer: 1,numZoomLevels: 14}),
      			  new OpenLayers.Layer.XYZ("NationalGeographicMap",["http://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/${z}/${y}/${x}",], {attribution: "",sphericalMercator: true,wrapDateLine: true,transitionEffect: "resize",buffer: 1,numZoomLevels: 13}),
      			  new OpenLayers.Layer.XYZ("Ocean Map",["http://server.arcgisonline.com/ArcGIS/rest/services/Ocean_Basemap/MapServer/tile/${z}/${y}/${x}",], {attribution: "",sphericalMercator: true,wrapDateLine: true,transitionEffect: "resize",buffer: 1,numZoomLevels: 11}), 
      			  new OpenLayers.Layer.WMS("LandSat1@2000", "http://pc095066:8080/geoserver/KISR/wms", {"layers":"KISR:KIEIN_ADMIN.LANDSAT1_KTM_2000","srs":"EPSG:4326","format":"image/png", "transparent": true, tiled:true}, {visibility:false, singleTile:false}),
      			  new OpenLayers.Layer.WMS("LandSat2@2000", "http://pc095066:8080/geoserver/KISR/wms", {"layers":"KISR:KIEIN_ADMIN.LANDSAT2_KTM_2000","srs":"EPSG:4326","format":"image/png", "transparent": true, tiled:true}, {visibility:false, singleTile:false})
      			  //new OpenLayers.Layer.WMS("ORTHO2054", "http://pc095066:8080/geoserver/KISR/wms", {"layers":"KISR:ZHAO.ORTHO2054","srs":"EPSG:4326","format":"image/png", "transparent": true, tiled:true}, {visibility:false, singleTile:false}),
      			  //new OpenLayers.Layer.XYZ("ikonos9",["http://pc095066/web/tiledmap/ikonos9/${z}/${x}/${y}.png",], {attribution: "",sphericalMercator: true,wrapDateLine: true,transitionEffect: "resize",buffer: 1,numZoomLevels: 16}),
      			  //new OpenLayers.Layer.XYZ("MapBox",["http://a.tiles.mapbox.com/v3/ediyacoo.map-landuse/${z}/${x}/${y}.png","http://b.tiles.mapbox.com/v3/ediyacoo.map-landuse/${z}/${x}/${y}.png","http://c.tiles.mapbox.com/v3/ediyacoo.map-landuse/${z}/${x}/${y}.png", "http://d.tiles.mapbox.com/v3/ediyacoo.map-landuse/${z}/${x}/${y}.png"], {attribution: "",sphericalMercator: true,wrapDateLine: true,transitionEffect: "resize",buffer: 1,numZoomLevels: 19}),
      			  //new OpenLayers.Layer.WMS("KISR Basemap", "http://pc095066:8080/geoserver/KISR/wms", {"layers":"basemap","srs":"EPSG:31900","format":"image/png", "transparent": true, tiled:true}, {visibility:false, singleTile:false})
      			 ],
      	vectorLayer:{
      		toolbox:new OpenLayers.Layer.Vector("toolbox",{isbaseLayer:false}),
      		drawFeature:new OpenLayers.Layer.Vector("drawFeature",{isbaseLayer:false, styleMap:new OpenLayers.StyleMap({"default": new OpenLayers.Style({pointRadius: 6, fillColor: "#0000ff", fillOpacity:0.4, strokeColor: "#0000ff",strokeOpacity:0.5, strokeWidth: 4, cursor:"pointer"})})}),
      		selectFeature:new OpenLayers.Layer.Vector("selectFeature",{isbaseLayer:false})
      	},
      	mapControl:{
      		drawPoint:null,
      		drawPolyline:null,
      		drawPolygon:null,
      		selectFeature_toolbox:null,
      		wms_getFeatureInfo:{}
      	},
      	selectVectorLayers:[],
      	handler:{
      		drawPoint: {featureadded:function(e){console.log(e);}},
      		drawPolyline: {featureadded:function(e){console.log(e);}},
      		drawPolygon: {featureadded:function(e){console.log(e);}},
      		selectFeature_toolbox: {featurehighlighted:function(e){console.log(e);}}
      	},
      	style:{
      		"geocode": {fillColor: "#ff0000",strokeColor: "#ff0000",strokeWidth: 2,graphicZIndex: 1,graphicWidth: 32, graphicHeight: 32, externalGraphic: "images/1350801579_flag.png",graphicXOffset:-16, graphicYOffset:-32, cursor:"pointer"},
      		"route_from":{graphicZIndex: 1,graphicWidth: 32, graphicHeight: 32, externalGraphic: "images/1350884862_orange01.png",graphicXOffset:-16, graphicYOffset:-32, cursor:"pointer"},
      		"route_to":{graphicZIndex: 1,graphicWidth: 32, graphicHeight: 32, externalGraphic: "images/1350884879_orange02.png",graphicXOffset:-16, graphicYOffset:-32, cursor:"pointer"},
      		"route_result":{strokeColor: "#ff0000",strokeOpacity:0.5, strokeWidth: 4, cursor:"pointer"},
      		"route_result_from":{graphicZIndex: 1,graphicWidth: 20, graphicHeight: 32, externalGraphic: "images/icon_greenA.png",graphicXOffset:-10, graphicYOffset:-32, cursor:"pointer"},
      		"route_result_to":{graphicZIndex: 1,graphicWidth: 20, graphicHeight: 32, externalGraphic: "images/icon_greenB.png",graphicXOffset:-10, graphicYOffset:-32, cursor:"pointer"},
      		"terrain_mouseover":{graphicZIndex: 1,graphicWidth: 32, graphicHeight: 32, externalGraphic: "images/1352885056_35.png",graphicXOffset:-16, graphicYOffset:-32, cursor:"pointer"}
      	},
      	theme:{},
      	layersNum:0,
      	initCenterLonLat:null,
      	initCenterZoom:11,
      	popup:null, //new OpenLayers.Popup.FramedCloud("popup",new OpenLayers.LonLat(1,1),null,"<img src='images/loading.gif' width=25px />",null,true),
      	toolbox:{},
      	gmap:null,
      	rightclickProjectedLonLat:null,
      	rightclickLonLat:null,
      	route:{
      		from:{lonlat:null, feature:null},
      		to:{lonlat:null, feature:null},
      		result:{feature:null}
      	},
      	feature:{
      		geocode:null,
      		buffer:null,
      		terrain:null,
      		spatailquery:null,
      		chart:null
      	},
      	onoff:{
      		identify:false
      	},
      	WMSCapabilities:{},
      	lab:{
      		performanceMax:10
      	},
      	geojson: new OpenLayers.Format.GeoJSON(),
      	timeInterval:{
      		layerslider:{onoff:'off',value:null, msec:2000, id:'layerslider', imgID:'layerslider_img'}
      	},
      	main:{}
};


OpenLayers.ProxyHost = "../proxy/openlayer_proxy.py?url=";
//OpenLayers.ProxyHost = "../../proxy/proxy.py?url="; //for localhost testing
OpenLayers.IMAGE_RELOAD_ATTEMPTS = 3;

//alread include in the data.html to increase the performance
//google.load('visualization', '1', {packages: ['corechart','table','controls']}); 






//adjust ui
app.main={
	/**
	 * init user interface 
	 */
	initUI : function(){
			//juery ui tabs
			$(".tabs").tabs();
			
			//jquery ui accordion
			$(".accordion").accordion({autoHeight: false});
			
			//button
			$('button').button();
			
			//buttonset
			$('.buttonset').buttonset();
			
			//dialog
			$('.dialog').dialog();
			
			//set default
			app.css.menuWidget_width=$("#menuWidget").width();
			$("#baseMapSwitch").css("right", app.css.menuWidget_width);
			app.css.infoWidget_width=$(window).width()-$("#menuWidget").width()+30;
			$("#infoWidget").width(app.css.infoWidget_width);
			
			
			//show geocoding toolbox submenu
			app.main.showhideToolboxSubmenu($("#tbx_geocodeAddress").html(), this,{top:"25px", left:"60px"});
			
			
			//while mouse leave #toolboxSubmenu
			$("#toolboxSubmenu").bind({
				"mouseleave":function(e){
					setTimeout(function(){
						$("#toolboxSubmenu").removeClass("opacity_mouseover").addClass("opacity_mouseout");
					},10)
				},
				"mouseover":function(e){
					setTimeout(function(){
						$("#toolboxSubmenu").removeClass("opacity_mouseout").addClass("opacity_mouseover");
					},0);
				}
			});
		
			
			//while mouse leave #contextmenu
			$("#contextmenu").bind({
				"mouseleave":function(e){
					setTimeout(function(){
						$("#contextmenu").hide();
					},10);
				},
				"mouseover":function(e){
					setTimeout(function(){
						$("#contextmenu").show();
					},0);
				}
			});
			
			
			//slider transparency
			$("#slider_transparency").slider({
				value:75,
				min: 0,
		        max: 100,
		        step: 5,
		        slide:function(e,ui){
		        	var name=$("#slider_transparency").attr("name");
		        	if(name && app.map.getLayersByName(name).length>0){
		        		var layer=app.map.getLayersByName(name)[0];
		        		layer.setOpacity(ui.value / 100);
		        	}
		        }
			});
	},
	
	
	
	/**
	 * init map 
	 */
	initMap : function() {
			app.map = new OpenLayers.Map({
		        div: "div_map",
		        projection: new OpenLayers.Projection("EPSG:900913"),
		        displayProjection: new OpenLayers.Projection("EPSG:4326")
		    }); 
		
		    //app.map.zoomToMaxExtent();
		    
		
		    //control
		    //app.map.addControl(new OpenLayers.Control.LayerSwitcher());
		    //app.map.addControl(new OpenLayers.Control.NavToolbar()); 
		    app.mapControl={
		    	mouseControl:new OpenLayers.Control.MousePosition(),
		    	selectFeature_toolbox:new OpenLayers.Control.SelectFeature([app.vectorLayer.toolbox]),
		    	drawPoint:new OpenLayers.Control.DrawFeature(app.vectorLayer.drawFeature, OpenLayers.Handler.Point),
		    	drawPolyline:new OpenLayers.Control.DrawFeature(app.vectorLayer.drawFeature, OpenLayers.Handler.Path),
		    	drawPolygon:new OpenLayers.Control.DrawFeature(app.vectorLayer.drawFeature, OpenLayers.Handler.Polygon),
		    	snap:new OpenLayers.Control.Snapping({layer: app.vectorLayer.drawFeature,targets: [app.vectorLayer.drawFeature],greedy: false}),
		    	wms_getFeatureInfo:{}
		    }
		    
		    
		    $.each(app.mapControl, function(key, control){
		    	//register default event
		    	$.each(app.handler,function(k,handler){
			    	if(k==key){
			    		$.each(handler, function(ev, fx){
			    			control.events.register(ev, control, fx);
			    		});
			    	}
			    });
			    
			    if(control instanceof OpenLayers.Control){
			    	app.map.addControl(control);
		    		control.deactivate();
			    }  	
		    });
		    
		   
		    //set basemap
		 	app.map.addLayers(app.mapTypes);
		    var html="<select onchange='app.map.setBaseLayer(app.map.layers[this.value]);_gaq.push([\"_trackEvent\", \"DATA-Basemap\", this.value]);' title='Change Base Map'>";
		    $.each(app.mapTypes, function(i, mapType){
		    	html+="<option value=" + i + ">"+mapType.name+"</option>";
		    });
		    html+="</select>"
		    $("#baseMapSwitch").html(html);
		    
		    
		    //set google map
		    app.gmap=app.mapTypes[1].mapObject;
		    
		    
		 	//add deafult layer
		    $.each(app.vectorLayer, function(k,v){
		    	app.map.addLayer(v);
		    });
		   
		    
		    
		    //default base layer
		    app.map.setBaseLayer(app.mapTypes[6]);
		    $("#baseMapSwitch option[value=6]").attr("selected","selected") ;
		    
		    
		    //init centerLonLat
		    app.initCenterLonLat=new OpenLayers.LonLat(48,29.3).transform(app.map.displayProjection, app.map.projection);
		    app.map.setCenter(app.initCenterLonLat, app.initCenterZoom);
		
		    //rightclick menu
		    app.map.div.oncontextmenu = function noContextMenu(e) {
		           e = e?e:window.event;
				 
				   var mouseX=(function(){if($.browser.msie){return e.x;}else{return e.layerX}})();
				   var mouseY=(function(){if($.browser.msie){return e.y;}else{return e.layerY}})();
				   
		           //show current coordinates
		           app.rightclickProjectedLonLat=app.map.getLonLatFromPixel(new OpenLayers.Pixel(mouseX, mouseY));
		           app.rightclickLonLat=app.map.getLonLatFromPixel(new OpenLayers.Pixel(mouseX, mouseY)).transform(app.map.projection, app.map.displayProjection);
		           $("#rightclickmenu_coordinate").html("Cuurent Coordinates: (" + app.rightclickLonLat.lon.toFixed(4) +", " + app.rightclickLonLat.lat.toFixed(4) + ")");
		           
		           if (e.button==2){
		           		var top=(function(){if((mouseY+$("#rightclickmenu").height())>$(window).height()){return (mouseY - $("#rightclickmenu").height()+30)}else{return mouseY+10}})()
		           		var left=(function(){if((mouseX+$("#rightclickmenu").width())>$(window).width()){return (mouseX - $("#rightclickmenu").width())}else{return mouseX+10}})()
		                $("#rightclickmenu").fadeIn().css({'left':left,'top':top});
		           }
		           return false;
		    }
		    
		    
		    //hide rightclick menu while click on the map
		    app.map.events.register("click",this, function(e){
		    	$("#rightclickmenu").fadeOut();
		    	$("#contextmenu").hide();
		    })    
	},
	
	
	/**
	 *	showLayer
	 */
	showLayer: function(obj, options){
			if(!obj){
				console.log("[ERROR]showLayer: obj error");
				return;
			}
			
			//options
			if(!options){options={}}
			
			//if obj.param contains time and already load the layer >>> remove layer first
			if(obj.slider && (obj.slider.time || obj.slider.elevation || obj.slider.styles) && app.map.getLayersByName(obj.name).length>0){
				app.map.removeLayer(app.map.getLayersByName(obj.name)[0]);
				obj.oplayer=null;
			}
		
			
			//if layer is already exist >>> check visibility
			if(obj.oplayer && obj.oplayer!='undefined'){
					obj.oplayer.setVisibility(true);
					//show legend
					if(options.id){$("#legend_"+options.id).show();}
					
					//hide loading icon
					if(options.id){$("#loading_" + options.id).hide();}
					
					//show vector layer attribute 
					if(obj.oplayer instanceof OpenLayers.Layer.Vector){
						if(obj.oplayer.vectorLayerAttributeHtml && obj.oplayer.vectorLayerAttributeId){
							app.main.addTab("infoContent_vectorAttributeTabs", obj.oplayer.name, obj.oplayer.vectorLayerAttributeId, obj.oplayer.vectorLayerAttributeHtml);
						}
					}
			}else{
				switch(obj.type){
					  case "AGMS":
					  		var url=obj.url+"/export";
					  		var agms=new OpenLayers.Layer.ArcGIS93Rest(obj.name, url, obj.param);  	
					  		obj.oplayer=agms;
					  		
					  		agms.events.on({
					  			"loadend":function(){
					  				//hide loading icon
							  		if(options.id){$("#loading_" + options.id).hide();}
							  		
							  		//calcualte loading duration
							  		obj.timeEnd=new Date().getTime();
							  		obj.timeDuration= obj.timeEnd - obj.timeStart;
							  		obj.timeDurations.push(obj.timeDuration);
							  		obj.timeAverage=((obj.timeAverage*(obj.timeDurations.length-1))+obj.timeDuration)/obj.timeDurations.length;
							  		$("#contextmenu_loading").html(obj.timeDuration/1000 + 's');
							  		$("#contextmenu_avgloading").html((obj.timeAverage/1000).toFixed(3) + "s");
							  		
							  		//google analyst to track loading time
					  				_gaq.push(['_trackEvent', 'DATA-Layer', obj.type, obj.name, obj.timeDuration]);
					  			},
					  			
					  			"loadstart":function(){
					  				obj.timeStart=new Date().getTime();
						  			
						  			//show loading icon
							  		if(options.id){$("#loading_" + options.id).show();}
					  			}
					  		});
		
					  		//app.map.addLayer(agms);	
					  		
					  		//showlegend
					  		kiein.layer.getAGMSLegend(obj.url, function(html){
					  			if(options.id){$("#legend ul").append("<li id='legend_"+ options.id +"'>"+html + "</li>");}
					  		});
					  		  		
					  break;
					  case "WMS":
					  		var wms=new OpenLayers.Layer.WMS(obj.name, obj.url, obj.param, {isBaseLayer:false, visibility:true, singleTile:false, opacity:0.7});
					  		wms.kiein_srs=obj.param.srs;
						  	if(wms){
						  		//app.map.addLayer(wms); 
						  		obj.oplayer=wms;
						  	};
						  	
						  	
						  	wms.events.on({
						  		"loadend": function(){
							  		//hide loading icon
							  		if(options.id){$("#loading_" + options.id).hide();}
							  		
							  		//calcualte loading duration
							  		obj.timeEnd=new Date().getTime();
							  		obj.timeDuration= obj.timeEnd - obj.timeStart;
							  		obj.timeDurations.push(obj.timeDuration);
							  		obj.timeAverage=((obj.timeAverage*(obj.timeDurations.length-1))+obj.timeDuration)/obj.timeDurations.length;
							  		$("#contextmenu_loading").html(obj.timeDuration/1000 + 's');
							  		$("#contextmenu_avgloading").html((obj.timeAverage/1000).toFixed(3) + "s");
							  		
							  		//google analyst to track loading time
					  				_gaq.push(['_trackEvent', 'DATA-Layer', obj.type, obj.name, obj.timeDuration]);
					  				
								  	
							  		//if lab_performance is enabled, continuously zoom in for 10 times
							  		if($("#lab input:radio[name='lab_performance']:checked").val()=='enable'){
							  			if(obj.performanceIndex < app.lab.performanceMax){
							  				app.map.zoomIn();
							  				console.log(obj.performanceIndex)
							  				obj.performanceIndex++;
							  			}else{
							  				console.log("*************************************************");
							  				console.log(obj.name);
							  				console.log(obj.timeAverage);
							  				console.log(obj.timeDurations);
											console.log("*************************************************");
							  			}
							  		}
						  		},
						  		"loadstart": function(){
						  			obj.timeStart=new Date().getTime();
						  			
						  			//show loading icon
							  		if(options.id){$("#loading_" + options.id).show();}
							  		
						  		}
						  	});
						 
			
						  	//show legend
						  	var url=obj.url+"?service=WMS&version=1.1.0&request=GetMap&";
							$.each(obj.param, function(index, param){
									url+=index+"="+param+"&";
							});
							if(options.id){$("#legend ul").append("<li id='legend_"+ options.id +"'><b>"+ obj.name + "</b><br>" + kiein.layer.getWMSLegend(url, false) + "</li>");}
						  	
						  	
						  	
							//wms getfeatureinfo
							if(!app.mapControl.wms_getFeatureInfo[obj.url]){
								app.mapControl.wms_getFeatureInfo[obj.url]=new OpenLayers.Control.WMSGetFeatureInfo({
										 url: obj.url, 
										 title: 'Identify features by clicking',
										 layers: null, // set null to query all visible layers
										 queryVisible: true,
										 //infoFormat:"application/vnd.ogc.gml"
										 infoFormat:"text/html"
								});
								
								app.mapControl.wms_getFeatureInfo[obj.url].events.register("getfeatureinfo", this, function(e){
										//remove popup window
										if(app.popup){app.map.removePopup(app.popup);}
		
										//determine which infoFormat
										if(app.mapControl.wms_getFeatureInfo[obj.url].infoFormat=="application/vnd.ogc.gml"){
											if(e.features && e.features.length>0){
												//popup
												var pre_name="",
													html="<div id='popup_div'><ul>";
													
												$.each(e.features, function(i,feature){
													if(feature.gml.featureType!=pre_name){
														if(pre_name!=""){
															html+="</table></li>";
														}
														
														html+="<li>"+feature.gml.featureType+"<table id='popup_table'><tr>";
														
														$.each(feature.attributes, function(key,value){
															html+="<td>"+key+"</td>";
														});
														html+="</tr>";
													}
													
													html+="<tr>";
													$.each(feature.attributes, function(key,value){
														html+="<td>"+value+"</td>";
													});
													html+="</tr>";
													
													pre_name=feature.gml.featureType;
													
													//transform geometry from EPSG:31900 to EPSG:900913,
													//but how do we know the original epsg coordinate?
													feature.geometry=feature.geometry.transform("EPSG:31900", "EPSG:900913");
												});
												html+="</ul></div>";
										        
												app.popup=new OpenLayers.Popup.FramedCloud(
									                       	"popup", 
									                        app.map.getLonLatFromPixel(e.xy),
									                        null,
									                        html, //e.text,
									                        null,
									                        true
									            );	
												 
												//show feature
												app.vectorLayer.selectFeature.removeAllFeatures();
										    	app.vectorLayer.selectFeature.addFeatures(e.features);
										    	app.vectorLayer.selectFeature.redraw();
											}else{
												//app.mapControl.wms_getFeatureInfo[obj.url].infoFormat="text/html";
												// app.popup=new OpenLayers.Popup.FramedCloud(
									                       	// "popup", 
									                        // app.map.getLonLatFromPixel(e.xy),
									                        // null,
									                        // "Please click again",//e.text,
									                        // null,
									                        // true
									            // );	
											}
											
										}else{ //text/html
											//get table in the e.text
											var table, HTMLcontent='';
											$(e.text).each(function(i,o){
												//style
												if(o.nodeName=='STYLE'){HTMLcontent+=o.outerHTML;}
												
												//table
												if(o.nodeName=='TABLE'){
													//if hyperlink(http) is contained in each td
													if($(o).find("td:contains('http')").length>0){
														//each td
														$(o).find("td:contains('http')").each(function(){
															//if contains images, such as: jpg, png, tif, gif
															if($(this).text().indexOf('.jpg')>0 || $(this).text().indexOf('.png')>0 || $(this).text().indexOf('.tif')>0 || $(this).text().indexOf('.gif')>0){	
																$(this).text("<a href='" + $.text([this]) + "' target='_blank'><img src='" + $.text([this]) + "' width=100px /></a>");
															}else{
																$(this).text("<a href='" + $.text([this]) + "' target='_blank'>" + $.text([this]) + "</a>");
															}
														});
				
														//set content and replace < and >
														HTMLcontent+="<table class='mapPopup_table'>" + $(o).html().replace(/\&lt;/g,"<").replace(/\&gt;/g, ">")+ "</table><br>";
													}else{
														HTMLcontent+=o.outerHTML + "<br>";
													}
												}
											});
											
											//show popup window
											app.popup=new OpenLayers.Popup.FramedCloud(
									                      "popup", 
									                       app.map.getLonLatFromPixel(e.xy),
									                       null,
									                       HTMLcontent,
									                       null,
									                       true
									        );
									        //app.mapControl.wms_getFeatureInfo[obj.url].infoFormat="application/vnd.ogc.gml";
										}
										
										//show popup
										app.map.addPopup(app.popup);	
								});
								app.map.addControl(app.mapControl.wms_getFeatureInfo[obj.url]);
										    
								if(app.onoff.identify==true){
									app.mapControl.wms_getFeatureInfo[obj.url].activate();
								}
						  	}
					  break;
					  case "KML":
					  		 var kml=new OpenLayers.Layer.Vector(obj.name, {
						      			projection: app.map.displayProjection,
						                strategies: [new OpenLayers.Strategy.Fixed()],
						                renderers: ['Canvas','SVG'],
										protocol: new OpenLayers.Protocol.HTTP({
								                    url: obj.url,
								                    format: new OpenLayers.Format.KML({
								                        extractStyles: true,
								                        extractAttributes: true
						                    		})
						             	})
						           });
						     //app.map.addLayer(kml);
						     obj.oplayer=kml;
						     
						     //legend
						     var legends={};
						     
						     //event
						     kml.events.on({
						     	featureadded: function(e){
						     		if(e.feature.style && e.feature.style.externalGraphic && e.feature.style.id){
						     			if(legends[e.feature.style.id]!="" && !legends[e.feature.style.id]){legends[e.feature.style.id]=e.feature.style.externalGraphic};
						     		}
						     	},
						     	
						     	featuresadded: function(e){
						     		//show legend
						     		//only handel point, not for polyline and polygon
						     		var legend_html="<li id='legend_"+ options.id +"'><b>"+ obj.name + "</b><br>";
						     		$.each(legends, function(k,v){
						     			legend_html+="<img src='" + v + "' width=25px />&nbsp; " + k + "<br>";
						     		});
						     		legend_html+="</li>";
						     		if(options.id){$("#legend ul").append(legend_html);}
						     		
						     		
						     		//hide loading icon
							  		if(options.id){$("#loading_" + options.id).hide();}
							  		
							  		if(!obj.cluster){
								  		//zoom to extent
								  		app.map.zoomToExtent(e.object.getDataExtent());
								  		
								  		//show feature attributes
										kml.vectorLayerAttributeId="attribute_"+options.id;
										kml.vectorLayerAttributeHtml=app.main.vectorLayerAttributeToHtml(kml,kml.vectorLayerAttributeId);
									    app.main.addTab("infoContent_vectorAttributeTabs", obj.name, kml.vectorLayerAttributeId, kml.vectorLayerAttributeHtml);
									    app.main.switchInfoContent("infoContent_vectorAttributeTabs");
								    }
						     	},
						     	featureselected: function(e){
						     		if(app.popup){app.map.removePopup(app.popup)}
						     		
						     		var content="<h2>"+e.feature.attributes.name + "</h2>" + e.feature.attributes.description;
						     		//if content contains javascript, then remove it
						     		if(content.search("<script") != -1) {
						                content = "Content contained Javascript! Escaped content below.<br>" + content.replace(/</g, "&lt;");
						            }
						     		
						     		app.popup=new OpenLayers.Popup.FramedCloud(
									              "popup", 
									              e.feature.geometry.getBounds().getCenterLonLat(),
									              null,
									              content,
									              null,
									              true
									);
									e.feature.popup=app.popup;
									app.map.addPopup(app.popup);
								},
						     	featureunselected: function(e){
						            app.map.removePopup(app.popup);
								}
						     });
						     
						     //select feature control
						     app.selectVectorLayers.push(kml);			     
					  break;
					  case "GEOJSON":
					  		var geojson=new OpenLayers.Layer.Vector(obj.name, {
			                    projection: new OpenLayers.Projection(obj.srs),
			                    //strategies: (obj.cluster) ? [new OpenLayers.Strategy.Fixed(), new OpenLayers.Strategy.Cluster()] : [new OpenLayers.Strategy.Fixed()],
			                    strategies: [new OpenLayers.Strategy.Fixed()],
			                    renderers: ['Canvas','SVG'],
								protocol: new OpenLayers.Protocol.Script({
			                        url: obj.url,
			                        params: obj.param,
			                        format: new OpenLayers.Format.GeoJSON({
			                            ignoreExtraDims: true
			                        }),
			                        callbackKey: obj.callbackkey,
									callbackPrefix: obj.callbackprefix
								}),
								style: obj.style
			                });
			                obj.oplayer=geojson;
			                
			                
			                //show legend
						     if(options.id && obj.style.externalGraphic && obj.style.externalGraphic!=''){$("#legend ul").append("<li id='legend_"+ options.id +"'><b>"+ obj.name + "</b><br><img src='" + obj.style.externalGraphic + "' width=25px /></li>");}
			                
			                //events
			                geojson.events.on({
			                	"featuresadded": function(e){
			                		//hide loading icon
							  		if(options.id){$("#loading_" + options.id).hide();}
							  		
							  		if(!obj.cluster){
							  			//zoom to extent
								  		app.map.zoomToExtent(e.object.getDataExtent());
										//show feature attributes
										geojson.vectorLayerAttributeId="attribute_"+options.id;
										geojson.vectorLayerAttributeHtml=app.main.vectorLayerAttributeToHtml(geojson, geojson.vectorLayerAttributeId);
									    app.main.addTab("infoContent_vectorAttributeTabs", obj.name, geojson.vectorLayerAttributeId, geojson.vectorLayerAttributeHtml);
										app.main.switchInfoContent("infoContent_vectorAttributeTabs");
							  		}
							  		
			                	},
			                	"featureselected":function(e){
			                		console.log(e);
			                		//html
			                		var html=app.main.objToHtml(e.feature.attributes);
			                		if(e.feature.cluster){
			                			html=app.main.objToHtml(e.feature.cluster[0].attributes);
			                			
			                			if(e.feature.cluster.length>1){
				                			html="There are <b>" + e.feature.cluster.length + "</b> features.<br>"
				                			// $.each(e.feature.cluster, function(i,v){
				                				// html+="<b>" + (i+1) + "</b><br>"  + app.main.objToHtml(v.attributes) + "<p>";
				                			// });
				                		}
			                		} 
		
			                		//popup
			                		if(app.popup){app.map.removePopup(app.popup)}
			                		app.popup=new OpenLayers.Popup.FramedCloud(
									              "popup", 
									              e.feature.geometry.getBounds().getCenterLonLat(),
									              null,
									              html,
									              null,
									              true
									);
									e.feature.popup=app.popup;
									app.map.addPopup(app.popup);
			                	},
			                	"featureunselected":function(e){
			                		app.map.removePopup(app.popup);
			                	}
			                });
			                
			                //app.map.addLayer(geojson);
		
			                //add select feature control
			                app.selectVectorLayers.push(geojson);
					  break;
					  case "WFS":
					  		var wfs=new OpenLayers.Layer.Vector(obj.name, {
						                projection: new OpenLayers.Projection(obj.srs),
						                strategies: [new OpenLayers.Strategy.BBOX()],
						                renderers: ['Canvas','SVG'],
										protocol: new OpenLayers.Protocol.WFS({
						                    url: obj.url,
						                    featureType: obj.featureType,
						                    featureNS: obj.featureNS,
						                    geometryName:"GEOMETRY" //NOTE!!!
						                }),
						                renderers: ["Canvas"],
						                style:obj.style
						    });
						    //app.map.addLayer(wfs);
						    obj.oplayer=wfs;
						    
						    //show legend
						     if(options.id && obj.style.externalGraphic && obj.style.externalGraphic!=''){$("#legend ul").append("<li id='legend_"+ options.id +"'><b>"+ obj.name + "</b><br><img src='" + obj.style.externalGraphic + "' width=25px /></li>");}
						    
						    //events
			                wfs.events.on({
			                	"featuresadded": function(e){
			                		//hide loading icon
							  		if(options.id){$("#loading_" + options.id).hide();}
							  		
							  		if(!obj.cluster){
								  		//zoom to extent
								  		app.map.zoomToExtent(e.object.getDataExtent());
										//show feature attributes
										wfs.vectorLayerAttributeId="attribute_"+options.id;
										wfs.vectorLayerAttributeHtml=app.main.vectorLayerAttributeToHtml(wfs,wfs.vectorLayerAttributeId);
									    app.main.addTab("infoContent_vectorAttributeTabs", obj.name, wfs.vectorLayerAttributeId, wfs.vectorLayerAttributeHtml);
									    app.main.switchInfoContent("infoContent_vectorAttributeTabs");
									}
			                	},
			                	"featureselected":function(e){
			                		//html
			                		var html=app.main.objToHtml(e.feature.attributes);
			                		if(e.feature.cluster){
			                			html=app.main.objToHtml(e.feature.cluster[0].attributes);
			                			
			                			if(e.feature.cluster.length>1){
				                			html="There are <b>" + e.feature.cluster.length + "</b> features.<br>"
				                			// $.each(e.feature.cluster, function(i,v){
				                				// html+="<b>" + (i+1) + "</b><br>"  + app.main.objToHtml(v.attributes) + "<p>";
				                			// });
				                		}
			                		} 
		
			                		//popup
			                		if(app.popup){app.map.removePopup(app.popup)}
			                		app.popup=new OpenLayers.Popup.FramedCloud(
									              "popup", 
									              e.feature.geometry.getBounds().getCenterLonLat(),
									              null,
									              html,
									              null,
									              true
									);
									e.feature.popup=app.popup;
									app.map.addPopup(app.popup);
			                	},
			                	"featureunselected":function(e){
			                		app.map.removePopup(app.popup);
			                	}
			                });
			                
			                //add select feature control
			                app.selectVectorLayers.push(wfs);
					  break;
					  case "GEORSS":
					  		var georss=new OpenLayers.Layer.GeoRSS(obj.name, obj.url, {projection: app.map.displayProjection, icon:new OpenLayers.Icon(obj.style.externalGraphic)});
					  		//app.map.addLayer(georss);
					  		
					  		//event
					  		georss.events.on({
					  			loadend:function(e){
					  				//hide loading icon
							  		if(options.id){$("#loading_" + options.id).hide();}
					  			}
					  		});
					  		
					  		obj.oplayer=georss;
					  		
					  		//show legend
						     if(options.id && obj.style.externalGraphic && obj.style.externalGraphic!=''){$("#legend ul").append("<li id='legend_"+ options.id +"'><b>"+ obj.name + "</b><br><img src='" + obj.style.externalGraphic + "' width=25px /></li>");}
					  break;
					  case "UTFGRID":
					  		// var utfgrid=new OpenLayers.Layer.UTFGrid({
							    // url: obj.url,
							    // utfgridResolution: 4, // default is 2
							    // displayInLayerSwitcher: false
							// });
							//// app.map.addLayer(utfgrid);
		// 					
							// var control=new OpenLayers.Control.UTFGrid({
						        // callback: function(e){
						        	// console.log(e)
						        // },
						        // handlerMode: "hover"
						    // });
						    // app.map.addControl(control);
						    // control.activate();
							
							//obj.oplayer=utfgrid;
					  break;
					  case "TMS":
					  		var param={type: 'png', opacity:0.7, isBaseLayer: false};
					  		
					  		if(obj.software=='MapTiler'){
					  			param.getURL=function(bounds){
					  				var me=this;
					  				var res = this.map.getResolution();
						            var x = Math.round((bounds.left - this.maxExtent.left) / (res * this.tileSize.w));
						            var y = Math.round((bounds.bottom - this.tileOrigin.lat) / (res * this.tileSize.h));
						            var z = this.map.getZoom();
						            if (this.map.baseLayer.name == 'Bing Roadmap' || this.map.baseLayer.name == 'Bing Satellite' || this.map.baseLayer.name == 'Bing Hybrid') {
						               z = z + 1;
						            }
		
							 		if(z>=obj.param.minZoom && z<=obj.param.maxZoom){
							 			return (function(){
							 				if(obj.slider && obj.slider.time && obj.slider.time[0]){
							 					if(obj.url_new){
							 						return obj.url_new + z + "/" + x + "/" + y + "." + me.type;
							 					}else{
							 						return obj.url + obj.slider.time[0] + "/"+ z + "/" + x + "/" + y + "." + me.type;
							 					}
							 				}else{
							 					return obj.url + z + "/" + x + "/" + y + "." + me.type;
							 				}
							 			})()
							 		}else{
							 			return "http://www.maptiler.org/img/none.png";
							 		}
							 		
						            
					  			};
					  		}
					  		
					  		var tms=new OpenLayers.Layer.TMS(obj.name, obj.url, param);
					  		obj.oplayer=tms
					  		
					  		//event
					  		tms.events.on({
					  			"loadend": function(){
							  		//hide loading icon
							  		if(options.id){$("#loading_" + options.id).hide();}
							  		
							  		//calcualte loading duration
							  		obj.timeEnd=new Date().getTime();
							  		obj.timeDuration= obj.timeEnd - obj.timeStart;
							  		obj.timeDurations.push(obj.timeDuration);
							  		obj.timeAverage=((obj.timeAverage*(obj.timeDurations.length-1))+obj.timeDuration)/obj.timeDurations.length;
							  		$("#contextmenu_loading").html(obj.timeDuration/1000 + 's');
							  		$("#contextmenu_avgloading").html((obj.timeAverage/1000).toFixed(3) + "s");
							  		
							  		//google analyst to track loading time
					  				_gaq.push(['_trackEvent', 'DATA-Layer', obj.type, obj.name, obj.timeDuration]);
						  		},
						  		"loadstart": function(){
						  			obj.timeStart=new Date().getTime();
						  			
						  			//show loading icon
							  		if(options.id){$("#loading_" + options.id).show();}
						  		}
					  		});
					  break;
				}//end switch
			}//end if
				
				
			//cluster
			if(obj.oplayer instanceof OpenLayers.Layer.Vector){
				if(obj.cluster){
			        var cluster=new OpenLayers.Strategy.Cluster();
					// cluster.distance=10;
					// cluster.threshold=1;
			        obj.oplayer=kiein.layer.clusterVectorLayer(obj.oplayer, {clusterStrategy: cluster});
			    }
			}
		
			//add layer to map
			app.map.addLayer(obj.oplayer);	
			
			//zoom to extent
			if(obj.zoomToExtent && !obj.url_new){
				if(obj.zoomToExtent.zoom){app.map.zoomTo(obj.zoomToExtent.zoom);}
				if(obj.zoomToExtent.extent){app.map.zoomToExtent(obj.zoomToExtent.extent);}  //obj.zoomToExtent.extent should be an array of four values (left, bottom, right, top).
			}
			
			//activate select feature control
			app.mapControl.selectFeature_toolbox.setLayer(app.selectVectorLayers);
			if(!app.mapControl.selectFeature_toolbox.active){
				app.mapControl.selectFeature_toolbox.activate();
			}
	},
	
	
	/**
	 * adjust layer order when click or drag-and-drop layers
	 */
	adjustLayerOrder: function(){
		var layer,theme,num;
		$.each($(".layer_chk:checked").get().reverse(), function(i,dom){
			theme=dom.name.split("_")[0];
			num=dom.name.split("_")[2];
			layer=app.theme[theme].layers[num];
			
			//adjust the layer to the top of layers
			if(layer.oplayer){app.map.raiseLayer(layer.oplayer, app.map.layers.length);	}
		});
		
		//ensure all vector layers, e.g. toolbox, draw, selectfeature, are on the top
		$.each(app.vectorLayer, function(k,v){
			app.map.raiseLayer(v, app.map.layers.length);
		});
	},
	
	
	/**
	 * obj to html
	 */
	objToHtml: function(obj){
			if(!obj){
				console.log("[ERROR]objToHtml: obj is null!");
				return;
			}
			
			var html="<ul class='objToHtml'>";
			$.each(obj, function(k,v){
				html+="<li><b>"+k+"</b>: " + v + "</li>";
			});
			html+="</ul>";
			
			return html;
	},
	
	
	/**
	 * share the map
	 */
	share:function(){
		//get basemap
		var showhidemenu=(function(){if($("#menuContent")[0].style.display=='none'){return "0"}else{return "1"}})(),
			baseurl="http://"+window.location.host + window.location.pathname,
			basemap=$("#baseMapSwitch select").val(),
			z=app.map.getZoom(),
			xy=app.map.getCenter().toShortString(),
			layers=(function(){
				if($(".layer_chk:checked").length>0){
					var checked="";
					$(".layer_chk:checked").each(function(i){
						checked+=this.id + ",";
					});
					return checked.substring(0, checked.length-1);
				}else{
					return null;
				}
			})(),
			accordion=$("#layersAccordion").accordion("option", "active");
		
		$("#share_url").html(baseurl+"?"+"basemap="+basemap+"&z="+z+"&layer="+layers+"&xy="+xy+"&show="+showhidemenu+"&accordion="+accordion);
		$("#share_embedded").html("<iframe src='" + baseurl+"?"+"basemap="+basemap+"&z="+z+"&layer="+layers+"&xy="+xy + "&show=0&accordion="+accordion + "' width=500px height=300px></iframe>");
	},
	
	
	/**
 	* show slider 
 	*/
	showLayerslider: function(obj){
		var length, arrayName, array;
		$.each(obj.slider, function(k,v){
			length=v.length;
			arrayName=k;
			array=v;
		});
		
		//properties
		$("#layerslider_name").html(obj.name);
		var label="<ul>";
		$.each(array, function(i,k){
			label+="<li style='width:" + (100/length) + "%'>"+ k + "</li>";
		});
		$("#layerslider_label").html(label + "</ul>");
		
		
		$("#layerslider").slider({
			value:$("#layerslider").attr("name") || 0,
			min:0,
	        max: length-1,
	        step: 1,
	        slide:function(e,ui){
				$("#layerslider").trigger("change");
	        	app.main.sliderAutoplay('off', app.timeInterval.layerslider.id, app.timeInterval.layerslider.imgID, app.timeInterval.layerslider.msec);
			},
	        change: function(e,ui){
	        	switch (obj.type){
	        		case "WMS":
	        			obj.param[arrayName]=array[ui.value];
	        		break;
	        		case "TMS":
	        			obj.url_new=obj.url+array[ui.value] + "/";
	        		break;
	        	}
			    $("#layerslider").attr("name", ui.value);
			    app.main.showLayer(obj);
			}
		});
		//var css={"right": $("#menuContent").width()+10};
		//$("#layersliderWidget").css(css).show();
		app.main.showDialog("layersliderWidget", obj.name, {width:700, height:80, modal:false, position:"top", close: function(){app.main.sliderAutoplay('off','layerslider', 'layerslider_img', app.timeInterval.layerslider.msec);}});
	},
	
	
	
	/**
	 * slider auto play 
	 */
	sliderAutoplay:function(onoff, sliderID, imgID, msec){
		var value=$("#"+sliderID).slider("value"),
			max=$("#"+sliderID).slider("option", "max");
		
		if(onoff=='on'){
			app.timeInterval.layerslider.onoff='on';
			$("#"+imgID).attr({'src': 'images/1356526217_playback_pause.png', "title": "pause", "onclick": "app.main.sliderAutoplay('off', '" + sliderID + "', '"+ imgID + "', "+ msec +");"});
			
			app.timeInterval.layerslider.value=setInterval(function(){
				if(app.timeInterval.layerslider.onoff=='on'){
					value=value+1;
					if(value > max){value=0};
				
					$("#"+sliderID).slider({"value": value}).trigger('change');
				}else{
					app.main.sliderAutoplay('off', sliderID, imgID, msec);
				}
			}, msec);
		}else{
			if(app.timeInterval.layerslider.value){
				window.clearInterval(app.timeInterval.layerslider.value);
			}
			app.timeInterval.layerslider.onoff='off';
			$("#"+imgID).attr({'src': 'images/1356526192_sq_next.png', "title": "autoplay", "onclick": "app.main.sliderAutoplay('on', '" + sliderID + "', '"+ imgID + "', "+ msec +");"});
		}
	},
	
	
	
	
	/**
	 * read parameter from url
	 */
	readURLParameter:function(){
		if(window.location.href.split("?").length>1){
			var parameters=String(window.location.href.split("?")[1]).split("&"),
				basemap="",
				z="",
				layers="",
				xy="",
				show="",
				accordion=0;
				
				$.each(parameters, function(i,param){
					if(param.indexOf("basemap")!=-1){basemap=param.split("=")[1];}
					if(param.indexOf("z")!=-1){z=param.split("=")[1];}
					if(param.indexOf("layer")!=-1){layers=param.split("=")[1]}
					if(param.indexOf("xy")!=-1){xy=decodeURI(param.split("=")[1]);}
					if(param.indexOf("show")!=-1){show=decodeURI(param.split("=")[1]);}
					if(param.indexOf("accordion")!=-1){accordion=decodeURI(param.split("=")[1]);}
				});
				
				//set basemap, zoom, and center point
				app.map.setBaseLayer(app.mapTypes[basemap]);
				$("#baseMapSwitch option[value=" +basemap +"]").attr("selected","selected") ;
				app.map.setCenter(new OpenLayers.LonLat(parseFloat(xy.split(",")[0]), parseFloat(xy.split(",")[1])),z);
				
				//expand accordion
				if(accordion!=0){
					accordion=2*accordion+1; // dont know why !!
					$("#layersAccordion h3:nth-child("+accordion+")").click();
				}
				
				
				//checked layers
				if(layers!="null"){
					$.each(layers.split(","), function(i, num){
						$($(".layer_chk")[num]).attr("checked",true).triggerHandler("click");
					});
				}
				
				//showhide menu
				if(show=="0"){
					app.main.showHide("menuContent");
				}
		}
	},
	
	
	/**
	 * show layer properties
	 */
	showProperties:function(obj){
		if(!obj){console.log("[ERROR]showProperties: no obj");return;}
		
		
		//show metadta of the obj
		var srs,bbox="", html_image="";
		var html="<ul>";
				
		if(obj.WMSCapability){
			html+="<li><span>Name: "+ "</span>"+obj.name +"</li>"+
				  "<li><span>Source: "+ "</span>"+obj.source +"</li>"+
				  "<li><span>Type: "+ "</span>"+obj.type +"</li>"+
				  "<li><span>Software: "+ "</span>"+obj.software +"</li>"+
				  "<li><span>Duration: "+ "</span>"+obj.timeDuration /1000  +" s</li>";
			
			//srs
			html+="<li><span>SRS: "+ "</span>";
			$.each(obj.WMSCapability.bbox, function(k,v){
				if(k!="CRS:84"){
					html+=k;
					srs=k;
				}
			});
			html+="</li>";
			
			//keyword
			html+="<li><span>Keywords: "+ "</span>";
			$.each(obj.WMSCapability.keywords, function(i,keyword){
				html+=keyword.value + ", ";
			});
			html+="</li>";
			
			//bbox
			html+="<li><span>BBOX: "+ "</span>";
			$.each(obj.WMSCapability.bbox["CRS:84"].bbox, function(i,v){
				if(i==0){
					html+=v + ", <br>";
				}else{
					html+="<span></span>"+ v + ", <br>";
				}
				bbox+=v+',';
			});
			html+="</li>";
			
			
			//abstract
			html+="<li><span>Abstract: "+ "</span><br>" + obj.WMSCapability.abstract + "</li>";
			
			
			//show thumb and legend
			switch(obj.type){
				case "WMS":
				var src=obj.url+ "?service=WMS&version=1.1.0&request=GetMap&layers=" + obj.param.layers + "&styles=&bbox=" + bbox.substr(0, bbox.length-1) + "&width=500&height=500&srs=" + "EPSG:4326"+ "&format=image%2Fpng&tiled=true";
					//show thumb
					html_image="<img src='" + src + "' width=90% />";
				
					//show legend
					html+="<li><span>Legend: </span><br>"+ kiein.layer.getWMSLegend(src, true)+"</li>";
				break;
			}
			
		}else{
			html_image="";
			html+="<li><p></p>We have some problems! Please come back later. </li>";
		}
		html+="</ul>";
		
	
		//show
		$("#layerProperties_metadata").html(html);
		$("#layerProperties_image").html(html_image);
		app.main.showDialog("layerProperties", "Properties", {width:700, height:500, modal:true, position:"center"});
	},
	
	
	
	/**
	 * showToolboxWindow
	 */
	showDialog: function(id, title, dialogOptions){
		//hide rightclickmenu
		$("#rightclickmenu").fadeOut();
		
		if(!dialogOptions){dialogOptions={}}
		
		dialogOptions.title=dialogOptions.title || title;
		dialogOptions.width=dialogOptions.width || 400;
		dialogOptions.height=dialogOptions.height || 120;
		dialogOptions.resizable=false || dialogOptions.resizable;
		//dialogOptions.draggable=false || dialogOptions.draggable;
		dialogOptions.dialogClass="alpha";
		dialogOptions["close"]=dialogOptions["close"] || function(){app.main.deactiveMapControl();};
		
		var position=(function(){
			if($("#menuContent")[0].style.display=='none'){
				return [$("#div_map").width()-dialogOptions.width-40,60];
			}else{
				return [$("#div_map").width()-dialogOptions.width-350,60];
			}
		})();
		dialogOptions.position=dialogOptions.position || position;
		
		//close toolboxWindow
		if($("#"+id).hasClass("toolboxWindow")){
			$('div.toolboxWindow').dialog('close');
		}
		
		$("#"+id).dialog(dialogOptions);
	},
	
	
	
	/**
	 * deactive control in the map
	 */
	deactiveMapControl:function(name){
		$.each(app.mapControl, function(key, control){
			if(name){
				if(key==name){
					control.deactivate();
					return;
				}
			}else{
				if(key!='selectFeature_toolbox' && control instanceof OpenLayers.Control){
					control.deactivate();
				}
				
			}
		});
	},
	
	
	/**
	 * convert vectorLayerAttributeToHtml
	 */
	vectorLayerAttributeToHtml:function(layer, div_id, options){
		//options
		if(!options){options={};}
		
		//if layer.features
		if(layer.features && layer.features.length>0){
			var html="<div id='" + div_id + "' class='vectorLayerAttribute'><table><tr>";
			//field name
			$.each(layer.features[0].attributes, function(k,value){
				html+="<td>"+k + "</td>";
			});
			html+="</tr>";
			
			//read values from attribute
			$.each(layer.features, function(i,feature){	
				html+="<tr onclick='app.main.triggerFeature(\"" + layer.name+ "\", "+ i +", \"featureselected\")'>";
				$.each(feature.attributes, function(k, v){
					html+="<td>"+v+"</td>";
				});
				html+="</tr>";
			});
			html+="</table></div>";
			return html;
		}else{
			console.log("[ERROR]app.main.vectorLayerAttributeToHtml: no feature");
			return null;
		}
	},
	
	

	/**
	  * convert openlayer geometry to goverlay
	  */
	openlayerGeometryToGOverlay:function(geometry){
			//transform geometry to wgs84
			//must to clone a new geometry to avoid the transform coordinates on the original geometry, so that once we refresh the map the geometry will be rendered in the wrong place
			var clone=geometry.clone();
			clone.transform(app.map.projection, app.map.displayProjection);
			return kiein.util.converter.OLGeometryToGOverlay(clone);
	},
	
	
	/**
	 * trigger feature event 
	 */
	triggerFeature:function(layer_name, feature_id, evt){
		var layer=app.map.getLayersByName(layer_name)[0];
		if(layer){
			if(layer.features[feature_id]){
				var feature=layer.features[feature_id];
				layer.events.triggerEvent(evt, {feature:feature});
			}
		}else{
			console.log("[ERROR] app.main.triggerFeature: cannot find layer="+layer_name);
			return;
		}
	},
	
	
	
	//showHide content
	showHide: function(dom_id){
		var elem=$("#"+dom_id)[0];
		
		if(elem.style.display =='none'){
			$('#'+dom_id).show();
			
			switch (dom_id){
				case "menuContent":
					//change show hidemenu icon
					$("#img_showhidemenu").attr("src","images/1351748037_arrow_right.png");
					
					$("#menuWidget").animate({width:app.css.menuWidget_width}, 150, function(){
						$("#baseMapSwitch").css({right:app.css.menuWidget_width+"px"});	
						
						$("#infoWidget").animate({width:app.css.infoWidget_width}, 50, function(){});
					});
				break;
				case "infoPanel":
					$("#infoWidget").animate({height:app.css.infoWidget_height}, 150, function(){
						//app.map.updateSize();
					});
				break;
			}
		}else{
			switch (dom_id){
				case "menuContent":
					$('#'+dom_id).hide();
					
					//change show hidemenu icon
					$("#img_showhidemenu").attr("src","images/1351747972_arrow_left.png");
					
					$("#menuWidget").animate({width:30}, 150, function(){
						$("#baseMapSwitch").css({right:"5px"});		
						
						$("#infoWidget").animate({width:$(window).width()}, 50, function(){});
					});
	
					//hide menuContent dialog
					//$('#'+dom_id).dialog("close");
				break;
				case "infoPanel":
					$('#'+dom_id).fadeOut();
					
					$("#infoWidget").animate({height:20}, 150, function(){
						//app.map.updateSize();
					});
	
	
				break;
			}
		}
		app.map.updateSize();
	},
	
	
	
	//show hide toolbox submenu
	showhideToolboxSubmenu: function(content, dom,css, draggable){
		//$(dom).addClass("toolboxHover");
	
		if(!css){css={}}
		css.width=css.width || 200;
		css.left=css.left || ($('#menuWidget').position().left - css.width-20);
		css.top=css.top || $(dom).position().top;
		css.height=css.height || 25;
		
		$("#toolboxSubmenu").css(css).html(content).fadeIn()
		
		if(draggable==true){
			$("#toolboxSubmenu").draggable();
		}
	},
	
	
	
	//show hide toc context menu
	showContextMenu: function(dom,top){
		if(!dom){console.log("[ERROR]showhideContextMenu: no DOM");return;}
		
		//hide contextmenu first
		$(dom).css({"diaplay": "none"});
		$(dom).hide();
			
		//show context menu
		var height=$(dom).height();
		if(top+height>$(window).height()){
			top=$(window).height() - height;
		}
		var css={
			right:app.css.contextmenu_right,
			top: 0 || top,
			"z-index":1001
		}
		$(dom).css(css).show();
	},
	
	
	
	//handleEnter
	handleEnter: function(e, fx) {
	    var charCode;
	    
	    if(e && e.which){
	        charCode = e.which;
	    }else if(window.event){
	        e = window.event;
	        charCode = e.keyCode;
	    }
	
	    if(charCode == 13) {
	        fx();
	    }
	},
	
	
	//show msg
	showhideMsg: function(type, msg){
		if(msg){
			$("#statusWidget-text").html(msg);
		}
		
		switch(type){
			case "show":
				$("#statusWidget").fadeIn();
			break;
			case "hide":
				$("#statusWidget").fadeOut();
			break;
		}
	},
	
	
	
	/**
	 * add a tab to a existing tabs
	 */
	addTab: function(tab_id, title, content_id, content){
		$("#"+tab_id).append(content).tabs("add", "#"+content_id, title).tabs("select", "#"+content_id);
	},
	
	
	
	
	/**
	 * switch infoContent 
	 */
	switchInfoContent: function(dom_id){
		if(dom_id){
			$(".infoWindowContent").hide();
			$("#"+dom_id).show();		
		}
		if($("#infoWidget").height()==20){
			$("#infoPanel").fadeIn();
			$("#infoWidget").animate({height:app.css.infoWidget_height}, 150, function(){});
		}
	}

	
	
	
	
}


















//toolbox
app.toolbox={
	//zoom to full extent
	fullExtent:function(){
		app.map.setCenter(app.initCenterLonLat, app.initCenterZoom);
	},
	
	//show hide mouse control
	mouseControl:function(){
		if(app.mapControl["mouseControl"].active){
			app.mapControl["mouseControl"].deactivate();
		}else{
			app.mapControl["mouseControl"].activate();
		}
	},
	
	//geocode
	geocode:function(address){
		kiein.service.geocodingAddress(address, function(xy, result, status){
			if(status=="OK"){
				if(app.feature.geocode){
					app.vectorLayer.toolbox.removeFeatures([app.feature.geocode]);
				}
				
				var point=new OpenLayers.LonLat(xy.x,xy.y).transform(app.map.displayProjection, app.map.projection);
				app.feature.geocode=new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Point(point.lon, point.lat), null, app.style.geocode)
				app.vectorLayer.toolbox.addFeatures([app.feature.geocode]);
				
				//zoom to the point
				app.map.setCenter(point);
				
				//active selectControl_toolbox
				app.mapControl.selectFeature_toolbox.activate();
			}else{
				$("#tbx_geocodeAddress_status").html("[ERROR] "+status+"! Please submit again.");
				return;
			}
		});
	},
	
	//drawFeature
	drawFeature:function(type, fx){
		   //clear app.vectorLayer.drawFeature
		   app.vectorLayer.drawFeature.removeAllFeatures();
		
           $.each(app.mapControl, function(k,v){
           		if(k==type){
           			//restore to default handler
           			v.events.listeners.featureadded=[];
           			v.events.register("featureadded", v, app.handler[k].featureadded);
           			
           			//register fx into the featureadded event
		      	    if(fx){
		      	    	v.events.listeners.featureadded=[];
		      	   		v.events.register("featureadded", v, fx);
		      	    }
           			v.activate();
           		}else{
           			if(k!='snap' && v instanceof OpenLayers.Control){
           				v.deactivate();
           			}
           		}
           });
	},
	
	//buffer, e is the featureadded event
	buffer:function(e){		
		//show msg
		app.main.showhideMsg("show","buffering....");
		
		//get distance
		var distance=parseFloat($("#tbx_buffer_distance").val());
		
		//snap activate
		app.mapControl.snap.activate();
		
		//determine geometry
		//var goverlay=app.main.openlayerGeometryToGOverlay(e.feature.geometry);
		
		//project coordinate system
		e.feature.geometry.transform(app.map.projection, app.map.displayProjection)
		
		//do buffer
		if(e.feature){
			kiein.service.buffer(e.feature, distance, bufferResult);
		}else{
			console.log("[ERROR] app.toolbox.buffer: " + e.feature);
		}



		//show buffer result
		function bufferResult(olFeature){
			olFeature.geometry.transform(app.map.displayProjection, app.map.projection);
			app.feature.buffer=olFeature;
			app.vectorLayer.toolbox.addFeatures([app.feature.buffer]);
				
			//hide msg
			app.main.showhideMsg("hide","");
		}
	},
	
	
	//clear overlays
	clearOverlays:function(){
		//remove features in vector layers
		$.each(app.vectorLayer, function(k,v){
			v.removeAllFeatures();
		});
	},
	
	
	//terrain profile
	terrainProfile:function(e){
		if(e.feature){
			//show msg
			app.main.showhideMsg("show", "Calculating....");
			
			//show total length
			$("#tbx_terrain_length").html(e.feature.geometry.getLength().toFixed(4));
			
			var goverlay=app.main.openlayerGeometryToGOverlay(e.feature.geometry);
			if(goverlay){
				$("#tbx_terrain_content").html("<center><img src='images/loading.gif' width=35px /></center>");
				//if($("#tbx_terrain")[0].style.display=='none' || !$("#tbx_terrain").is(":visible")){
					app.main.showDialog("tbx_terrain","Terrain Profile",{width:650, height:340});
				//}
				kiein.service.profile(goverlay, "tbx_terrain_content", {width:600, height:300, 
					callback_mouseover:function(e){
						var latlng=e.value.location
						var point=new OpenLayers.Geometry.Point(latlng.lng(), latlng.lat()).transform(app.map.displayProjection, app.map.projection);
						
						if(app.feature.terrain){
							app.vectorLayer.toolbox.removeFeatures([app.feature.terrain]);
						}
						app.feature.terrain=new OpenLayers.Feature.Vector(point,e, app.style.terrain_mouseover);
						app.vectorLayer.toolbox.addFeatures([app.feature.terrain]);
						app.vectorLayer.toolbox.redraw();
					},
					callback_mouseout:function(e){
						// if(app.feature.terrain){
							// app.vectorLayer.toolbox.removeFeatures([app.feature.terrain]);
						// }
					}
				});
				
				//hide msg
				app.main.showhideMsg("hide", "");
			}else{
				//show msg
				app.main.showhideMsg("show", "[ERROR] app.toolbox.terrainProfile: " + goverlay);
			}
			
			//deactive drawFeature control
			//e.object.deactivate();
		}else{
			app.main.showhideMsg("show", "Please draw a polyline first");
			return;
		}
	},
	
	//measure length
	measureLength:function(e){
		if(e.feature){
			if(e.feature.geometry instanceof OpenLayers.Geometry.LineString){
				//measure length
				var length=e.feature.geometry.getLength();
	            
	            //center point
	            var center_p=e.feature.geometry.getCentroid();
	        	var latlng=new OpenLayers.LonLat(center_p.x, center_p.y);				
				
				if(app.popup){app.map.removePopup(app.popup);}
	            app.popup=new OpenLayers.Popup.FramedCloud(
                       "popup", 
                        latlng,
                        null,
                        "Length: "+length.toFixed(4) + " meters.",
                        null,
                        true
                );
                    
	            app.map.addPopup(app.popup);
	            
	            //hide msg
	            app.main.showhideMsg("hide");
			}	
		}
	},
	
	
	//measure area
	measureArea:function(e){
		if(e.feature){
			if(e.feature.geometry instanceof OpenLayers.Geometry.Polygon){
				//measure length
				var area=e.feature.geometry.getArea();
	            
	            //center point
	            var center_p=e.feature.geometry.getCentroid();
	        	var latlng=new OpenLayers.LonLat(center_p.x, center_p.y);
				
				
				if(app.popup){app.map.removePopup(app.popup);}
	            app.popup=new OpenLayers.Popup.FramedCloud(
                       "popup", 
                        latlng,
                        null,
                        "Area: "+ area.toFixed(4) + " squre meters.",
                        null,
                        true
                );
                    
	            app.map.addPopup(app.popup);
	            
	            //hide msg
	            app.main.showhideMsg("hide");
			}	
		}
	},
	
	//route
	route:function(){
		var from=$('#tbx_route_from').val();
		var to=$('#tbx_route_to').val();
		
		$("#tbx_route_result").html("");
		$("#tbx_route_loading").fadeIn();
		kiein.service.route(from, to, 'DRIVING', {domID:"tbx_route_result", callback:function(response, status){
			//hide loading
			$("#tbx_route_loading").fadeOut();
			
			if(status=='OK'){	
				//animation
				$("#tbx_route").animate({height:400}, 150);
				
				var latlngs=response.routes[0].overview_path;
				var points=[]
				$.each(latlngs, function(i,latlng){
					points.push(new OpenLayers.Geometry.Point(latlng.lng(), latlng.lat()).transform(app.map.displayProjection, app.map.projection));
				});
			
				//show feature
				if(app.route.from.feature && app.route.to.feature){app.vectorLayer.toolbox.removeFeatures([app.route.from.feature,app.route.to.feature]);}
				if(app.route.result.feature){app.vectorLayer.toolbox.removeFeatures([app.route.result.feature,app.route.from.feature,app.route.to.feature]);}
				
				var polyline=new OpenLayers.Geometry.LineString(points);
				app.route.result.feature=new OpenLayers.Feature.Vector(polyline, null, app.style.route_result);
				app.route.from.feature=new OpenLayers.Feature.Vector(points[0], null, app.style.route_result_from);
				app.route.to.feature=new OpenLayers.Feature.Vector(points[points.length-1], null, app.style.route_result_to);
				app.vectorLayer.toolbox.addFeatures([app.route.result.feature, app.route.from.feature, app.route.to.feature]);
			}else{
				$("#tbx_route_result").html(status);
			}
		}});	

	},
	
	
	//add route from and to
	addRoute:function(fromto){
		if(fromto=="from" || fromto=="to"){
			app.route[fromto].lonlat=app.rightclickLonLat;
			$('#tbx_route_'+fromto).val(app.route[fromto].lonlat.lat + ', ' + app.route[fromto].lonlat.lon);
			app.main.showDialog('tbx_route','Route',{height:180});
			
			//show symbol
			if(app.route[fromto].feature){
				app.vectorLayer.toolbox.removeFeatures([app.route[fromto].feature]);
			}
			app.route[fromto].feature=new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Point(app.rightclickProjectedLonLat.lon, app.rightclickProjectedLonLat.lat), null, app.style["route_"+fromto]);
			app.vectorLayer.toolbox.addFeatures([app.route[fromto].feature]);
		}
	},
	
	
	//add web sevice to the menu
	addWS: function(name, type, url){
		if(!url){console.log('[ERROR] Please check URL in the app.toolbox.addWS function'); return;}
		
		
	},
	
	
	//identify
	identify:function(){
		if(app.onoff.identify==false){
				$.each(app.mapControl.wms_getFeatureInfo, function(wms_url, control){
	     			control.activate();
	    		});
				app.onoff.identify=true;
				$("#img_identify").attr("src","images/1351759418_info_64.png");
		}else{
				$.each(app.mapControl.wms_getFeatureInfo, function(wms_url, control){
	     			control.deactivate();
	    		});
	    		app.onoff.identify=false;
	    		$("#img_identify").attr("src","images/1351074801_info.png");
		}
	},
	
	//spatial query
	spatialquery:function(){
		var wfs={
				name: $("#spatialquery_tablename option:selected").text(),
				srs: $("#spatialquery_tablename option:selected").attr("srs"),
				url: $("#spatialquery_tablename option:selected").attr("url"),
				reference: new OpenLayers.WPSProcess.Reference({
					mimeType: "text/xml; subtype=wfs-collection/1.0",
				    href: "http://geoserver/wfs", // if wants to query layers published from the same GeoServer, should used "http://geoserver/wfs", otherwise use the wfs url
				    method: "POST",
				    body: {
				        wfs: {
				           version: "1.0.0",
				           outputFormat: "GML2",
				           //featureType: $("#spatialquery_tablename").val(),
				           featureType: "KISR:KIEIN_ADMIN.LANDUSE"
				        }
				    }
				}),
				reference1:new OpenLayers.WPSProcess.Reference({
					mimeType: "text/xml; subtype=wfs-collection/1.0",
				    href: "http://sgis.kisr.edu.kw/geoserver/KISR/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=KISR:BirdFlu_BirdLocation&outputFormat=GML2",
				    method: "GET",
				    body:null
				})
			},
			relation=$("#spatilquery_relation").val(),
			distance=$("#spatialquery_distance").val(),
			location=$("#spatialquery_location").val();
			
		
		//do geocoding
		if(location!=null && location!=""){
			kiein.service.geocodingAddress(location, function(gLatLng, result, status){
				if(status=="OK"){
					var point=new OpenLayers.LonLat(gLatLng.lng(),gLatLng.lat()).transform(app.map.displayProjection, app.map.projection);
					app.feature.spatialquery=new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Point(point.lon, point.lat), null, app.style.spatialquery)
					app.vectorLayer.toolbox.addFeatures([app.feature.spatialquery]);
					
					//zoom to the point
					app.map.setCenter(point);
					
					//spatial query
					doquery();
				}else{
					console.log("[ERROR] spatial query: "+status+"! Please submit again.");
					return;
				}
			});
		}else{
			doquery();
		}
		
		//switch to infoContent_spatial query
		$("#infoContent_spatialquery_control").html("<table border=0 width=100%><tr></tr></table>");
		$("#infoContent_spatialquery_chart").html("<center>Loading..... <img src='images/loading.gif' width=30px /></center>");
		$("#select_spatialquery_x, #select_spatialquery_y").html("<option value='none'>loading...</option>");
		app.main.switchInfoContent("infoContent_spatialquery");
		
		
		//spatil query
		function doquery(){
			//check if the app.feature.spatialquery exist
			if(app.feature.spatialquery){
				//transform coordinates
				// if(wfs.srs){
					// if(Proj4js.defs[wfs.srs] && Proj4js.defs[wfs.srs]!=''){
 						// app.feature.spatialquery.geometry.transform(app.map.projection, wfs.srs);
 					// }else{
 						// console.log('Please import ' + wfs.srs +" first from http://spatialreference.org/ref/epsg/" + wfs.srs.split(":")[1] + "/proj4js/");
 					// }
				// }
// 				
				//force transform coordinates to epsg:4326
				app.feature.spatialquery.geometry.transform(app.map.projection, "EPSG:31900");
				//app.feature.spatialquery.geometry.transform(app.map.projection, "EPSG:4326");
				
				//intersection
				kiein.service.WPSintersection(wfs.reference, [app.feature.spatialquery], function(output){
					//clear app.vectorLayer.toolbox features
					app.vectorLayer.toolbox.removeAllFeatures();
					
					//reproject cooridnates
					//if use proj4js to transform coordinates, there will be some shift, but use geoserverr wps function to reproject, there is no shift
					// $.each(output.result, function(i, feature){
						// feature.geometry.transform("EPSG:31900", app.map.projection);
						// //feature.geometry.transform(wfs.srs, app.map.projection);
					// });
					//app.vectorLayer.toolbox.addFeatures(output.result);					kiein.service.WPSreproject(output.result, "EPSG:31900", "EPSG:900913", function(features){
						app.vectorLayer.toolbox.addFeatures(features.result);
					});
					app.toolbox.drawGoogleChart.prepare(output.result);
					
					$("#infoContent_spatialquery_chart").html("<center>Please select XFiled, YFiled, and types of charts first and click on the SHOW button.</center>");
				});
				
			}else{
				console.log('[ERROR] spatial query: no app.feature.spatialquery');
				return;
			}
		}
		
		
		
		
	},
	
	//google local search
	googleLocalSearch: function(lonlat, radius, options){
			if(options.types=='none'){return;}
			
			//put the rightclick into the route_from
			//app.toolbox.addRoute("from");
			
			//google local search
			kiein.service.googleLocalSearch("AIzaSyBsptEh29mcCjfh6V-lsX4SbZX4Bk8dXmw", lonlat.lat + "," + lonlat.lon, radius, false, options, function(json){
				//clear app.vectorLayer.toolbox features
				app.vectorLayer.toolbox.removeAllFeatures();
				
				//if results
				if(json.results && json.results.length>0){
					//show features
					var features=[], geometry, feature;
					$.each(json.results, function(i, result){
						geometry=result.geometry.location;	
						feature=new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Point(geometry.lng, geometry.lat).transform("EPSG:4326", app.map.projection));
						feature.googleResult=result;
						features.push(feature);
					});
					
					app.vectorLayer.toolbox.addFeatures(features);
					
					app.vectorLayer.toolbox.events.on({
						"featureselected": function(e){
							var html="<b>"+e.feature.googleResult.name + "</b><br>";
							if(e.feature.googleResult.photos && e.feature.googleResult.photos.length>0){
								html+="<img src='https://maps.googleapis.com/maps/api/place/photo?maxwidth=200&maxheight=200&photoreference=" + e.feature.googleResult.photos[0].photo_reference + "&sensor=false&key=AIzaSyBsptEh29mcCjfh6V-lsX4SbZX4Bk8dXmw' style='max-height:210px; max-width:210px' />";
							}
							
							//popup
	                		if(app.popup){app.map.removePopup(app.popup)}
	                		app.popup=new OpenLayers.Popup.FramedCloud(
							              "popup", 
							              e.feature.geometry.getBounds().getCenterLonLat(),
							              null,
							              html,
							              null,
							              true
							);
							e.feature.popup=app.popup;
							app.map.addPopup(app.popup);
						},
						"featuremoved": function(e){
							
						}
					})
					
					
					//activate map control
					if(!app.mapControl.selectFeature_toolbox.active){
						app.mapControl.selectFeature_toolbox.activate();
					}	
					//network analysis to the nearest (first) location
					//put the rightclick into the route_to
					// var location_first=json.results[0].geometry.location;	
					// app.rightclickLonLat=new OpenLayers.LonLat(location_first.lng, location_first.lat);
					// console.log(app.rightclickLonLat)
					// app.toolbox.addRoute("to");
					// app.toolbox.route();
					
					
				}else{
					console.log("no result")
				}
				
				//hide rightclick context menu
				$("#localsearch_loading").hide();
				$("#rightclickmenu").hide();
			});
	},
	
	//intersection
	intersection: function(query_feature){
		var intersect = kiein.service.WPS.getProcess('localhost', 'gs:Query');
		// var f1=new OpenLayers.Format.WKT().read("POLYGON((47.92236328125 29.443359375, 48.175048828125 29.35546875, 48.092651367188 29.207153320312, 47.936096191407 29.190673828125, 47.850952148438 29.3115234375, 47.92236328125 29.443359375))");
		// var f2=new OpenLayers.Format.WKT().read("POLYGON((47.785034179688 29.3994140625, 48.021240234375 29.319763183593, 47.949829101563 29.130249023437, 47.779541015625 29.11376953125, 47.716369628907 29.248352050781, 47.785034179688 29.3994140625))");
		
		//reference
		var ref1=new OpenLayers.WPSProcess.Reference({
			mimeType: "text/xml; subtype=wfs-collection/1.0",
		    href: "http://geoserver/wfs?service=WFS&version=1.0.0&request=GetFeature&typeName=KISR:BirdFlu_BirdLocation", // should not be changed!!! dont know the reason.
		    method: "POST",
		    body: {
		        wfs: {
		           version: "1.0.0",
		           outputFormat: "GML2",
		           featureType: "KISR:BirdFlu_BirdLocation"
		        }
		    }
		});
		var ref2=new OpenLayers.WPSProcess.Reference({
			mimeType: "text/xml; subtype=wfs-collection/1.0",
		    href: "http://sgis.kisr.edu.kw/geoserver/KISR/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=KISR:BirdFlu_BirdLocation&outputFormat=GML2", // should not be changed!!! dont know the reason.
		    method: "POST",
		    body:{}
		});
		
		// intersect.execute({
			// //gs:Bounds
			// // inputs:{
				// // features:ref2
			// // },
// 
// 	
			// //gs:BufferFeatureCollection
			// // inputs:{
				// // "distance":1,
				// // "features":ref1
			// // },
// 
			// //gs:Clip
			// // inputs:{
				// // "clip":f1,
				// // "features":ref1
			// // },
// 
// 
			// //gs:IntersectionFeatureCollection
			// // inputs:{
				// // "first feature collection":[query_feature],
				// // "second feature collection":ref1
			// // },
// 
// 					
			// //gs:Query
			// inputs:{
				// "features":ref1,
				// "filter":"BIRD_CODE=1"
			// },
// 			
// 
			// //gs:intersection
			// // inputs:{
				// // "a":f1,
				// // "b":f2
			// // },
// 			
			// success: function(output){
				// // f1.geometry.transform(app.map.displayProjection,app.map.projection);
				// // f2.geometry.transform(app.map.displayProjection,app.map.projection);
				// $.each(output.result, function(i,feature){
					// feature.geometry.transform(app.map.displayProjection,app.map.projection)
				// })
// 				
				// app.vectorLayer.toolbox.addFeatures(output.result);
				// //app.vectorLayer.toolbox.addFeatures([f2]);
// 				
			// }
		// });
		
		
		//test wpsbuffer
		// kiein.service.WPSbuffer([query_feature], 0.05, function(outputs){
			// $.each(outputs.result, function(i,feature){
				// feature.geometry.transform(app.map.displayProjection,app.map.projection)
			// });
// 				
			// app.vectorLayer.toolbox.addFeatures(outputs.result);
		// });
		
		
		//test wpsclip
		// kiein.service.WPSclip(ref1, query_feature, function(outputs){
			// $.each(outputs.result, function(i,feature){
				// feature.geometry.transform(app.map.displayProjection,app.map.projection)
			// });
// 				
			// app.vectorLayer.toolbox.addFeatures(outputs.result);
		// });
		
		//test wps intersection
		// kiein.service.WPSintersection(ref1, [query_feature], function(outputs){
			// $.each(outputs.result, function(i,feature){
				// feature.geometry.transform(app.map.displayProjection,app.map.projection)
			// });
// 				
			// app.vectorLayer.toolbox.addFeatures(outputs.result);
		// });
		
		
		//test wps query
		// kiein.service.WPSquery(ref1, "BIRD_CODE=70", function(outputs){
			// $.each(outputs.result, function(i,feature){
				// feature.geometry.transform(app.map.displayProjection,app.map.projection)
			// });
// 
			// app.vectorLayer.toolbox.addFeatures(outputs.result);
		// });
		
		
		//test wps nearest
		// kiein.service.WPSnearest(ref1, query_feature, function(outputs){
			// $.each(outputs.result, function(i,feature){
				// feature.geometry.transform(app.map.displayProjection,app.map.projection)
			// });
// 
			// app.vectorLayer.toolbox.addFeatures(outputs.result);
		// });		
		
		//test wps reproject
		// kiein.service.WPSreproject(ref1, "EPSG:4326", "EPSG:900913", function(output){
			// app.vectorLayer.toolbox.addFeatures(output.result);
		// });
		//test wps simplify
		// kiein.service.WPSsimplify(ref1, 100, function(output){
			// $.each(output.result, function(i,feature){
				// feature.geometry.transform("EPSG:31900", "EPSG:900913");
			// });
			// app.vectorLayer.toolbox.addFeatures(output.result);
		// });
		
	},
	
	//draw google chart
	drawGoogleChart: {
				prepare: function(features){
					this.features=features;
					
					//read attribute to input options in the select_spatialquery
					var html="";
					$.each(features[0].attributes, function(k,v){
						html+="<option value='" + k + "'>" + k + "</option>";
					});
					$(".select_spatialquery").html(html);
				},
					
				execute: function(){
					//check values
					if($("#select_spatialquery_x").val() =='none' || $("#select_spatialquery_y").val() =='none' || $("#infoContent_spatialquery_query :checkbox:checked").length==0){console.log("[ERROR] app.toolbox.drawGoogleChart: Please (1) select x and y fields first and (2) select charts"); return;}
					
					var params=[{id:"select_spatialquery_x"}, {id: "select_spatialquery_y"}],
						selectedCharts=(function(){
							var charts=[];
								$("#infoContent_spatialquery_query :checkbox:checked").each(function(){
									charts.push($(this).next().find("span").html());
								});
							return charts;
						})(),
						me=this;
								
					//control
					var controls={
						dashBoardDomID: "infoContent_spatialquery",
						googleChartControlWrappers:[]
					};
					
					(function(){
						var fieldName,dataType;
						$.each(params, function(i,obj){
							params[i].fieldName=fieldName=$("#"+obj.id).val();
							params[i].dataType=dataType=typeof(me.features[0].attributes[fieldName]);
							switch(dataType){
								case "number":
									controls.googleChartControlWrappers.push({
											  'controlType': 'NumberRangeFilter',
									          'options': {
									            'filterColumnLabel': fieldName,
									          	'ui': {'labelStacking': '', 'label':fieldName}
									          }
									});
								break;
								case "string":
									controls.googleChartControlWrappers.push( {
											   'controlType': 'CategoryFilter',
										        'options': {
										            'filterColumnLabel': fieldName,
										          	'ui': {'labelStacking': '','allowTyping': false,'allowMultiple': false, 'label':fieldName}
												}      			
									});
								break;
							}
						});
					})()
					
					$.each(controls.googleChartControlWrappers, function(i,control){
						$("#infoContent_spatialquery_control tr").append("<td width='" + (100/controls.googleChartControlWrappers.length) + "%'><div id='control_" + i + "'></div></td>");
						controls.googleChartControlWrappers[i].containerId='control_'+i;
					});
					
					
					$("#infoContent_spatialquery_chart").html("")
					var charts=[]
					$.each(selectedCharts, function(i,type){
						$("#infoContent_spatialquery_chart").append("<div id='chart_" + type + "' style='float:left;padding:10px;' class='chart ui-corner-all'></div>");
						
						var chartOptions={
							googleChartWrapperOptions: {
								chartType: type,
								containerId: "chart_" + type,
								view:{columns:[0,1]},
								options: {
									width: $("#infoWidget").width() / 2.8,
									height: 350,
									title: "",
									titleX: params[0].fieldName,
									titleY: params[1].fieldName,
									legend: ""
								}
							},
							callback:null,
							callback_mouseover:null,
							callback_mouseout:null
						};
						charts.push(chartOptions);
					});
					
					kiein.service.drawGoogleChart(this.features, charts, [params[0].fieldName, params[1].fieldName], controls);
				}
	}
}
