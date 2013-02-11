

if(!window.makoci){
	window.makoci=function(){};	
}



makoci.FeatureSet=function(){
	this.id="",
	this.name="",
	this.geometry="",
	this.features=[],
	this.agsFeatureSet={},
	this.center_gLatLng={},
	this.bbox={xmin:0,ymin:0,xmax:0,ymax:0},
	this.gLatLngBounds={},
	this.attributeTableHtml=""
}


makoci.Feature=function(){
	this.id="",
	this.name="",
	this.geometry="",
	this.gOverlays=[],
	this.infoWindowHtml="",
	this.gLatLngs=[],
	this.bbox={xmin:0,ymin:0,xmax:0, ymax:0},
	this.bbox_key="",
	this.center_gLatLng={},
	this.agsFeature={},
	this.properties={},
	this.description=""
}


makoci.agsFeatureSet=function(){
	this.features=[];
	this.geometryType='';
	this.displayFieldName=null;
	this.fieldAliases=null;
	this.spatialReference={wkid: 4326};
}

makoci.agsFeature=function(){
	this.geometry=null;
	this.attributes={};
}


/**
 * 統一在google map3中所用的所有infowindow
 */
makoci.infoWindow= new google.maps.InfoWindow();


/**
 * 新增一個Google Map3的OverlayView，專門用來計算fromLatLngToContainerPixel，會被用在wms identity中
 * 此makoci.overlayView會在makoci.gmap3.map.js中被setMap()
 */
makoci.overlayView=new google.maps.OverlayView();
makoci.overlayView.draw = function() {};


/**
 * 用來存放大量的marker
 */
makoci.markerCluster=null;














/**
 * 新增google Map3的drawingManager 方便所有後續的程式可供使用
 * 注意尚未設定drawingMode和map
 * 並且在include google maps library時一定要include '&libraries=drawing'
 * 譬如：https://maps.googleapis.com/maps/api/js?sensor=false&libraries=drawing
 */
if(typeof(google.maps.drawing)!='undefined'){
	makoci.drawingManager = new google.maps.drawing.DrawingManager({
	 	markerOptions:{draggable: true},
		polylineOptions: {editable: true, strokeColor:"#ff0000"},
	    rectangleOptions: {strokeWeight: 0,fillOpacity: 0.45,fillColor:"#ff0000", editable: true},
	    circleOptions: {strokeWeight: 0,fillOpacity: 0.45,fillColor:"#ff0000",editable: true},
	    polygonOptions: {strokeWeight: 0,fillOpacity: 0.45,fillColor:"#ff0000",editable: true},
		drawingControl:true
	});
}


/**
 * 新增google的geocoder
 */
makoci.geocoder=new google.maps.Geocoder();


/**
 * 新增google的directionsService
 */
makoci.directionsService=new google.maps.DirectionsService();
makoci.directionsDisplay=new google.maps.DirectionsRenderer();

/**
 * 新增google的elevationService
 */
makoci.elevationService=new google.maps.ElevationService();


/**
 * 儲存gmap物件
 */
makoci.GMAP=null;


/**
 * init makoci.util.JSON
 */
makoci.JSON=null;



/**
 * init makoci.util.coordinate
 */
makoci.COORDINATE=null;



/**
 * 擴充google.maps.Marker的功能
 */
if(google.maps.Marker){
	google.maps.Marker.prototype.ext_agsGeometry=null;
	google.maps.Marker.prototype.ext_centerLatLng=null;
	/**
	 * get ags Geoemtry
	 */
	google.maps.Marker.prototype.ext_getAgsGeometry=function(){
		var latlng=this.getPosition();
		
		if(!ext_agsGeometry){
			if(latlng){
				this.ext_agsGeometry={
					x:latlng.lng(),
					y:latlng.lat()
				};
				
			}
		}
		return this.ext_agsGeometry
	}
}



/**
 * 擴充google.maps.Polyline具有getBounds的function
 * @return {Object} 包括.bounds, box{xmin, ymin, xmax, ymax}, center_latlng
 */
if(google.maps.Polyline){
	google.maps.Polyline.prototype.ext_latlngs=[];
	google.maps.Polyline.prototype.ext_bounds=null;
	google.maps.Polyline.prototype.ext_agsGeometry=null;
	google.maps.Polyline.prototype.ext_centerLatLng=null;
	
	/**
	 * get all latlng from polyline
	 */
	google.maps.Polyline.prototype.ext_getLatLngs=function(){
		if(this.ext_latlngs.length==0){
			this.ext_getBounds();
		}
		return this.ext_latlngs;	
	}
	
	/**
	 * get center latlng from polyline
	 */
	google.maps.Polyline.prototype.ext_getCenterLatLng=function(){
		if(!this.ext_centerLatLng){
			this.ext_centerLatLng=this.ext_getBounds().center_latlng;
		}
		return this.ext_centerLatLng;
	}
	
	/**
	 * get bounds of polyline
	 */
	google.maps.Polyline.prototype.ext_getBounds=function(){
		if(!this.ext_bounds){
			var path=this.getPath(),
				bounds=new google.maps.LatLngBounds(),
				bbox={xmin:0,ymin:0,xmax:0,ymax:0},
				center_index=getCenterIndex(path.getLength()),
				center_latlng,
				me=this;
			
			//將ext_latlng歸零，不然不同的polyline會一直累計，因為ext_latlngs是在prototype中
			me.ext_latlngs=[];
			
			path.forEach(function(latlng,i){
				bounds.extend(latlng);	
				me.ext_latlngs.push(latlng);
				
				if(i==center_index){
					center_latlng=latlng;
				}
			});
			
			//bbox
			var ne=bounds.getNorthEast(),
				sw=bounds.getSouthWest()
			bbox.xmin=sw.lng();
			bbox.ymin=sw.lat();
			bbox.xmax=ne.lng();
			bbox.ymax=ne.lat();
			
			this.ext_bounds= {
				bounds:bounds,
				bbox:bbox,
				center_latlng:center_latlng
			}
		}
		
		return this.ext_bounds;
		
		
		/**
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
	 * 取得此polyline geometry的字串
	 */
	google.maps.Polyline.prototype.ext_getAgsGeometry=function(){
		if(!this.ext_agsGeometry){
			var latlngs=this.ext_getLatLngs(),
				path=[];
				
			$.each(latlngs, function(i, latlng){
				path.push([latlng.lng(), latlng.lat()]);
			});
			
			this.ext_agsGeometry={
				paths:[path],
				spatialReference:{wkid:4326}
			};
		}
		
		return this.ext_agsGeometry;
	}
}


/**
 * 擴充google.maps.Polygon具有getBounds的function
 * @return {Object} 包括.bounds, box{xmin, ymin, xmax, ymax}
 */
if(google.maps.Polygon){
	google.maps.Polygon.prototype.ext_latlngs=[];
	google.maps.Polygon.prototype.ext_bounds=null;
	google.maps.Polygon.prototype.ext_agsGeometry='';
	google.maps.Polygon.prototype.ext_centerLatLng=null;
	
	/**
	 * get all latlngs from polygon
	 */
	google.maps.Polygon.prototype.ext_getLatLngs=function(){
		if(this.ext_latlngs.length==0){
			this.ext_getBounds();
		}
		return this.ext_latlngs;	
	}
	
	/**
	 * get center latlng of polygon
	 */
	google.maps.Polygon.prototype.ext_getCenterLatLng=function(){
		if(!this.ext_centerLatLng){
			this.ext_centerLatLng=this.ext_getBounds().center_latlng;
		}
		return this.ext_centerLatLng;
	}
	
	
	/**
	 * get bounds of polygon
	 */
	google.maps.Polygon.prototype.ext_getBounds=function(){
		if(!this.ext_bounds){
			var bounds=new google.maps.LatLngBounds(),
			bbox={xmin:0,ymin:0,xmax:0,ymax:0},
			center_latlng,
			me=this;
			
			//將ext_latlng歸零，不然不同的polygon會一直累計，因為ext_latlngs是在prototype中
			me.ext_latlngs=[];
			
			this.getPaths().forEach(function(path,i){
				path.forEach(function(latlng,j){
					me.ext_latlngs.push(latlng);
					bounds.extend(latlng);
				});
			});
			
			var ne=bounds.getNorthEast(),
				sw=bounds.getSouthWest();
			bbox.xmin=sw.lng();
			bbox.ymin=sw.lat();
			bbox.xmax=ne.lng();
			bbox.ymax=ne.lat();
			
			this.ext_bounds={
				bounds:bounds,
				bbox:bbox,
				center_latlng:new google.maps.LatLng((bbox.ymin+bbox.ymax)/2,(bbox.xmin+bbox.xmax)/2)
			}
		}
		
		return this.ext_bounds;
	}
	
	/**
	 * 取得此polyline geometry的字串
	 */
	google.maps.Polygon.prototype.ext_getAgsGeometry=function(){
		if(this.ext_agsGeometry==''){
			var latlngs=this.ext_getLatLngs(),
				ring=[];
				
			$.each(latlngs, function(i, latlng){
				ring.push([latlng.lng(), latlng.lat()]);
			});
			
			this.ext_agsGeometry=makoci.JSON.toJSON({
				geometry:{
					rings: [ring],
					spatialReference:{wkid:4326}
				}
			});
		}
		
		return this.ext_agsGeometry;
	}
}




