

if(!window.makoci){
	window.makoci=function(){};
}


/**
* @namespace 
* 常用的小工具 for google map2 api
*/
makoci.util=function(){};




/**
 * @class
 */
makoci.util.converter = {}
	
/**
 * 將ArcGIS FeatureSet物件轉換成GeoJSON格式
 * @param {FeatureSet} fset esri.arcgis.gmaps.FeatureSet()
 * @returns {Object} geoJSON 回傳GeoJSON格式
 */
makoci.util.converter.AGSFsetToGeoJSON=function(fset){
		var json={};
		json.type='FeatureCollection';
		json.features=[];
		
		//判斷fset的geometry
		var geometry='';
		var obj={};
		var coordinates=[];
		for(var i=0; i<fset.features.length; i++){
			obj.type='Feature';
			
			//處理geometry
			switch (fset.geometryType){
				case "esriGeometryPoint":
					geometry='Point';
					coordinates=[fset.features[i].geometry[0].getLatLng().lng(), fset.features[i].geometry[0].getLatLng().lat()];
				break;
				case "esriGeometryMultipoint":
					geometry='MultiPoint';
					for(var j=0; j<fset.features[i].geometry.length;j++){
						var marker=fset.features[i].geometry[j];
						var array=[marker.getLatLng.lng(), marker.getLatLng.lat()];
						coordinates.push(array);
					}
				break;
				case "esriGeometryPolyline":
					geometry='MultiLineString';
					for(var j=0; j<fset.features[i].geometry.length;j++){
						var polyline=fset.features[i].geometry[j];
						var array=[];
						for(var k=0;k<polyline.getVertexCount();k++){
							var array_xy=[polyline.getVertex(k).lng(), polyline.getVertex(k).lat()];
							array.push(array_xy);
						}
						coordinates.push(array);
					}
				break;
				case "esriGeometryPolygon":
					geometry='MultiPolygon';
					for(var j=0; j<fset.features[i].geometry.length;j++){
						var polygon=fset.features[i].geometry[j];
						var array_polygon=[];
						var array=[];
						for(var k=0;k<polygon.getVertexCount();k++){
							var array_xy=[polygon.getVertex(k).lng(), polygon.getVertex(k).lat()];
							array.push(array_xy);
						}
						array_polygon.push(array);
						coordinates.push(array_polygon);
					}
				break;
			}
			obj.geometry={type:geometry, coordinates: coordinates};
			
			//處理properties
			obj.properties=fset.features[i].attributes;
		
			json.features.push(obj);
		}
		return json;
}
	
	
	
/**	 
* 將google.maps.Marker, google.maps.Polyline, google.maps.Polygon轉換成GeoJSON格式
* @param {GOverlay} overlay 目前只限於Google Map 2 API中的google.maps.Marker, google.maps.Polyline, google.maps.Polygon
* @returns {Object} geoJSON 回傳GeoJSON格式
*/
makoci.util.converter.GOverlayToGeoJSON=function(overlay){
		//判斷overlay的type
		if(overlay instanceof google.maps.Marker || overlay instanceof google.maps.Polyline || overlay instanceof google.maps.Polygon){
			var obj={
				type:'FeatureCollection',
				features:[]
			};
			
			var feature={
				type:"Feature",
				properties:{},
				geometry:{type:"", coordinates:[]}
			};
				
			//google.maps.Marker
			if(overlay instanceof google.maps.Marker){
				feature.geometry.type="Point";
				feature.geometry.coordinates[0]=overlay.getPosition().lng();
				feature.geometry.coordinates[1]=overlay.getPosition().lat();
			}
			
			//google.maps.Polyline
			if(overlay instanceof google.maps.Polyline){
				feature.geometry.type="LineString";
				overlay.getPath().forEach(function(latlng, i){
					feature.geometry.coordinates.push([latlng.lng(), latlng.lat()]);
				});
			}
			
			//google.maps.Polygon
			if(overlay instanceof google.maps.Polygon){
				feature.geometry.type="Polygon";
				var polygon=[];
				overlay.getPaths().forEach(function(path, i){
					path.forEach(function(latlng,j){
						polygon.push([latlng.lng(), latlng.lat()]);
					});
				});
				feature.geometry.coordinates.push(polygon);
			}
			obj.features.push(feature);
			return obj;
		}else{
			console.log('[ERROR] overlay不屬於google.maps.Marker, google.maps.Polyline, google.maps.Polygon,無法執行GOverlayToGeoJSON');
			return;
		}
}
	
	
	
/**
 * 
 * @param {Object} geojson
 * @param {Object} options. 包含.synDomID 需要同步Goverlay的DOM ID，其中必須包括{i}，由0開始，依序遞增的數字，代表對應到不同的DOM ID; 
 * 							   .fieldName 給定GOverlay tips的欄位名稱
 * 							   .markerOptions 給訂marker的options
 * 							   .polylineOptions 給訂polyline的options
 * 							   .polygonOptions 給訂polygon的options
 * @return (object) GOverlays[]
 */
makoci.util.converter.GeoJsonToMakociFSet=function(geojson, options){
		var features=geojson.features;
		var array_feature=[];
		var agsFset=null;
		var _geometry='';
		var bbox_xmin=0, bbox_ymin=0, bbox_xmax=0, bbox_ymax=0;
		var syn_domID, field_name, 
			markerOptions={icon:null, iconHover:new google.maps.MarkerImage('http://gmaps-samples.googlecode.com/svn/trunk/markers/green/marker1.png',null, null, null, new google.maps.Size(20,34))}, 
			polylineOptions={strokeColor:"#0000ff", strokeOpacity:0.3, strokeWeight:3, strokeColorHover:"#ff0000", strokeOpacityHover:0.3, strokeWeightHover:3}, 
			polygonOptions={fillColor:"#0000ff", fillOpacity:0.3, strokeColor:"#0000ff", strokeOpacity:0.7, strokeWeight:3, fillColorHover:"#ff0000", fillOpacityHover:0.3, strokeColorHover:"#ff0000", strokeOpacityHover:0.7, strokeWeightHover:3};
		
		//假如有包括esri的lib的話
		if(typeof(esri)!='undefined'){
			agsFset=new esri.arcgis.gmaps.FeatureSet();
			agsFset.features=[];
		}
		
		if(options){
			if(options.synDomID){syn_domID=options.synDomID};
			if(options.fieldName){field_name=options.fieldName};
			if(options.markerOptions){markerOptions=options.markerOptions};
			if(options.polylineOptions){polylineOptions=options.polylineOptions};
			if(options.polygonOptions){polygonOptions=options.polygonOptions};
		}
		
		//處理syn_domID
		if(syn_domID){
			syn_domID=syn_domID.split('{i}')[0];
		}
		
		//attributeTable Html
		var attributeTableHtml="<table><tr style='background-color:#eeeeee'>";
		$.each(features[0].properties, function(key, value){
			//attribute name
			attributeTableHtml+="<td>" + key + "</td>";
		});
		attributeTableHtml+="</tr>"
		
		//讀取geojson中每個feature
		$.each(features, function(i, feature){
			//create feature object
			var f = new makoci.Feature();
			f.properties = feature.properties;
			f.name = feature.properties[field_name];
			f.id = i;
			f.description=makoci.util.getDescriptionHtml(feature.properties);
			f.gOverlays=[];
			f.gLatLngs=[];
			
			//parse geometry
			var obj=parseGeometry(feature.geometry, f.name, f.description, {domID:syn_domID, num:i}, {markerOptions:markerOptions, polylineOptions:polylineOptions, polygonOptions: polygonOptions});
			f.bbox = {xmin: obj.bbox_xmin, ymin: obj.bbox_ymin, xmax: obj.bbox_xmax, ymax: obj.bbox_ymax};
			f.bbox_key = obj.bbox_xmin + 'x' + obj.bbox_ymin + 'x' + obj.bbox_xmax + 'x' + obj.bbox_ymax;
			f.center_gLatLng = new google.maps.LatLng(obj.center_y, obj.center_x);	
			f.geometry=obj.geometry;
			_geometry=obj.geometry;
			f.gOverlays=obj.gOverlays;
			
			//ags feature
			f.agsFeature=new makoci.agsFeature();
			f.agsFeature.attributes=f.properties;
			if(obj.geometry=='POINT' && obj.gOverlays.length==1){
				f.agsFeature.geometry=obj.gOverlays[0]
			}else{
				f.agsFeature.geometry=obj.gOverlays;
			}
			if(agsFset){
				agsFset.features.push(f.agsFeature);
			}
			
			array_feature.push(f);	
			
			//featureset的bbox
			if(i==0){
				bbox_xmin = obj.bbox_xmin;
				bbox_ymin = obj.bbox_ymin;
				bbox_xmax = obj.bbox_xmax;
				bbox_ymax = obj.bbox_ymax;
			}
			bbox_xmin = Math.min(bbox_xmin, obj.bbox_xmin);
			bbox_ymin = Math.min(bbox_ymin, obj.bbox_ymin);
			bbox_xmax = Math.max(bbox_xmax, obj.bbox_xmax);
			bbox_ymax = Math.max(bbox_ymax, obj.bbox_ymax);
			
			//getAttributeTableHtml
			attributeTableHtml+="<tr id='" + syn_domID + i + "'>";
			$.each(feature.properties, function(key, value){
				attributeTableHtml+="<td>" + value + "</td>";
			});
			attributeTableHtml+="</tr>";
		});
		
		attributeTableHtml+="</table>";
		
		return (function(){
			//組合成makoci的featureset
			var mfset=new makoci.FeatureSet();
			mfset.features=array_feature;
			mfset.geometry=_geometry.toUpperCase();
			mfset.gLatLngBounds=new google.maps.LatLngBounds(new google.maps.LatLng(bbox_ymin, bbox_xmin), new google.maps.LatLng(bbox_ymax, bbox_xmax));
			mfset.center_gLatLng=new google.maps.LatLng((bbox_ymin + bbox_ymax) / 2, (bbox_xmin + bbox_xmax) / 2);
			mfset.attributeTableHtml=attributeTableHtml;
			mfset.bbox={xmin:bbox_xmin, ymin:bbox_ymin, xmax:bbox_xmax, ymax:bbox_ymax};
			if(agsFset){
				switch(mfset.geometry){
					case "POINT":
						agsFset.geometryType='esriGeometryPoint';
					break;
//					case "MULTIPOINT":
//						fset.geometryType='esriGeometryMultipoint';
//					break;
					case "POLYLINE":
						agsFset.geometryType='esriGeometryPolyline';
					break;
					case "POLYGON":
						agsFset.geometryType='esriGeometryPolygon';
					break;
				}
				mfset.agsFeatureSet=agsFset;
			}
			
			return mfset;
		})();
		
		
		
		/**
		 * 判斷geojson中的geometry，制作對應的gOverlay
		 * @param {Object} geojson_geometry geojson中每個feature的geometry物件
		 * @param {String} name 當geometry是point or multipoint的時候，這個name會給予google.maps.Marker的title
		 * @param {String} description 制作gOverlay時的info window html
		 * @param {Object} synOptions 同步gOverlay的屬性，包括： .domID: 同步的dom id, 以及num: i
		 * @param {Object} styleOptions 包括.markerOptions, polylineOptions, polygonOptions
		 * @return {Object} Object 包含.goverlays: GOverlay[], .bbox_xmin, .bbox_ymin, .bbox_xmax, .bbox_ymax, .geometry: 此Overlays的geometry字串（POINT, POLYLINE, POLYGON, GEOMETRYCOLLECTION）
		 */
		function parseGeometry(geojson_geometry, name, description, synOptions, styleOptions){
			var bbox_xmin = 0, bbox_ymin = 0, bbox_xmax = 0, bbox_ymax = 0,
				center_x=0, center_y=0, center_index=0,
				geometry=geojson_geometry.type,
				coordinates,
				_geometry="",
				gOverlays=[];
		
		
			if(geojson_geometry.coordinates){
				coordinates=geojson_geometry.coordinates;
			}
				
			//判斷geometry為哪一種
			//POINT
			if (geometry.toUpperCase() == 'POINT') {
				_geometry='POINT';
				
				//markerOptions
				styleOptions.markerOptions.title=name;
				
				//get points	
				var point = coordinates;
				var latlng = new google.maps.LatLng(point[1], point[0]);
				var marker=makoci.util.createMarker(latlng,description, styleOptions.markerOptions, synOptions);
				latlng.name = name;
				
				//bbox
				bbox_xmin = parseFloat(point[0]);
				bbox_ymin = parseFloat(point[1]);
				bbox_xmax = parseFloat(point[0]);
				bbox_ymax = parseFloat(point[1]);
				center_x = parseFloat(point[0]);
				center_y = parseFloat(point[1]);
				
				//goverlay
				gOverlays.push(marker);
			}
			
			
			//Multi point
			if (geometry.toUpperCase() == 'MULTIPOINT') {
				_geometry='POINT';
				
				//取中點的位置
				center_index=getCenterIndex(coordinates.length);
				
				//markerOptions
				styleOptions.markerOptions.title=name;
				
				//get points	
				for (var j = 0; j < coordinates.length; j++) {
					var point = coordinates[j];
								
					//bbox
					if (j == 0) {
						bbox_xmin = parseFloat(point[0]);
						bbox_ymin = parseFloat(point[1]);
						bbox_xmax = parseFloat(point[0]);
						bbox_ymax = parseFloat(point[1]);
					}
					bbox_xmin = Math.min(bbox_xmin, parseFloat(point[0]));
					bbox_ymin = Math.min(bbox_ymin, parseFloat(point[1]));
					bbox_xmax = Math.max(bbox_xmax, parseFloat(point[0]));
					bbox_ymax = Math.max(bbox_ymax, parseFloat(point[1]));
					
					//center
					if(j==center_index){
						center_x=parseFloat(point[0]);
						center_y=parseFloat(point[1]);
					}
					
					var latlng = new google.maps.LatLng(point[1], point[0]);
					latlng.name = name;

					gOverlays.push(makoci.util.createMarker(latlng,description, styleOptions.markerOptions, synOptions));
				}
			}
			
			
			//LINESTRING
			if (geometry.toUpperCase() == 'LINESTRING') {
				_geometry='POLYLINE';
				
				//取中點的index
				center_index=getCenterIndex(coordinates.length);
				
				//get points
				var array_latlngs=[];
				for (var j = 0; j < coordinates.length; j++) {
					var line = coordinates[j];
					
					//bbox
					if (j == 0) {
						bbox_xmin = parseFloat(line[0]);
						bbox_ymin = parseFloat(line[1]);
						bbox_xmax = parseFloat(line[0]);
						bbox_ymax = parseFloat(line[1]);
					}
					bbox_xmin = Math.min(bbox_xmin, parseFloat(line[0]));
					bbox_ymin = Math.min(bbox_ymin, parseFloat(line[1]));
					bbox_xmax = Math.max(bbox_xmax, parseFloat(line[0]));
					bbox_ymax = Math.max(bbox_ymax, parseFloat(line[1]));
					
					//中點
					if(j==center_index){
						center_x=parseFloat(line[0]);
						center_y=parseFloat(line[1]);
					}
					
					var latlng = new google.maps.LatLng(line[1], line[0]);
					array_latlngs.push(latlng);
				}
				
				//create google.maps.Polyline
				gOverlays.push(makoci.util.createPolyline(array_latlngs, description, styleOptions.polylineOptions, synOptions));
			}
			
			
			//MULTILINESTRING
			if (geometry.toUpperCase() == 'MULTILINESTRING') {
				_geometry='POLYLINE';
				
				//取中點的index
				center_index=getCenterIndex(coordinates.length);
				
				for (var j = 0; j < coordinates.length; j++) {
					var lines = coordinates[j];
					var array_latlngs=[];					
					for (var k = 0; k < lines.length; k++) {
						var line = lines[k];
						
						//bbox
						if (k == 0) {
							bbox_xmin = parseFloat(line[0]);
							bbox_ymin = parseFloat(line[1]);
							bbox_xmax = parseFloat(line[0]);
							bbox_ymax = parseFloat(line[1]);
						}
						bbox_xmin = Math.min(bbox_xmin, parseFloat(line[0]));
						bbox_ymin = Math.min(bbox_ymin, parseFloat(line[1]));
						bbox_xmax = Math.max(bbox_xmax, parseFloat(line[0]));
						bbox_ymax = Math.max(bbox_ymax, parseFloat(line[1]));
						
						var latlng = new google.maps.LatLng(line[1], line[0]);
						array_latlngs.push(latlng);
					}
					
					//中點
					if(j==center_index){
						var center_point_index=getCenterIndex(lines.length);
						center_x=parseFloat(lines[center_point_index][0]);
						center_y=parseFloat(lines[center_point_index][1]);
					}

					//goverlay
					gOverlays.push(makoci.util.createPolyline(array_latlngs, description, styleOptions.polylineOptions,synOptions));
				}
			}
			
			
			//POLYGON
			if (geometry.toUpperCase() == 'POLYGON') {		
				_geometry='POLYGON';
					
				//get rings	
				for (var j = 0; j < coordinates.length; j++) {
					var rings = coordinates[j];
					
					var array_latlngs=[];	
					for (var k = 0; k < rings.length; k++) {
						var cm_latlng = rings[k];
						
						//bbox
						if (k == 0) {
							bbox_xmin = parseFloat(cm_latlng[0]);
							bbox_ymin = parseFloat(cm_latlng[1]);
							bbox_xmax = parseFloat(cm_latlng[0]);
							bbox_ymax = parseFloat(cm_latlng[1]);
						}
						bbox_xmin = Math.min(bbox_xmin, parseFloat(cm_latlng[0]));
						bbox_ymin = Math.min(bbox_ymin, parseFloat(cm_latlng[1]));
						bbox_xmax = Math.max(bbox_xmax, parseFloat(cm_latlng[0]));
						bbox_ymax = Math.max(bbox_ymax, parseFloat(cm_latlng[1]));
						
						var latlng = new google.maps.LatLng(cm_latlng[1], cm_latlng[0]);
						array_latlngs.push(latlng);
					}
					//goverlay
					gOverlays.push(makoci.util.createPolygon(array_latlngs, description, styleOptions.polygonOptions, synOptions));
				}
				
				//中點
				center_x=(bbox_xmin + bbox_xmax)/2;
				center_y=(bbox_ymin + bbox_ymax)/2;
			}
			
			
			//MULTIPOLYGON
			if (geometry.toUpperCase() == 'MULTIPOLYGON') {
				_geometry='POLYGON';
				
				//get polygons
				for (var j = 0; j < coordinates.length; j++) {
					var polygons = coordinates[j];
					
					for (var k = 0; k < polygons.length; k++) {
						var rings = polygons[k];
						
						var array_latlngs=[];
						for (var z = 0; z < rings.length; z++) {
							var cm_latlng = rings[z];
							
							//bbox
							if (z == 0) {
								bbox_xmin = parseFloat(cm_latlng[0]);
								bbox_ymin = parseFloat(cm_latlng[1]);
								bbox_xmax = parseFloat(cm_latlng[0]);
								bbox_ymax = parseFloat(cm_latlng[1]);
							}
							bbox_xmin = Math.min(bbox_xmin, parseFloat(cm_latlng[0]));
							bbox_ymin = Math.min(bbox_ymin, parseFloat(cm_latlng[1]));
							bbox_xmax = Math.max(bbox_xmax, parseFloat(cm_latlng[0]));
							bbox_ymax = Math.max(bbox_ymax, parseFloat(cm_latlng[1]));
							
							var latlng = new google.maps.LatLng(cm_latlng[1], cm_latlng[0]);
							array_latlngs.push(latlng);
						}
						//goverlay
						gOverlays.push(makoci.util.createPolygon(array_latlngs, description, styleOptions.polygonOptions, synOptions));
					}
				}
				
				//中點
				center_x=(bbox_xmin + bbox_xmax)/2;
				center_y=(bbox_ymin + bbox_ymax)/2;
			}
			
			
			//geometryCollection
			if (geometry.toUpperCase() == 'GEOMETRYCOLLECTION') {
				_geometry='GEOMETRYCOLLECTION';
				
				$.each(geojson_geometry.geometries, function(j, geom){
					var obj=parseGeometry(geom, name, description, synOptions, {markerIcon:markerIcon, markerIconHover:markerIconHover});
					
					if(j==0){
						bbox_xmin=obj.bbox_xmin;
						bbox_ymin=obj.bbox_ymin;
						bbox_xmax=obj.bbox_xmax;
						bbox_ymax=obj.bbox_ymax;
					}
					bbox_xmin = Math.min(bbox_xmin, obj.bbox_xmin);
					bbox_ymin = Math.min(bbox_ymin, obj.bbox_ymin);
					bbox_xmax = Math.max(bbox_xmax, obj.bbox_xmax);
					bbox_ymax = Math.max(bbox_ymax, obj.bbox_ymax);
					
					$.merge(gOverlays, obj.gOverlays);
				});
			}
			
			
			
			return {gOverlays:gOverlays, bbox_xmin:bbox_xmin, bbox_ymin: bbox_ymin, bbox_xmax: bbox_xmax, bbox_ymax:bbox_ymax, geometry:_geometry, center_x:center_x, center_y:center_y};
		
		
		
			/**
			 * 
			 * @param {Number} length
			 */
			function getCenterIndex(length){
				//判斷長度的是奇偶數
				if(length%2==0){
					return (length/2);
				}else{
					return (length-1)/2;
				}
			}
		
		}
		
		
		
		/**
		 * 
		 * @param {Object} properties
		 */
		function getDescription(properties){
			var description = "<div style='max-height:250px; max-width:400px; overflow:auto; font-size:75%'><ul style='list-style:none;padding:0px; margin:0px;'>";
			var i=1;
			for (key in properties) {
				//even
				if(i % 2 ==0){
					description += "<li style='padding:0px; margin:0px; padding-bottom:10px; padding-top:10px; background-color:#eeeeee;'><b>" + key + "</b>: " + properties[key] + "<br></li>";
				}else{
					description += "<li style='padding:0px; margin:0px; padding-bottom:10px; padding-top:10px; background-color:#ffffff;'><b>" + key + "</b>: " + properties[key] + "<br></li>";
				}
				i++;
			}
			description += "</ul></div>";		
			return description;
		}
}



/**
	 * 將ArcGIS的FeatureSet轉換成Makoci的FeatureSet
	 * @param {Object} fset
	 * @param {Object} options. 包含.synDomID 需要同步Goverlay的DOM ID，其中必須包括{i}，由0開始，依序遞增的數字，代表對應到不同的DOM ID; 
	 * 							   .fieldName 給定GOverlay tips的欄位名稱
	 * 							   .markerOptions, 並且新增iconHover:滑鼠移動marker的變化icon
	 * 							   .polylineOptions, 並且新增strokeColorHover:滑鼠移動polyline的變化color, strokeOpacityHover滑鼠移動polyline變化透明度, strokeWeightHover滑鼠移動變化polyline的寬度
	 * 							   .polygonOptions, 並且新增fillColorHover:滑鼠移動polygon變化fillColor, fillOpacityHover:滑鼠移動polygon變化透明度, strokeColorHover:滑鼠移動polygon的變化線條color, strokeOpacityHover:滑鼠移動polygon變化透明度, strokeWeightHover:滑鼠移動變化polygon的寬度
	 * @return (object) MakociFeatureSet
	 */
makoci.util.converter.agsFSetToMakociFSet=function(fset, options){
		var features=fset.features;
		var geometryType=fset.geometryType;
		var array_feature=[];
		var _geometry='';
		var bbox_xmin=0, bbox_ymin=0, bbox_xmax=0, bbox_ymax=0;
		var syn_domID, field_name;
		var markerOptions={icon:null, iconHover:new google.maps.MarkerImage('http://gmaps-samples.googlecode.com/svn/trunk/markers/green/marker1.png',null, null, null, new google.maps.Size(20,34))}, 
			polylineOptions={strokeColor:"#0000ff", strokeOpacity:0.3, strokeWeight:3, strokeColorHover:"#ff0000", strokeOpacityHover:0.3, strokeWeightHover:3}, 
			polygonOptions={fillColor:"#0000ff", fillOpacity:0.3, strokeColor:"#0000ff", strokeOpacity:0.7, strokeWeight:3, fillColorHover:"#ff0000", fillOpacityHover:0.3, strokeColorHover:"#ff0000", strokeOpacityHover:0.7, strokeWeightHover:3};
				
		if(options){
			if(options.synDomID){syn_domID=options.synDomID};
			if(options.fieldName){field_name=options.fieldName};
			if(options.markerOptions){markerOptions=options.markerOptions};
			if(options.polylineOptions){polylineOptions=options.polylineOptions};
			if(options.polygonOptions){polygonOptions=options.polygonOptions};
		}
		
				
		//處理syn_domID
		if(syn_domID){
			//console.log(syn_domID);
			syn_domID=syn_domID.split('{i}')[0];
		}
		
		//attributeTable Html
		if(features[0]){
			var attributeTableHtml="<table><tr style='background-color:#eeeeee'>";
			$.each(features[0].attributes, function(key, value){
				//attribute name
				attributeTableHtml+="<td>" + key + "</td>";
			});
			attributeTableHtml+="</tr>"
		}else{
			console.log('[ERROR]makoci.util.converter.agsFSetToMakociFset: features.length==0')
			return null;
		}
		
		
		
		//讀取geojson中每個feature
		$.each(features, function(i, feature){
			//create feature object
			var f = new makoci.Feature();
			//f.geometry = geometry;
			f.properties = feature.attributes;
			f.name = feature.attributes[field_name];
			f.id = i;
			f.description=makoci.util.getDescriptionHtml(feature.attributes);
			f.gOverlays=[];
			//f.gLatLngs=[];
			f.geometry="";
			
			//parse geometry
			var obj=parseGeometry(feature.geometry, geometryType, f.name, f.description, {domID:syn_domID, num:i}, {markerOptions:markerOptions, polylineOptions:polylineOptions, polygonOptions: polygonOptions});
			f.bbox = {xmin:obj.bbox_xmin, ymin:obj.bbox_ymin, xmax:obj.bbox_xmax, ymax:obj.bbox_ymax};
			f.bbox_key = obj.bbox_xmin + 'x' + obj.bbox_ymin + 'x' + obj.bbox_xmax + 'x' + obj.bbox_ymax;
			f.center_gLatLng = new google.maps.LatLng(obj.center_y, obj.center_x);	
			f.geometry=obj.geometry;
			_geometry=obj.geometry;
			f.gOverlays=obj.gOverlays;
			array_feature.push(f);	
			
			//featureset的bbox
			if(i==0){
				bbox_xmin = obj.bbox_xmin;
				bbox_ymin = obj.bbox_ymin;
				bbox_xmax = obj.bbox_xmax;
				bbox_ymax = obj.bbox_ymax;
			}
			bbox_xmin = Math.min(bbox_xmin, obj.bbox_xmin);
			bbox_ymin = Math.min(bbox_ymin, obj.bbox_ymin);
			bbox_xmax = Math.max(bbox_xmax, obj.bbox_xmax);
			bbox_ymax = Math.max(bbox_ymax, obj.bbox_ymax);
			
			//getAttributeTableHtml
			attributeTableHtml+="<tr id='" + syn_domID + i + "'>";
			$.each(feature.attributes, function(key, value){
				attributeTableHtml+="<td>" + value + "</td>";
			});
			attributeTableHtml+="</tr>";
		});
		
		attributeTableHtml+="</table>";
		
		return (function(){
				var mfset=new makoci.FeatureSet();
				mfset.agsFeatureSet=fset;
				mfset.features=array_feature;
				mfset.geometry=_geometry;
				mfset.gLatLngBounds=new google.maps.LatLngBounds(new google.maps.LatLng(bbox_ymin, bbox_xmin), new google.maps.LatLng(bbox_ymax, bbox_xmax));
				mfset.center_gLatLng=new google.maps.LatLng((bbox_ymin + bbox_ymax) / 2, (bbox_xmin + bbox_xmax) / 2);
				mfset.attributeTableHtml=attributeTableHtml;
				mfset.bbox={xmin:bbox_xmin, ymin:bbox_ymin, xmax:bbox_xmax, ymax:bbox_ymax};
				return mfset;
		})()

		
		
		
		/**
		 * 判斷arcgis featureset中的geometry，制作對應的gOverlay
		 * @param {Array} agsFset_geometries agsFSet中每個feature的geometries矩陣
		 * @param {String} geometry Type 包括："esriGeometryPoint", "esriGeometryMultipoint", "esriGeometryPolyline", "esriGeometryPolygon". 
		 * @param {String} name 當geometry是point or multipoint的時候，這個name會給予GMarker的title
		 * @param {String} description 制作gOverlay時的info window html
		 * @param {Object} synOptions 同步gOverlay的屬性，包括： .domID: 同步的dom id, 以及num: i
		 * @return {Object} Object 包含.goverlays: GOverlay[], .bbox_xmin, .bbox_ymin, .bbox_xmax, .bbox_ymax, .geometry: 此Overlays的geometry字串（POINT, POLYLINE, POLYGON, GEOMETRYCOLLECTION）
		 */
		function parseGeometry(agsFset_geometries, geometryType, name, description, synOptions, styleOptions){
			var bbox_xmin = 0, bbox_ymin = 0, bbox_xmax = 0, bbox_ymax = 0, bbox={},
				center_x=0, center_y=0, center_index=0,center_latlmg,
				coordinates,
				geometry='',
				gOverlays=[];
		
			
			//判斷geometry為哪一種
			//POINT
			if (geometryType == 'esriGeometryPoint') {	
					geometry='POINT';
					
					if(agsFset_geometries instanceof google.maps.Marker){
						//get point建立marker
						var latlng = agsFset_geometries.getPosition();
						styleOptions.markerOptions.title=name;
						var marker=makoci.util.createMarker(latlng, description, markerOptions, synOptions);
						latlng.name = name;
						
						//bbox
						bbox={
							xmin:parseFloat(latlng.lng()),
							ymin:parseFloat(latlng.lat()),
							xmax:parseFloat(latlng.lng()),
							ymax:parseFloat(latlng.lat())
						}
						
						bbox_xmin=bbox.xmin;bbox_ymin=bbox.ymin;bbox_xmax=bbox.xmax;bbox_ymax=bbox.ymax;
	
						//goverlay
						gOverlays.push(marker);
					}	
			}else{
				$.each(agsFset_geometries, function(j, goverlay){
				
					//Multi point
					if (geometryType == 'esriGeometryMultipoint') {
						geometry='POINT';
						
						//get points
						if(goverlay instanceof google.maps.Marker){
							//get point建立marker
							var latlng = goverlay.getPosition();
							styleOptions.makerOptions.title=name
							var marker=makoci.util.createMarker(latlng, description, markerOptions, synOptions);
							latlng.name = name;
							
							//bbox
							bbox={
								xmin:parseFloat(latlng.lng()),
								ymin:parseFloat(latlng.lat()),
								xmax:bbox.xmin,
								ymax:bbox.ymin
							}
							
							//goverlay
							gOverlays.push(marker);
						}	
					}
					
					
					//polyline
					if (geometryType == 'esriGeometryPolyline'){
						//get gpolyline
						if (goverlay instanceof google.maps.Polyline) {
	
							//bbox
							bbox=goverlay.ext_getBounds().bbox;
							
							//制作polyline
							geometry = 'POLYLINE';
						
							gOverlays.push(makoci.util.createPolyline(goverlay.ext_getLatLngs(), description, polylineOptions, synOptions));
						}
					} 
					
					
					//polygon
					if (geometryType == 'esriGeometryPolygon') {					
						//get gpolygon
						if(goverlay instanceof google.maps.Polygon){
							bbox=goverlay.ext_getBounds().bbox
							
							//制作polygon
							geometry='POLYGON';
													
							gOverlays.push(makoci.util.createPolygon(goverlay.ext_getLatLngs(), description, polygonOptions, synOptions));
						}
					}
					
					//bbox
					if (j == 0) {
						bbox_xmin = parseFloat(bbox.xmin);
						bbox_ymin = parseFloat(bbox.ymin);
						bbox_xmax = parseFloat(bbox.xmax);
						bbox_ymax = parseFloat(bbox.ymax);
					}
								
					bbox_xmin = Math.min(bbox_xmin, parseFloat(bbox.xmin));
					bbox_ymin = Math.min(bbox_ymin, parseFloat(bbox.ymin));
					bbox_xmax = Math.max(bbox_xmax, parseFloat(bbox.xmax));
					bbox_ymax = Math.max(bbox_ymax, parseFloat(bbox.ymax));
				});
			}
			
			
			//取中點
			if(agsFset_geometries instanceof Array){
				center_index=getCenterIndex(agsFset_geometries.length);
				if(geometry=='POLYLINE' || geometry=="POLYGON"){
					center_latlng=agsFset_geometries[center_index].ext_bounds.center_latlng;
				}else{
					center_latlng=agsFset_geometries[center_index].getPosition();
				}
			}else{
				//由於point的話agsFset_geometries是一個marker, 不能用上面的方式取中點，直接抓此marker的position做為中點
				center_latlng=agsFset_geometries.getPosition();
			}
			

			
			return {gOverlays:gOverlays, bbox_xmin:bbox_xmin, bbox_ymin: bbox_ymin, bbox_xmax: bbox_xmax, bbox_ymax:bbox_ymax, geometry:geometry, center_x:center_latlng.lng(), center_y:center_latlng.lat()};
		

			/**
			 * 
			 * @param {Number} length
			 */
			function getCenterIndex(length){
				//判斷長度的是奇偶數
				if(length%2==0){
					return (length/2);
				}else{
					return (length-1)/2;
				}
			}
		
		}//end parseGeometry
		
}//end AGSFsetToMakociFSet



/**
 * 將agsGeometry的json轉換成GOverlay, 包括：google.maps.Marker, google.maps.Polyline, google.maps.Polygon
 * @param {String} geometryType geometry的type，包括："esriGeoemtryPoint","esriGeoemtryMultipoint","esriGeoemtryPolyline", "esriGeoemtryPolygon"
 * @param {Object} geometryJSON ags json中的geometry部分
 */
makoci.util.converter.agsGeometryJsonToGOverlays=function(geometryType, geometryJSON){
	var goverlays=[];
	
	switch(geometryType){
		case "esriGeometryPoint":
			goverlays=new google.maps.Marker({position: new google.maps.LatLng(geometryJSON.y, geometryJSON.x)});
		break;
		case "esriGeometryMultipoint":
			$.each(geometryJSON.points, function(i,point){
				goverlays.push(new google.maps.Marker({position: new google.maps.LatLng(point.y, point.x)}));
			});
		break;
		case "esriGeometryPolyline":
			var path=[];
			$.each(geometryJSON.paths, function(i,agsPath){
				path=[];
				$.each(agsPath, function(j,point){
					path.push(new google.maps.LatLng(point[1], point[0]));
				})
				var polyline=makoci.util.createPolyline(path);
				goverlays.push(polyline);
			});
		break;
		case "esriGeometryPolygon":
			var ring=[];
			$.each(geometryJSON.rings, function(i,agsRing){
				ring=[];
				$.each(agsRing, function(j,point){
					ring.push(new google.maps.LatLng(point[1], point[0]));
				});
				var polygon=makoci.util.createPolygon(ring);
				goverlays.push(polygon);
			});
		break;
	}
	
	return goverlays;
}



/**
 * 將openlayer的geometry(譬如point, linestring, polygon)轉換成Goverlay
 * 但是，請先將geometry透過transform方法，轉換成經緯度座標！
 * @param {Object} geometry 輸入openlayer的geometry
 * @return {GOverlay} 依據給予的geometry type傳回對應的GOverlay包括，GMarker, GPolyline, and GPolygon
 */
makoci.util.converter.OLGeometryToGOverlay=function(geometry){
		//判斷有沒有OpenLayers
		if(!OpenLayers){
			console.log("[ERROR]makoci.util.converter.openlayerGeometryToGOverlay: 未引用openlayers.js");
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
makoci.util.converter.GOverlayToOLGeometry=function(goverlay){
	if(!OpenLayers){
		console.log("[ERROR]makoci.util.converter.GOverlayToOLGeometry: 未引用openlayers.js");
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
* 同步呼叫對應id建立好的GOverlay
* @param {Object} MakociFeature makoci定義的feature
* @param {String} evtType 目前支援mouseover, mouseout, click
* @param {Object} styleOptions 包括.icon, .iconHover, .strokeColor, .strokeColorHover, .strokeOpacity, .strokeOpacityHover, .strokeWeight, .strokeWeightHover, .fillColor, .fillColorHover, .fillOpacity, .fillOpacityHover
*/
makoci.util.triggerGOverlay=function(MakociFeature, evtType, styleOptions){				
	//trigger goverlay的event
	$.each(MakociFeature.gOverlays, function(i, goverlay){
		//trigger已經寫入每個goverlay的event, 並傳入中心點
		google.maps.event.trigger(goverlay, evtType, {latLng: MakociFeature.center_gLatLng});
		if(styleOptions){
			goverlay.setOptions(styleOptions);
		}
	});
}




/**
 * 使用者可自行在map上新增feature
 * @param {Object} paramName
 * @param {String} drawType 包括MARKER, POLYLINE, POLYGON, CIRCLE, RECTANGLE共五種，請參考：https://developers.google.com/maps/documentation/javascript/reference#OverlayType
 * @param {Object} callback(MakociFeature) 回傳MakociFeature物件
 * @param {Object} styleOptions 可指定markerOptions, polylineOptions, polygonOptions, circleOptions, rectangleOptions
 */
makoci.util.drawFeature=function(paramName, drawType, callback, styleOptions){
	if(!drawType){
		console.log('[ERROR]未指定drawType, 請重新設定');
		return;
	}
	
	//設定drawType以及styleOptions
	var style={};
	var agsGeometryType='';
	switch(drawType){
		case "MARKER":
			drawType=google.maps.drawing.OverlayType.MARKER;
			agsGeometryType='esriGeometryPoint';
			if(styleOptions){if(styleOptions.markerOptions){style=styleOptions.markerOptions;}}
			alert("請在地圖中點選一點，Please click a point on the map");
		break;
		case "POLYLINE":
			drawType=google.maps.drawing.OverlayType.POLYLINE;
			agsGeometryType='esriGeometryPolyine';
			if(styleOptions){if(styleOptions.polylineOptions){style=styleOptions.polylineOptions;}}
			alert("請在地圖中畫一線段，Please draw a polyline on the map");
		break;
		case "POLYGON":
			drawType=google.maps.drawing.OverlayType.POLYGON;
			agsGeometryType='esriGeometryPolygon';
			if(styleOptions){if(styleOptions.polygonOptions){style=styleOptions.polygonOptions;}}
			alert("請順時針的方向，畫一個多邊形的面。Please draw a polygon (clockwise) on the map");
		break;
		case "CIRCLE":
			drawType=google.maps.drawing.OverlayType.CIRCLE;
			agsGeometryType='esriGeometryPolygon';
			if(styleOptions){if(styleOptions.circleOptions){style=styleOptions.circleOptions;}}
			alert("請在地圖中畫一圓，Please draw a circle on the map");
		break;
		case "RECTANGLE":
			drawType=google.maps.drawing.OverlayType.RECTANGLE;
			agsGeometryType='esriGeometryPolygon';
			if(styleOptions){if(styleOptions.rectangleOptions){style=styleOptions.rectangleOptions;}}
			alert("請在地圖中畫一矩形，Please draw a rectangle on the map");
		break;
	}
	
	
	if(makoci.drawingManager){
		//設定使用者畫圖的類型
		makoci.drawingManager.setDrawingMode(drawType);
		
		//設定options
		if(style){makoci.drawingManager.setOptions(style);}
		
		//當使用者畫完圖形時
		google.maps.event.addListener(makoci.drawingManager, 'overlaycomplete', function(e) {
            //停止連續畫圖
			makoci.drawingManager.setDrawingMode(null);
        	
			//組成makoci feature
			var f=new makoci.Feature();
			f.name=paramName;
			f.gOverlays.push(e.overlay);
			f.geometryType=drawType;
			f.agsFeature=new makoci.agsFeature();
			f.agsFeatureSet=new makoci.agsFeatureSet();
			
			if(drawType==google.maps.drawing.OverlayType.MARKER){
				f.agsFeature.geometry=e.overlay;
			}else{
				f.agsFeature.geometry=[];
				f.agsFeature.geometry.push(e.overlay);
			}
			
			//ags featureset
			f.agsFeatureSet.features.push(f.agsFeature);
			f.agsFeatureSet.geometryType=agsGeometryType;
			
			
			//callback
			if(callback){
				callback(f);
			}
		});
	}else{
		console.log('[ERROR] google.drawing.drawingManager尚未初始化')
	}
}





/**
 * 新增google.maps.Marker物件
 * @param {Object} latlng (required) 
 * @param {String or GInfoWindowTab[]} description的html or GInfoWindowTab的array (required)
 * @param {google.maps.MarkerOptions} google.maps.MarkerOptions，除了官方的options之外，還包括.iconHover 指定marker hover時的icon 
 * @param {Object} synOptions, 包含.domID, num, tableHoverColor
 * @param {Object} eventOptions 包含: infoWindowOpen, infoWindowClose
 */
makoci.util.createMarker=function(latlng, description, markerOptions, synOptions, eventOptions) {
			//判斷是否有markerOptions
			if(!markerOptions){
				markerOptions={
					icon: null
				};
			}
			 
			//給訂markerOptions的iconHover
			if(!markerOptions.iconHover && markerOptions.icon==null){markerOptions.iconHover=new google.maps.MarkerImage('http://gmaps-samples.googlecode.com/svn/trunk/markers/green/marker1.png',null, null, null, new google.maps.Size(20,34));}

			//判斷是否有synOptions
			var syn_id, syn_num, isSyn=false, syn_tableHoverColor="#cccccc";
			if(synOptions){
				if(synOptions.domID) {syn_id = synOptions.domID;}
				if(synOptions.num != 'undefined') {syn_num = synOptions.num;}
				if(synOptions.tableHoverColor){syn_tableHoverColor=synOptions.tableHoverColor;}
				if(synOptions.num != 'undefined' && synOptions.domID){isSyn = true;}
			}
			
			
			//判斷是否有eventOptions
			var infowindowopen, infowindowclose;
			if(eventOptions){
				if(eventOptions.infoWindowOpen){infowindowopen=eventOptions.infoWindowOpen;}
				if(eventOptions.infoWindowClose){infowindowclose=eventOptions.infoWindowClose;}
			}
			
			
			//create Marker
			markerOptions.position=latlng;
			var marker = new google.maps.Marker(markerOptions);
			
			//Add Event
			google.maps.event.addListener(marker, "click", function(e) {
				//set hover icon to marker
				if(markerOptions.iconHover){
					marker.setIcon(markerOptions.iconHover);
				}
				
				if(description){
					//不管description是單純html或是tabs, google maps3的infoWindow都能顯示
					makoci.infoWindow.setContent(description);
					makoci.infoWindow.open(marker.getMap(), marker);
					
					if(infowindowopen){infowindowopen();}
				}
				if(isSyn){
					if(document.getElementById(syn_id + syn_num)) {
						document.getElementById(syn_id + syn_num).style.backgroundColor = syn_tableHoverColor;
					}
				}
				
				
			});
			google.maps.event.addListener(marker, "mouseover", function(e) {
				if(markerOptions.iconHover){
					marker.setIcon(markerOptions.iconHover);
				}
				
				if(isSyn){
					if(document.getElementById(syn_id + syn_num)) {
						document.getElementById(syn_id + syn_num).style.backgroundColor = syn_tableHoverColor;
					}
				}
			});
			google.maps.event.addListener(marker, "mouseout", function(e) {
				marker.setIcon(markerOptions.icon);
				if(isSyn){
					if(document.getElementById(syn_id + syn_num)) {
						document.getElementById(syn_id + syn_num).style.backgroundColor = '';
					}
				}
			});
//			google.maps.event.addListener(marker, "infowindowopen", function() {
//				if(markerOptions.iconHover){
//					marker.setImage(marker.getIcon().imageOver.image);
//				}
//				
//				if(isSyn){
//					if(document.getElementById(syn_id + syn_num)) {
//						document.getElementById(syn_id + syn_num).style.backgroundColor = syn_tableHoverColor;
//					}
//				}
//				
//				if(infowindowopen){
//					infowindowopen();
//				}
//			});
//			google.maps.event.addListener(marker, "infowindowclose", function() {
//				marker.setImage(marker.getIcon().imageOut.image);
//				if(isSyn){
//					if(document.getElementById(syn_id + syn_num)) {
//						document.getElementById(syn_id + syn_num).style.backgroundColor = '';
//					}
//				}
//				
//				if(infowindowclose){
//					infowindowclose();
//				}
//			});
			return marker;
}
		
		
/**
 * @param {Object} paths (Required)
 * @param {String or GInfoWindowTab []} description, 可以是html的string or GInfoWindowTab的array
 * @param {Object} polygonOptions, 包括 fillStyle, fillStyle_mouseOver
 * @param {Object} synOptions, 包括.domID, .num, .tableHoverColor
 */
makoci.util.createPolygon=function(paths, description, polygonOptions, synOptions) {
			if(!paths){console.log('[ERROR]paths並未設定！');return;}
			
			if(!polygonOptions){
				polygonOptions={
					fillColor:"#0000ff",
					fillOpacity:0.3,
					strokeColor:"#0000ff",
					strokeOpacity:0.7,
					strokeWeight:3
				};
			}
			
			//設定polygonOptions的mouseover style
			if(!polygonOptions.fillColorHover){polygonOptions.fillColorHover = "#ff0000";}
			if(!polygonOptions.fillOpacityHover){polygonOptions.fillOpacityHover = 0.3;}
			if(!polygonOptions.strokeColorHover){polygonOptions.strokeColorHover="#ff0000";}
			if(!polygonOptions.strokeOpacityHover){polygonOptions.strokeOpacityHover = 0.7;}
			if(!polygonOptions.strokeWeightHover){polygonOptions.strokeWeightHover = 3;}
			
			//讀取synOptions
			var isSyn=false, syn_id, syn_num, syn_tableHoverColor="#cccccc";
			if(synOptions){
				if(synOptions.num != "undefined" && synOptions.domID!= "undefined") {isSyn = true;}
				if(synOptions.tableHoverColor){syn_tableHoverColor=synOptions.tableHoverColor;}
				if(synOptions.num!= 'undefined'){syn_num=synOptions.num};
				if(synOptions.domID){syn_id=synOptions.domID;}
			}
			
			//create polygon
			polygonOptions.paths=paths;
			var polygon=new google.maps.Polygon(polygonOptions);
			
			//add Event
			google.maps.event.addListener(polygon, "click", function(e) {
				//change polygon style
				polygon.setOptions({fillColor:polygonOptions.fillColorHover, fillOpacity: polygonOptions.fillOpacityHover, strokeColor:polygonOptions.strokeColorHover, strokeOpacity: polygonOptions.strokeOpacityHover, strokeWeight: polygonOptions.strokeWeightHover});
				
				if(description){
					//不管description是單純html或是tabs, google maps3的infoWindow都能顯示
					makoci.infoWindow.setContent(description);
					makoci.infoWindow.open(polygon.getMap(), new google.maps.Marker({position:e.latLng}));
				}
				
				if(isSyn){
					if(document.getElementById(syn_id + syn_num)){
						document.getElementById(syn_id + syn_num).style.backgroundColor = syn_tableHoverColor;
					}
				}
			});
			google.maps.event.addListener(polygon, "mouseover", function(e) {
				//change polygon style
				polygon.setOptions({fillColor:polygonOptions.fillColorHover, fillOpacity: polygonOptions.fillOpacityHover, strokeColor:polygonOptions.strokeColorHover, strokeOpacity: polygonOptions.strokeOpacityHover, strokeWeight: polygonOptions.strokeWeightHover});
				
				if (isSyn) {
					if (document.getElementById(syn_id + syn_num)) {
						document.getElementById(syn_id + syn_num).style.backgroundColor = syn_tableHoverColor;
					}
				}
			});
			google.maps.event.addListener(polygon, "mouseout", function(e) {
				//change polygon style
				polygon.setOptions({fillColor:polygonOptions.fillColor, fillOpacity: polygonOptions.fillOpacity, strokeColor:polygonOptions.strokeColor, strokeOpacity: polygonOptions.strokeOpacity, strokeWeight: polygonOptions.strokeWeight});
				
				if (isSyn) {
					if (document.getElementById(syn_id + syn_num)) {
						document.getElementById(syn_id + syn_num).style.backgroundColor = '';
					}
				}
			});
			return polygon;
}
		
	
/**
 * createPolyline
 * @param {Object} path
 * @param {String or GInfoWindowTab []} description, 可以是HTML String or GInfoWindowTab的array
 * @param {Object} polylineOptions, 包含.strokeStyle; .strokeStyle_mouseOver.
 * @param {Object} synOptions, 包含.domID; .num; .tableHoverColor
 */
makoci.util.createPolyline=function(path, description, polylineOptions, synOptions) {
			if(!path){console.log('[ERROR]path並未設定！');return;}
			
			if(!polylineOptions){
				polylineOptions={
					strokeColor:"#0000ff",
					strokeOpacity:0.7,
					strokeWeight:3
				};
			}
			
			//設定polylineOptions的mouseover style
			if(!polylineOptions.strokeColorHover){polylineOptions.strokeColorHover="#ff0000";}
			if(!polylineOptions.strokeOpacityHover){polylineOptions.strokeOpacityHover = 0.7;}
			if(!polylineOptions.strokeWeightHover){polylineOptions.strokeWeightHover = 3;}
			
			//讀取synOptions
			var isSyn=false, syn_id, syn_num, syn_tableHoverColor="#cccccc";
			if(synOptions){
				if(synOptions.num!= "undefined" && synOptions.domID!= "undefined") {isSyn = true;}
				if(synOptions.tableHoverColor){syn_tableHoverColor=synOptions.tableHoverColor;}
				if(synOptions.num != 'undefined'){syn_num=synOptions.num};
				if(synOptions.domID){syn_id=synOptions.domID;}
			}
		
			//create polyline
			polylineOptions.path=path;
			var polyline=new google.maps.Polyline(polylineOptions);
		
			//add event
			google.maps.event.addListener(polyline, "click", function(e) {
				//設定polyline style
				polyline.setOptions({strokeColor:polylineOptions.strokeColorHover, strokeOpacity:polylineOptions.strokeOpacityHover, strokeWeight: polylineOptions.strokeWeightHover});
				
				if(description){
					//不管description是單純html或是tabs, google maps3的infoWindow都能顯示
					makoci.infoWindow.setContent(description);
					makoci.infoWindow.open(polyline.getMap(), new google.maps.Marker({position:e.latLng}));
				}
				
				if(isSyn){
					if(document.getElementById(syn_id + syn_num)) {
						document.getElementById(syn_id + syn_num).style.backgroundColor = syn_tableHoverColor;
					}
				}
			});
			google.maps.event.addListener(polyline, "mouseover", function(e) {
				//設定polyline style
				polyline.setOptions({strokeColor:polylineOptions.strokeColorHover, strokeOpacity:polylineOptions.strokeOpacityHover, strokeWeight: polylineOptions.strokeWeightHover});
				
				if (isSyn) {
					if (document.getElementById(syn_id + syn_num)) {
						document.getElementById(syn_id + syn_num).style.backgroundColor = syn_tableHoverColor;
					}
				}
			});
			google.maps.event.addListener(polyline, "mouseout", function(e) {
				//設定polyline style
				polyline.setOptions({strokeColor:polylineOptions.strokeColor, strokeOpacity:polylineOptions.strokeOpacityH, strokeWeight: polylineOptions.strokeWeight});
				
				if (isSyn) {
					if (document.getElementById(syn_id + syn_num)) {
						document.getElementById(syn_id + syn_num).style.backgroundColor = '';
					}
				}
			});
			return polyline;
}




/**
 * @class
 * jQuery JSON Plugin
 * version: 2.3 (2011-09-17)
 *
 * This document is licensed as free software under the terms of the
 * MIT License: http://www.opensource.org/licenses/mit-license.php
 *
 * Brantley Harris wrote this plugin. It is based somewhat on the JSON.org
 * website's http://www.json.org/json2.js, which proclaims:
 * "NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.", a sentiment that
 * I uphold.
 *
 * It is also influenced heavily by MochiKit's serializeJSON, which is
 * copyrighted 2005 by Bob Ippolito.
 */
makoci.util.JSON=function(){
	var	escapeable = /["\\\x00-\x1f\x7f-\x9f]/g,
		meta = {
			'\b': '\\b',
			'\t': '\\t',
			'\n': '\\n',
			'\f': '\\f',
			'\r': '\\r',
			'"' : '\\"',
			'\\': '\\\\'
		};

	/**
	 * jQuery.toJSON
	 * Converts the given argument into a JSON respresentation.
	 *
	 * @param o {Mixed} The json-serializble *thing* to be converted
	 *
	 * If an object has a toJSON prototype, that will be used to get the representation.
	 * Non-integer/string keys are skipped in the object, as are keys that point to a
	 * function.
	 *
	 */
	this.toJSON = typeof JSON === 'object' && JSON.stringify
		? JSON.stringify
		: function( o ) {

		if ( o === null ) {
			return 'null';
		}

		var type = typeof o;

		if ( type === 'undefined' ) {
			return undefined;
		}
		if ( type === 'number' || type === 'boolean' ) {
			return '' + o;
		}
		if ( type === 'string') {
			return this.quoteString( o );
		}
		if ( type === 'object' ) {
			if ( typeof o.toJSON === 'function' ) {
				return this.toJSON( o.toJSON() );
			}
			if ( o.constructor === Date ) {
				var	month = o.getUTCMonth() + 1,
					day = o.getUTCDate(),
					year = o.getUTCFullYear(),
					hours = o.getUTCHours(),
					minutes = o.getUTCMinutes(),
					seconds = o.getUTCSeconds(),
					milli = o.getUTCMilliseconds();

				if ( month < 10 ) {
					month = '0' + month;
				}
				if ( day < 10 ) {
					day = '0' + day;
				}
				if ( hours < 10 ) {
					hours = '0' + hours;
				}
				if ( minutes < 10 ) {
					minutes = '0' + minutes;
				}
				if ( seconds < 10 ) {
					seconds = '0' + seconds;
				}
				if ( milli < 100 ) {
					milli = '0' + milli;
				}
				if ( milli < 10 ) {
					milli = '0' + milli;
				}
				return '"' + year + '-' + month + '-' + day + 'T' +
					hours + ':' + minutes + ':' + seconds +
					'.' + milli + 'Z"';
			}
			if ( o.constructor === Array ) {
				var ret = [];
				for ( var i = 0; i < o.length; i++ ) {
					ret.push( this.toJSON( o[i] ) || 'null' );
				}
				return '[' + ret.join(',') + ']';
			}
			var	name,
				val,
				pairs = [];
			for ( var k in o ) {
				type = typeof k;
				if ( type === 'number' ) {
					name = '"' + k + '"';
				} else if (type === 'string') {
					name = this.quoteString(k);
				} else {
					// Keys must be numerical or string. Skip others
					continue;
				}
				type = typeof o[k];

				if ( type === 'function' || type === 'undefined' ) {
					// Invalid values like these return undefined
					// from toJSON, however those object members
					// shouldn't be included in the JSON string at all.
					continue;
				}
				val = this.toJSON( o[k] );
				pairs.push( name + ':' + val );
			}
			return '{' + pairs.join( ',' ) + '}';
		}
	};

	/**
	 * jQuery.evalJSON
	 * Evaluates a given piece of json source.
	 *
	 * @param src {String}
	 */
	this.evalJSON = typeof JSON === 'object' && JSON.parse
		? JSON.parse
		: function( src ) {
		return eval('(' + src + ')');
	};

	/**
	 * jQuery.secureEvalJSON
	 * Evals JSON in a way that is *more* secure.
	 *
	 * @param src {String}
	 */
	this.secureEvalJSON = typeof JSON === 'object' && JSON.parse
		? JSON.parse
		: function( src ) {

		var filtered = 
			src
			.replace( /\\["\\\/bfnrtu]/g, '@' )
			.replace( /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
			.replace( /(?:^|:|,)(?:\s*\[)+/g, '');

		if ( /^[\],:{}\s]*$/.test( filtered ) ) {
			return eval( '(' + src + ')' );
		} else {
			throw new SyntaxError( 'Error parsing JSON, source is not valid.' );
		}
	};

	/**
	 * jQuery.quoteString
	 * Returns a string-repr of a string, escaping quotes intelligently.
	 * Mostly a support function for toJSON.
	 * Examples:
	 * >>> jQuery.quoteString('apple')
	 * "apple"
	 *
	 * >>> jQuery.quoteString('"Where are we going?", she asked.')
	 * "\"Where are we going?\", she asked."
	 * @param {String} String
	 */
	this.quoteString = function( string ) {
		if ( string.match( escapeable ) ) {
			return '"' + string.replace( escapeable, function( a ) {
				var c = meta[a];
				if ( typeof c === 'string' ) {
					return c;
				}
				c = a.charCodeAt();
				return '\\u00' + Math.floor(c / 16).toString(16) + (c % 16).toString(16);
			}) + '"';
		}
		return '"' + string + '"';
	};
}

//init
makoci.JSON=new makoci.util.JSON();



/**
 * @class
 * 提供基本的座標轉換工具
 * This object provide method for converting lat/lon coordinate to TWD97
    coordinate
 
    the formula reference to
    http://www.uwgb.edu/dutchs/UsefulData/UTMFormulas.htm (there is lots of typo)
    http://www.offshorediver.com/software/utm/Converting UTM to Latitude and Longitude.doc
 
    Parameters reference to
    http://rskl.geog.ntu.edu.tw/team/gis/doc/ArcGIS/WGS84%20and%20TM2.htm
    http://blog.minstrel.idv.tw/2004/06/taiwan-datum-parameter.html
 */
makoci.util.coordinate=function(){
	/**
	 * 經緯度轉97二度分帶座標
	 * @param {Number} lat
	 * @param {Number} lng
	 * @return {Object} obj 包含obj.x 代表97的x座標; obj.y 代表97的y座標。
	 */
	this.WGS84ToTWD97=function(lat, lng){
		return WGS84ToTWD97(lat,lng);
	}
	
	/**
	 * 經緯度轉67二度分帶座標
	 * @param {Number} lat
	 * @param {Number} lng
	 * @return {Object} obj 包含obj.x 代表67的x座標; obj.y 代表67的y座標。
	 */
	this.WGS84ToTWD67 = function(lat, lng){
		return WGS84ToTWD67(lat, lng);
	}
	
	/**
	 * 97二度分帶轉經緯度座標
	 * @param {Number} x
	 * @param {Number} y
	 * @return {Object} obj 包含obj.lat 代表緯度座標; obj.lng 代表經度座標。
	 */
	this.TWD97ToWGS84=function(x,y){
		return TWD97ToWGS84(x,y);
	}
	
	/**
	 * 97二度分帶轉67二度分帶座標
	 * @param {Number} x
	 * @param {Number} y
	 * @return {Object} obj 包含obj.x 代表67的x座標; obj.y 代表67的y座標。
	 */
	this.TWD97ToTWD67=function(x,y){
		return TWD97ToTWD67(x,y);
	}
	
	/**
	 * 67二度分帶轉97二度分帶座標
	 * @param {Number} x
	 * @param {Number} y
	 * @return {Object} obj 包含obj.x 代表97的x座標; obj.y 代表97的y座標。
	 */
	this.TWD67ToTWD97=function(x,y){
		return TWD67ToTWD97(x,y);
	}
	
	/**
	 * 67二度分帶轉經緯度座標
	 * @param {Number} x
	 * @param {Number} y
	 * @return {Object} obj 包含obj.lat 代表緯度座標; obj.lng 代表經度座標。
	 */
	this.TWD67ToWGS84=function(x,y){
			return TWD67ToWGS84(x,y);
	}

	//global variable
	var tileSize = 256;
	var initialResolution = 2 * Math.PI * 6378137 / tileSize;
	var originShift = 2 * Math.PI * 6378137 / 2.0;	
	
	//conver wgs84 to web mercator
	/**
	 * 經緯度座標轉換成Google Maps麥卡托平面座標，單位：公尺
	 * @param {Number} lat
	 * @param {Number} lng
	 * @return {Object} obj 包含obj.x 代表x座標; obj.y 代表y座標。
	 */
	this.latlngToMeter=function(lat, lng){
		return latlngToMeter(lat, lng);
	}
	
	//conver web mercator to wgs84
	/**
	 * Google Maps麥卡托平面座標轉換成經緯度
	 * @param {Number} mx
	 * @param {Number} my
	 * @return {Object} obj 包含obj.lat 代表緯度座標; obj.lng 代表經度座標。
	 */
	this.meterToLatLng=function(mx, my){
		return meterToLatLng(mx, my);
	}
	
	//conver meter to pixel
	/**
	 * Google Map麥卡托平面座標轉成Pixel
	 * @param {Number} mx
	 * @param {Number} my
	 * @param {Number} zoom
	 * @return {Object} obj 包含obj.x 代表pixel的x座標; obj.y 代表pixel的y座標。
	 */
	this.meterToPixel=function(mx, my, zoom){
		return meterToPixel(mx,my, zoom);
	}
	
	//conver pixel to meter
	/**
	 * Pixel座標轉換成Google Map麥卡托平面座標
	 * @param {Number} px
	 * @param {Number} py
	 * @param {Number} zoom
	 * @return {Object} obj 包含obj.x 代表x座標; obj.y 代表y座標。
	 */
	this.pixelToMeter=function(px, py, zoom){
		return pixelToMeter(px, py, zoom);
	}
	
	//convert latlng to pixel
	/**
	 * 經緯度座標轉換成Pixel座標
	 * @param {Number} lat
	 * @param {Number} lng
	 * @param {Number} zoom
	 * @return {Object} obj 包含obj.x 代表pixel的x座標; obj.y 代表pixel的y座標。
	 */
	this.latlngToPixel=function(lat, lng, zoom){
		var meter=latlngToMeter(lat,lng);
		var pixel=meterToPixel(meter.x, meter.y, zoom);
		return pixel
	}
	
	//convert pixel to latlng
	/**
	 * Pixel座標轉換成經緯度座標
	 * @param {Number} px
	 * @param {Number} py
	 * @param {Number} zoom
	 * @return {Object} obj 包含obj.lat 代表緯度座標; obj.lng 代表經度座標。
	 */
	this.pixelToLatLng=function(px, py, zoom){
		var meter=pixelToMeter(px, py, zoom);
		return meterToLatLng(meter.x, meter.y);
	}
	
	//convert pixel to tile
	/**
	 * Pixel座標轉換成Tile index位置
	 * @param {Number} px
	 * @param {Number} py
	 * @param {Number} zoom
	 * @return {Object} obj 包含obj.x 代表tile的x座標; obj.y 代表tile的y座標。
	 */
	this.pixelToTile=function(px, py, zoom){
		return pixelToTile(px, py, zoom);
	}
	
	//convert latlng to tile
	/**
	 * 經緯度座標轉換成Tile index位置
	 * @param {Number} lat
	 * @param {Number} lng
	 * @param {Number} zoom
	 * @return {Object} obj 包含obj.x 代表tile的x座標; obj.y 代表tile的y座標。
	 */
	this.latlngToTile=function(lat,lng,zoom){
		var meter=latlngToMeter(lat,lng);
		var pixel=meterToPixel(meter.x, meter.y, zoom);
		return pixelToTile(pixel.x, pixel.y, zoom)
	}
	
	//convert tile to latlng
	/**
	 * Tile index位置轉換成經緯度的Bounding box, 包含左下以及右上兩個座標
	 * @param {Number} tx
	 * @param {Number} ty
	 * @param {Number} zoom
	 * @return {Object} obj 包含obj.xmin 代表左下方的x座標; obj.ymin 代表左下方的y座標; obj.xmax 代表右上方的x座標; obj.ymax 代表右上方的y座標。
	 */
	this.tileToLatLngBound=function(tx,ty, zoom){
		return tileToLatLngBound(tx, ty, zoom);
	}

	/*
	 * 經緯度座標轉換成twd97
	 */
	/**
	 * @private
	 */
	function WGS84ToTWD97(lat,lng){
		    //轉換成radians圓周角
			lat=lat*(Math.PI/180);
			lng=lng*(Math.PI/180);
		
			//參數設定
	        a = 6378137.0;
	        b = 6356752.314245;
	        long0 = 121*(Math.PI/180);
	        k0 = 0.9999;
			dx = 250000;
	
	        e = Math.pow((1-Math.pow(b,2)/Math.pow(a,2)),0.5);
	        e2 = Math.pow(e,2)/(1-Math.pow(e,2));
	        n = (a-b)/(a+b);
	        nu = a/Math.pow((1-Math.pow(e,2)*Math.pow(Math.sin(lat),2)),0.5);
	        p = lng-long0;
	
	        A = a*(1 - n + (5/4.0)*(Math.pow(n,2) - Math.pow(n,3)) + (81/64.0)*(Math.pow(n,4)  - Math.pow(n,5)));
	        B = (3*a*n/2.0)*(1 - n + (7/8.0)*(Math.pow(n,2) - Math.pow(n,3)) + (55/64.0)*(Math.pow(n,4) - Math.pow(n,5)));
	        C = (15*a*Math.pow(n,2)/16.0)*(1 - n + (3/4.0)*(Math.pow(n,2) - Math.pow(n,3)));
	        D = (35*a*Math.pow(n,3)/48.0)*(1 - n + (11/16.0)*(Math.pow(n,2) - Math.pow(n,3)));
	        E = (315*a*Math.pow(n,4)/51.0)*(1 - n);
	 
	        S = A*lat - B*Math.sin(2*lat) + C*Math.sin(4*lat) - D*Math.sin(6*lat) + E*Math.sin(8*lat);
	 
	        K1 = S*k0
	        K2 = k0*nu*Math.sin(2*lat)/4.0
	        K3 = (k0*nu*Math.sin(lat)*Math.pow(Math.cos(lat),3)/24.0) * (5 - Math.pow(Math.tan(lat),2) + 9*e2*Math.pow(Math.cos(lat),2) + 4*Math.pow(e2,2)*Math.pow(Math.cos(lat),4));
	 
	
	        y = K1 + K2*Math.pow(p,2) + K3*Math.pow(p,4);
	 
	        K4 = k0*nu*Math.cos(lat);
	        K5 = (k0*nu*Math.pow(Math.cos(lat),3)/6.0) * (1 - Math.pow(Math.tan(lat),2) + e2*Math.pow(Math.cos(lat),2));
	 
	        x = K4*p + K5*Math.pow(p,3) + dx
	        
			
			
			var TWD97={
				x:x,
				y:y
			}
			
			return TWD97
	}
	
	
	/*
	 * twd97座標轉換成經緯度
	 */
	/**
	 * @private
	 */
	function TWD97ToWGS84(x,y){
			var dx = 250000;
			var dy = 0;
			var lon0 = 121 * Math.PI / 180;
			var k0 = 0.9999;
			var a = 6378137.0;
			var b = 6356752.314245;
			var e = Math.pow((1-Math.pow(b,2)/Math.pow(a,2)),0.5);
	 
			x -= dx;
			y -= dy;
	 
			// Calculate the Meridional Arc
			var M = y/k0;
	 
			// Calculate Footprint Latitude
			var mu = M/(a*(1.0 - Math.pow(e, 2)/4.0 - 3*Math.pow(e, 4)/64.0 - 5*Math.pow(e, 6)/256.0));
			var e1 = (1.0 - Math.pow((1.0 - Math.pow(e, 2)), 0.5)) / (1.0 + Math.pow((1.0 - Math.pow(e, 2)), 0.5));
	 
			var J1 = (3*e1/2 - 27*Math.pow(e1, 3)/32.0);
			var J2 = (21*Math.pow(e1, 2)/16 - 55*Math.pow(e1, 4)/32.0);
			var J3 = (151*Math.pow(e1, 3)/96.0);
			var J4 = (1097*Math.pow(e1, 4)/512.0);
	 
			var fp = mu + J1*Math.sin(2*mu) + J2*Math.sin(4*mu) + J3*Math.sin(6*mu) + J4*Math.sin(8*mu);
	 
			// Calculate Latitude and Longitude
			var e2 = Math.pow((e*a/b), 2);
			var C1 = Math.pow(e2*Math.cos(fp), 2);
			var T1 = Math.pow(Math.tan(fp), 2);
			var R1 = a*(1-Math.pow(e, 2))/Math.pow((1-Math.pow(e, 2)*Math.pow(Math.sin(fp), 2)), (3.0/2.0));
			var N1 = a/Math.pow((1-Math.pow(e, 2)*Math.pow(Math.sin(fp), 2)), 0.5);
	 
			var D = x/(N1*k0);
	 
			// lat
			var Q1 = N1*Math.tan(fp)/R1;
			var Q2 = (Math.pow(D, 2)/2.0);
			var Q3 = (5 + 3*T1 + 10*C1 - 4*Math.pow(C1, 2) - 9*e2)*Math.pow(D, 4)/24.0;
			var Q4 = (61 + 90*T1 + 298*C1 + 45*Math.pow(T1, 2) - 3*Math.pow(C1, 2) - 252*e2)*Math.pow(D, 6)/720.0;
			var lat = fp - Q1*(Q2 - Q3 + Q4);
	 
			// long
			var Q5 = D;
			var Q6 = (1 + 2*T1 + C1)*Math.pow(D, 3)/6;
			var Q7 = (5 - 2*C1 + 28*T1 - 3*Math.pow(C1, 2) + 8*e2 + 24*Math.pow(T1, 2))*Math.pow(D, 5)/120.0;
			var lon = lon0 + (Q5 - Q6 + Q7)/Math.cos(fp);
	 
	 
	 		lat=lat* 180 / Math.PI;
			lon=lon* 180 / Math.PI;
			
	 		//return
			var wgs84={
				lat:lat,
				lng:lon
			}
			
			return wgs84;
	}
	
	
	
	//TWD67轉TWD97
	/**
	 * @private
	 */
	function TWD67ToTWD97(x,y){
		var A=0.00001549;
		var B=0.000006521;
		 
		var X97=x+807.8+A*x+B*y; 
		var Y97=y-248.6+A*y+B*x;
		
		var obj={
			x: X97,
			y: Y97
		};
		
		return obj;
	}
	
	
	//TWD97轉TWD67
	/**
	 * @private
	 */
	function TWD97ToTWD67(x,y){
		var A=0.00001549;
		var B=0.000006521;
		
		var X67=x-807.8-A*x-B*y; 
		var Y67=y+248.6-A*y-B*x;
		
		var obj={
			x: X67,
			y: Y67
		};
		
		return obj;
	}
	
	
	
	//TWD67轉經緯度
	/**
	 * @private
	 */
	function TWD67ToWGS84(x,y){
		var twd97=TWD67ToTWD97(x,y);
		var wgs84=TWD97ToWGS84(twd97.x,twd97.y);
		
		return wgs84;
	}
	
	
	
	//經緯度轉TWD67
	/**
	 * @private
	 */
	function WGS84ToTWD67(lat,lng){
		var twd97= WGS84ToTWD97(lat,lng);
		var twd67= TWD97ToTWD67(twd97.x, twd97.y);
		
		return twd67;
	}


	//將經緯度的座標轉換成google tile標準的pixel or tile，並且互轉
	//參考資源：http://www.maptiler.org/google-maps-coordinates-tile-bounds-projection/
	//***********************************************************************************************************
	/**
	 * @private
	 */
	function Resolution(zoom){
		return initialResolution / Math.pow(2, zoom);
	}
	
	//convert latlng to meter
	/**
	 * @private
	 */
	function latlngToMeter(lat, lng){
		var mx = lng * originShift / 180.0;
        var my = Math.log( Math.tan((90 + lat) * Math.PI / 360.0 )) / (Math.PI / 180.0);
		my = my * originShift / 180.0;
        return {x:mx, y:my};
	}
	
	//convert meter to latlng
	/**
	 * @private
	 */
	function meterToLatLng(mx, my){
		var lng = (mx / originShift) * 180.0
        var lat = (my / originShift) * 180.0
		lat = 180 / Math.PI * (2 * Math.atan( Math.exp( lat * Math.PI / 180.0)) - Math.PI / 2.0)
        return {lat:lat, lng:lng};
	}
	
	
	//convert meter to pixel
	/**
	 * @private
	 */
	function meterToPixel(mx, my, zoom){
		var res = Resolution(zoom)
        var px = Math.round((mx + originShift) / res);
        var py = Math.round((originShift - my) / res); //由於google是右上方 為原點，如果是以左下方為原點，要改為 (my - originShift) / res
        return {x:px, y:py};
	}
	
	//convert pixel to meter
	/**
	 * @private
	 */
	function pixelToMeter(px, py, zoom){
		var res = Resolution( zoom );
        var mx = px * res - originShift;
        var my = originShift- py * res ; //由於google是右上方 為原點，如果是以左下方為原點，要改為 py * res - originShift
        return {x:mx, y:my};
	}
	
	//convert pixel to tile
	/**
	 * @private
	 */
	function pixelToTile(px, py, zoom){
        var tx = Math.floor( px / parseFloat(tileSize)  );
        var ty = Math.floor( py / parseFloat(tileSize)  );
		//google tile
		//ty=(Math.pow(2,zoom) - 1) - ty;
        return {x:tx, y:ty}
	}
	
	//convert tile to pixel bound
	/**
	 * @private
	 */
	function tileToPixelBound(tx, ty){
		var p_xmin=tx*tileSize;
		var p_ymin=(ty+1)*tileSize;
		var p_xmax=(tx+1)*tileSize;
		var p_ymax=ty*tileSize;
		return {xmin:p_xmin, ymin: p_ymin, xmax: p_xmax, ymax: p_ymax}
	}
	
	//convert tile to latlng bounds
	/**
	 * @private
	 */
	function tileToLatLngBound(tx, ty, zoom){
		var p_bound=tileToPixelBound(tx, ty);
		var meter_sw=pixelToMeter(p_bound.xmin, p_bound.ymin, zoom);
		var meter_ne=pixelToMeter(p_bound.xmax, p_bound.ymax, zoom);
		var latlng_sw=meterToLatLng(meter_sw.x, meter_sw.y);
		var latlng_ne=meterToLatLng(meter_ne.x, meter_ne.y);
		return {xmin: latlng_sw.lng, ymin: latlng_sw.lat, xmax: latlng_ne.lng, ymax: latlng_ne.lat};
	}
}
   
   
//init
makoci.COORDINATE=new makoci.util.coordinate();



/**
 * 將key-value的array中的值，轉換成html語法
 * @param {Array} key_value_array
 */
makoci.util.getDescriptionHtml=function(key_value_array){
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

 





