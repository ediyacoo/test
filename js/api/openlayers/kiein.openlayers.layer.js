if(!window.kiein){window.kiein=function(){};}


kiein.layer={
	
	/**
	 * get wms legend, only support getLegendGraphic
	 * @class
	 * @param {String} url 
	 * @param {Boolean} showName 
	 */
	getWMSLegend: function(url, showName) {
		//先從url中得到layer name
		url = url + "&";
	
		//get queryLayers
		var queryLayers = "0";
		//如果有layers
		if(url.search("Layers=") != -1) {
			queryLayers = url.substring(url.indexOf("Layers=") + 7, url.indexOf("&", url.indexOf("Layers=")));
		}
		if(url.search("LAYERS=") != -1) {
			queryLayers = url.substring(url.indexOf("LAYERS=") + 7, url.indexOf("&", url.indexOf("LAYERS=")));
		}
		if(url.search("layers=") != -1) {
			queryLayers = url.substring(url.indexOf("layers=") + 7, url.indexOf("&", url.indexOf("layers=")));
		}
	
		//判斷queryLayers有多少layer
		var html = '';
		for(var i = 0; i < queryLayers.split(',').length; i++) {
			var src = url.split("?")[0] + '?request=getLegendGraphic&service=WMS&version=1.1.1&layer=' + queryLayers.split(',')[i] + "&format=image/png";
	
			if(showName) {
				html += "<b>" + queryLayers.split(',')[i] + "</b><br>" + "<img src='" + src + "' />";
			} else {
				html += "<img src='" + src + "' /><br>";
			}
		}
		return html;
	},
	
	
	
	/**
	 * getAGMSLegend 
	 * get ArcGIS Map Service 10.x legend 
	 * @param {Object} url
	 * @param {Object} callback
	 */
	getAGMSLegend: function(url, callback){
		url=url+"/legend?f=json&callback=?";
		
		$.getJSON(url, function(json){
			if(json && json.layers && json.layers.length>0){
				var html="<table border=0>";
				
				$.each(json.layers,function(i,layer){
					html+="<tr><td><b>" + layer.layerName +"</b></td></tr>"+
						  "<tr><td><table border=0>";
						  
					$.each(layer.legend, function(j,legend){
						html+="<tr><td><img src='data:" + legend.contentType + ";base64, " + legend.imageData + "' /></td><td>" + legend.label + "</td></tr>";
					});
					
					html+="</table></td></tr>";
				});
				html+="</table>";
	
				//callback
				if(callback){
					callback(html);
				}		
			}else{
				console.log("[ERROR]kiein.layer.getAGMSLegend: cannot get legend. Please check only ArcGIS 10 supports Legend");
				return;
			}
		});
	},
	
	
	
	
	/**
	 * create  cluster vector layer
	 * @param {OpenLayers.Layer.Vector} openlayer
	 * @param {Obejct} optinos including {
	 * 					{OpenLayers.Strategy.Cluster} clusterStrategy
	 * 					{OpenLayers.StyleMap} stylemap
	 * 		  }
	 */
	clusterVectorLayer: function(vectorlayer, options){
		if(!vectorlayer){console.log("[ERROR] kiein.layer.clusterVectorLayer: no vectorLayer"); return;}
		if(!(vectorlayer instanceof OpenLayers.Layer.Vector)){console.log("[ERROR] kiein.layer.clusterVectorLayer: vectorLayer is not an OpenLayers.Layer.Vector"); return;}
		
		
		// Define three colors that will be used to style the cluster features
	    // depending on the number of features they contain.
	    // var colors = {
	                // low: "rgb(181, 226, 140)", 
	                // middle: "rgb(241, 211, 87)", 
	                // high: "rgb(253, 156, 115)"
	    // };
	
	    var colors = {
	                low: "rgb(19, 158, 47)", 
	                middle: "rgb(209, 158, 17)", 
	                high: "rgb(217, 59, 24)"
	    };
	            
	    // Define three rules to style the cluster features.
	    var lowRule = new OpenLayers.Rule({
	                filter: new OpenLayers.Filter.Comparison({
	                    type: OpenLayers.Filter.Comparison.LESS_THAN,
	                    property: "count",
	                    value: 10
	                }),
	                symbolizer: {
	                    fillColor: colors.low,
	                    fillOpacity: 0.9, 
	                    strokeColor: colors.low,
	                    strokeOpacity: 0.5,
	                    strokeWidth: 12,
	                    pointRadius: 10,
	                    label: "${label}",
	                    labelOutlineWidth: 1,
	                    fontColor: "#ffffff",
	                    fontOpacity: 0.8,
	                    fontSize: "12px",
	                    cursor:"pointer"
	                }
	    });
	    var middleRule = new OpenLayers.Rule({
	                filter: new OpenLayers.Filter.Comparison({
	                    type: OpenLayers.Filter.Comparison.BETWEEN,
	                    property: "count",
	                    lowerBoundary: 10,
	                    upperBoundary: 30
	                }),
	                symbolizer: {
	                    fillColor: colors.middle,
	                    fillOpacity: 0.9, 
	                    strokeColor: colors.middle,
	                    strokeOpacity: 0.5,
	                    strokeWidth: 12,
	                    pointRadius: 15,
	                    label: "${label}",
	                    labelOutlineWidth: 1,
	                    fontColor: "#ffffff",
	                    fontOpacity: 0.8,
	                    fontSize: "12px",
	                    cursor:"pointer"
	                }
	    });
	    var highRule = new OpenLayers.Rule({
	                filter: new OpenLayers.Filter.Comparison({
	                    type: OpenLayers.Filter.Comparison.GREATER_THAN,
	                    property: "count",
	                    value: 30
	                }),
	                symbolizer: {
	                    fillColor: colors.high,
	                    fillOpacity: 0.9, 
	                    strokeColor: colors.high,
	                    strokeOpacity: 0.5,
	                    strokeWidth: 12,
	                    pointRadius: 20,
	                    label: "${label}",
	                    labelOutlineWidth: 1,
	                    fontColor: "#ffffff",
	                    fontOpacity: 0.8,
	                    fontSize: "12px",
	                    cursor:"pointer"
	                }
	    });
	            
	    // Create a Style that uses the three previous rules
	    var style = new OpenLayers.Style(null, {
	                rules: [lowRule, middleRule, highRule], 
					context: {
						width: function(feature) {
					   		return (feature.cluster) ? 2 : 1;
						},
						radius: function(feature) {
							var pix = 2;
							if(feature.cluster) {pix = Math.min(feature.attributes.count, 7) * 3;}
							return pix;
						},
						label: function(feature) {	
							// clustered features count or blank if feature is not a cluster
							return feature.cluster.length>0 ? feature.cluster.length : ""; 
						}
					}
	    });
		
					  		
		var styleMap = new OpenLayers.StyleMap({
		    "default": style,
		    "select": {fillColor: "#8aeeef",strokeColor: "#32a8a9"}
	    });
		
		
		//options
		if(!options){options={}}
		options.clusterStrategy= options.clusterStrategy || new OpenLayers.Strategy.Cluster();
		options.styleMap= options.styleMap || styleMap;
		
		//add strategies
		options.clusterStrategy.layer=vectorlayer;
		vectorlayer.strategies.push(options.clusterStrategy);
		
		//add stylemap
		vectorlayer.style=null;
		vectorlayer.styleMap=options.styleMap;
	
		return vectorlayer;
	}
	
	
	
	
}




















