
//overwrite jquery.contains case insensitive
//it is working under the version 1.8 (<1.8), please ref:http://css-tricks.com/snippets/jquery/make-jquery-contains-case-insensitive/
jQuery.expr[':'].contains = function(a, i, m) {
  return jQuery(a).text().toUpperCase()
      .indexOf(m[3].toUpperCase()) >= 0;
};






//overwrite OpenLayers.ArcGIS93Rest.getURL()
//because ArcGIS93Rest will automatically get the projection from the map. It cannot be changed. It will generate a compatible problem that epsg:900913, which openlayers uses, cannot be identified by arcgis server
OpenLayers.Layer.ArcGIS93Rest.prototype.getURL=function (bounds) {
        bounds = this.adjustBounds(bounds);
		
		var bboxsrid, 
			projWords = this.projection.getCode().split(":"), 
			srid, imagesrid;
			
		
        // ArcGIS Server only wants the numeric portion of the projection ID.
		if(this.params.BBOXSR && this.params.BBOXSR!=""){
			bboxsrid = this.params.BBOXSR
		}else{
        	srid = projWords[projWords.length - 1];
        	bboxsrid = projWords[projWords.length - 1];
		}
		
		//imagesr
		if(this.params.IMAGESR && this.params.IMAGESR!=""){
			imagesrid = this.params.BBOXSR
		}else{
        	imagesrid = projWords[projWords.length - 1];
		}
 

 		//project bounds
 		if(bboxsrid && imagesrid && bboxsrid==imagesrid && bboxsrid!='900913' && bboxsrid!='102113' &&  bboxsrid!='3857'){
 			if(Proj4js.defs["EPSG:"+bboxsrid] && Proj4js.defs["EPSG:"+bboxsrid]!=''){
 				bounds=bounds.transform(this.projection, "EPSG:"+bboxsrid);
 			}else{
 				console.log('Please import EPSG:' + bboxsrid +" first from http://spatialreference.org/ref/epsg/" + bboxsrid + "/proj4js/");
 				return;
 			}
 		}
 		

 	
 			//param
	    	var imageSize = this.getImageSize(); 
	         var newParams = {
	             'SIZE': imageSize.w + "," + imageSize.h,
	             // We always want image, the other options were json, image with a whole lotta html around it, etc.
	             'F': "image",
	            'BBOXSR': bboxsrid,
	            'IMAGESR': imagesrid,
	            'BBOX': bounds.toBBOX()
	         };
	
	        // Now add the filter parameters.
	        if (this.layerDefs) {
	            var layerDefStrList = [];
	            var layerID;
	            for(layerID in this.layerDefs) {
	                if (this.layerDefs.hasOwnProperty(layerID)) {
	                    if (this.layerDefs[layerID]) {
	                        layerDefStrList.push(layerID);
	                        layerDefStrList.push(":");
	                        layerDefStrList.push(this.layerDefs[layerID]);
	                        layerDefStrList.push(";");
	                    }
	                }
	            }
	            if (layerDefStrList.length > 0) {
	                newParams['LAYERDEFS'] = layerDefStrList.join("");
	            }
	        }
	        var requestString = this.getFullRequestString(newParams);
	        return requestString;
}





//overwrite OpenLayers.Layer.WMS.getURL() for project coordinate
OpenLayers.Layer.WMS.prototype.getURL=function(bounds) {
		bounds = this.adjustBounds(bounds);
		
		//projected bounds to corresponding srs, which we set in the params
		if(this.params.SRS && this.params.SRS!='' && this.params.SRS != this.map.getProjectionObject().getCode() && this.params.SRS != "EPSG:900913" && this.params.SRS != "EPSG:102113" && this.params.SRS != "EPSG:3857"){
			if(Proj4js.defs[this.params.SRS] && Proj4js.defs[this.params.SRS]!=''){
 				bounds=bounds.transform(this.projection, this.params.SRS);
 			}else{
 				console.log('Please import EPSG:' + this.params.SRS +" script first from http://spatialreference.org/ref/epsg/" + this.params.SRS + "/proj4js/");
 				return;
 			}
		}
		
        var imageSize = this.getImageSize();
        var newParams = {};
        // WMS 1.3 introduced axis order
        var reverseAxisOrder = this.reverseAxisOrder();
        newParams.BBOX = this.encodeBBOX ?
            bounds.toBBOX(null, reverseAxisOrder) :
            bounds.toArray(reverseAxisOrder);
        newParams.WIDTH = imageSize.w;
        newParams.HEIGHT = imageSize.h;
        var requestString = this.getFullRequestString(newParams);
        return requestString;
}

//overwrite OpenLayers.Layer.WMS.getFullRequestString() for project coordinate
OpenLayers.Layer.WMS.prototype.getFullRequestString=function(newParams, altUrl) {
        var mapProjection = this.map.getProjectionObject();
        
        var projectionCode;
        //projected bounds to corresponding srs, which we set in the params
		if(this.params.SRS && this.params.SRS!='' && this.params.SRS != mapProjection.getCode()){
			projectionCode=this.params.SRS;
		}else{
			projectionCode= this.projection && this.projection.equals(mapProjection) ?
            	this.projection.getCode() :
            	mapProjection.getCode();
		}
        
        var value = (projectionCode == "none") ? null : projectionCode;
        if (parseFloat(this.params.VERSION) >= 1.3) {
            this.params.CRS = value;
        } else {
            this.params.SRS = value;
        }
        
        if (typeof this.params.TRANSPARENT == "boolean") {
            newParams.TRANSPARENT = this.params.TRANSPARENT ? "TRUE" : "FALSE";
        }

        return OpenLayers.Layer.Grid.prototype.getFullRequestString.apply(this, arguments);
}



//overwrite OpenLayers.control.WMSGetFeatureInfo for project coordinate
OpenLayers.Control.WMSGetFeatureInfo.prototype.buildWMSOptions= function(url, layers, clickPosition, format) {
        var layerNames = [], styleNames = [];
        for (var i = 0, len = layers.length; i < len; i++) {
            if (layers[i].params.LAYERS != null) {
                layerNames = layerNames.concat(layers[i].params.LAYERS);
                styleNames = styleNames.concat(this.getStyleNames(layers[i]));
            }
        }
        var firstLayer = layers[0];
        // use the firstLayer's projection if it matches the map projection -
        // this assumes that all layers will be available in this projection
        var projection = this.map.getProjection();
        var layerProj = firstLayer.projection;
        if (layerProj && layerProj.equals(this.map.getProjectionObject())) {
            projection = layerProj.getCode();
        }
        
        
        //determine if kiein_srs exists
        var kiein_srs=firstLayer.kiein_srs;
        var bbox=this.map.getExtent().toBBOX(null,firstLayer.reverseAxisOrder());
        if(kiein_srs && kiein_srs!="" && kiein_srs!=this.map.getProjectionObject()){
        	projection=kiein_srs;
        	if(Proj4js.defs[kiein_srs] && Proj4js.defs[kiein_srs]!=""){
        		bbox=this.map.getExtent().transform(this.map.getProjectionObject(), kiein_srs).toBBOX(null,firstLayer.reverseAxisOrder());
        	}else{
        		console.log('Please import EPSG:' + kiein_srs.split(":")[1] +" script first from http://spatialreference.org/ref/epsg/" + kiein_srs.split(":")[1] + "/proj4js/");
        		return;
        	}
        }
        

        
        var params = OpenLayers.Util.extend({
            service: "WMS",
            version: firstLayer.params.VERSION,
            request: "GetFeatureInfo",
            exceptions: firstLayer.params.EXCEPTIONS,
            bbox: bbox,
            feature_count: this.maxFeatures,
            height: this.map.getSize().h,
            width: this.map.getSize().w,
            format: format,
            info_format: firstLayer.params.INFO_FORMAT || this.infoFormat
        }, (parseFloat(firstLayer.params.VERSION) >= 1.3) ?
            {
                crs: projection,
                i: parseInt(clickPosition.x),
                j: parseInt(clickPosition.y)
            } :
            {
                srs: projection,
                x: parseInt(clickPosition.x),
                y: parseInt(clickPosition.y)
            }
        );
        if (layerNames.length != 0) {
            params = OpenLayers.Util.extend({
                layers: layerNames,
                query_layers: layerNames,
                styles: styleNames
            }, params);
        }
        OpenLayers.Util.applyDefaults(params, this.vendorParams);
        return {
            url: url,
            params: OpenLayers.Util.upperCaseObject(params),
            callback: function(request) {
                this.handleResponse(clickPosition, request, url);
            },
            scope: this
        };
}






