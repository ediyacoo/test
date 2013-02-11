if(!window.kiein){window.kiein=function(){};}

kiein.util=function(){};




/**
 * @class
 */
kiein.util.converter = {}
	



/**
 * 將openlayer的geometry(譬如point, linestring, polygon)轉換成Goverlay
 * 但是，請先將geometry透過transform方法，轉換成經緯度座標！
 * @param {Object} geometry 輸入openlayer的geometry
 * @return {GOverlay} 依據給予的geometry type傳回對應的GOverlay包括，GMarker, GPolyline, and GPolygon
 */
kiein.util.converter.OLGeometryToGOverlay=function(geometry){
		//判斷有沒有OpenLayers
		if(!OpenLayers){
			console.log("[ERROR]kiein.util.converter.openlayerGeometryToGOverlay: 未引用openlayers.js");
			return
		}
		
		//determine geometry
		//point
		var goverlay;
		if(geometry instanceof OpenLayers.Geometry.Point){
			goverlay=new google.maps.Marker({position: new google.maps.LatLng(geometry.y, geometry.x)});
		}
		
		//polyline or polygon
		if(geometry instanceof OpenLayers.Geometry.LineString || geometry instanceof OpenLayers.Geometry.Polygon){
			var latlngs=[];
			$.each(geometry.getVertices(), function(i, point){
				latlngs.push(new google.maps.LatLng(point.y, point.x));
			});
			
			if(geometry instanceof OpenLayers.Geometry.LineString){
				goverlay=new google.maps.Polyline({path:latlngs});
			}else{
				latlngs.push(latlngs[0]);
				goverlay=new google.maps.Polygon({paths:latlngs});
			}
		}
		
		return goverlay;
}



/**
 * 將GOverlay(包括gmarker, gpolyline, gpolygon)轉換成對應的Openlayer Geometry(包括Point, lineString, polygon)
 * @param {GOveraly} goverlay 回傳經緯度的GOverlay
 * @return {OpenLayers.Geometry} 
 */
kiein.util.converter.GOverlayToOLGeometry=function(goverlay){
	if(!OpenLayers){
		console.log("[ERROR]kiein.util.converter.GOverlayToOLGeometry: 未引用openlayers.js");
		return;
	}
	
	var geometry;
	//判斷goverlay geometry
	//marker
	if(goverlay instanceof google.maps.Marker){
		geometry=new OpenLayers.Geometry.Point(goverlay.getPosition().lng(), goverlay.getPosition().lat());
	}
	
	//polyline
	if(goverlay instanceof google.maps.Polyline){ 
		var points=[];
		goverlay.getPath().forEach(function(latlng,i){
			points.push(new OpenLayers.Geometry.Point(latlng.lng(), latlng.lat()));
		});
		geometry=new OpenLayers.Geometry.LineString(points);
	}
	
	//polygon
	if (goverlay instanceof google.maps.Polygon) {
		var rings=[];
		var points=[];
		goverlay.getPaths().forEach(function(path, i){
			points=[];
			path.forEach(function(latlng,j){
				points.push(new OpenLayers.Geometry.Point(latlng.lng(), latlng.lat()));
			});
			rings.push(new OpenLayers.Geometry.LinearRing(points));
		});
		geometry=new OpenLayers.Geometry.Polygon(rings);
	}
	
	//return
	if(geometry){
		return geometry;
	}else{
		console.log("[ERROR]makoci.util.converter.GOverlayToOLGeometry:converter error");
		return;
	}
}





/**
 * 將key-value的array中的值，轉換成html語法
 * @param {Array} key_value_array
 */
kiein.util.getDescriptionHtml=function(key_value_array){
			var description = "<div style='overflow:hidden; font-size:75%'><ul style='list-style:none;padding:0px; margin:0px;'>";
			var i=1;
			for (key in key_value_array) {
				//even
				if(i % 2 ==0){
					description += "<li style='padding:0px; margin:0px; padding-bottom:10px; padding-top:10px; background-color:#eeeeee;'><b>" + key + "</b>: " + key_value_array[key] + "<br></li>";
				}else{
					description += "<li style='padding:0px; margin:0px; padding-bottom:10px; padding-top:10px; background-color:#ffffff;'><b>" + key + "</b>: " + key_value_array[key] + "<br></li>";
				}
				i++;
			}
			description += "</ul></div>";		
			return description;
}

 





