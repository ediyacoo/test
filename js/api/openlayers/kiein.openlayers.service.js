if(!window.kiein){window.kiein=function(){};}

kiein.service={
	//google geocoder
	Ggeocoder:(google.maps.Geocoder) ? new google.maps.Geocoder() : null,
	//google elevation service
	GelevationService: (google.maps.ElevationService) ? new google.maps.ElevationService() : null,
	//google direction service
	GdirectionsService: (google.maps.DirectionsService) ? new google.maps.DirectionsService() : null,
	//google direction rederer
	GdirectionRenderer: (google.maps.DirectionsRenderer) ? new google.maps.DirectionsRenderer() : null,
	WPS: new OpenLayers.WPSClient({
		        servers: {
		            opengeo: 'http://demo.opengeo.org/geoserver/wps',
		            localhost: "http://localhost:8080/geoserver/wps",
		            sgis: "http://sgis.kisr.edu.kw/geoserver/wps"
		        },
		        serverName:"localhost"
   	})
}



/**
 * @class
 * using Google Geocoding Engine to geocode address
 * @param {Object} address 地址
 * @param {Object} callback 傳回1. google.maps.LatLng; 2. Array <google.maps.GeocoderResult>; 3. google.maps.GeocoderStatus)
 */
kiein.service.geocodingAddress=function(address, callback){
				
				//use google engine
				useGoogle(address, callback);
				
				function useGoogle(address, callback){
					if(kiein.service.Ggeocoder){
						kiein.service.Ggeocoder.geocode({address:address}, function(results,status){
							if(status==google.maps.GeocoderStatus.OK){
								callback({x:results[0].geometry.location.lng(), y:results[0].geometry.location.lat()}, results, status);
							}else{
								console.log('[ERROR]kiein.geocoder error=' + status);
								callback(null,null, status)
							}
						});
					}else{
						callback(null, null, '[ERROR]kiein.service.geocoder: google.maps.Geocoder is not initilized! Please include GoogleMap3 API first: https://maps.googleapis.com/maps/api/js?sensor=false');
					}
				}
}






/**
 * @class
 * Buffer
 * Please make sure we added "http://sampleserver1.arcgisonline.com/arcgis/rest/services/Geometry/GeometryServer/buffer" into the OpenLayer.Proxy.py
 * @param {OpenLayers.Feature.Vector} OpenLayers.Feature.Vector. It must be in EPSG:4326 coordinate system
 * @param {String} distance. It can use ', ' to define multiple distance。e.g., 500, 1000
 * @param {Function} callback Function(OpenLayers.Feature.Vector)
 */
kiein.service.buffer=function(olFeature, distance, callback){
		if(!olFeature || !distance){
			callback(null, '[ERROR] kiein.service.buffer: no olFeature or distance!');
			return;
		}
		
			
		useArcgis(olFeature, distance, callback);
		
		
		function useArcgis(olFeature, distance, callback){
			//判斷geometry
			var geometries={},
				parseJSON=new OpenLayers.Format.JSON();
				
			geometries.geometries=[];
			
			//判斷goverlay
			if(olFeature.geometry instanceof OpenLayers.Geometry.Point){
				geometries.geometryType='esriGeometryPoint';
				geometries.geometries.push({x: olFeature.geometry.x, y: olFeature.geometry.y, spatialReference: {wkid:4326}});
			}
			if(olFeature.geometry instanceof OpenLayers.Geometry.LineString || olFeature.geometry instanceof OpenLayers.Geometry.Polygon){
				var array_latlng=[];
				
				$.each(olFeature.geometry.getVertices(), function(i, point){
					array_latlng.push([point.x, point.y]);
				});
				
				
				if(olFeature.geometry instanceof OpenLayers.Geometry.LineString){
					geometries.geometryType='esriGeometryPolyline';
					geometries.geometries.push({paths: [array_latlng]});
				}
				
				if(olFeature.geometry instanceof OpenLayers.Geometry.Polygon){
					var lastnode=olFeature.geometry.getVertices()[0];
					array_latlng.push([lastnode.x, lastnode.y]);
					
					geometries.geometryType='esriGeometryPolygon';
					geometries.geometries.push({rings: [array_latlng]});
				}
			}
			
			//post
			$.ajax({
				type:'POST',
				url: OpenLayers.ProxyHost + "http://sampleserver1.arcgisonline.com/arcgis/rest/services/Geometry/GeometryServer/buffer",
				data:{
					bufferSR:102113,
					distances: distance,
					f:"json",
					geometries: parseJSON.write(geometries),
					inSR: 4326,
					outSR: 4326,
					unionResults:true,
					unit: 9001
				},
				dataType:"json",
				failure: function(error){alert(error);},
				success: function(json){
					if(json.error){
						callback(null,json.error);
						return;
					}
					
					var rings=[];
					for(var i=0;i<json.geometries.length;i++){
						var ring=json.geometries[i].rings[0];
						var latlngs=[];
						for(var j=0;j<ring.length;j++){
							latlngs.push(new OpenLayers.Geometry.Point(ring[j][0], ring[j][1]));
						}
						rings.push(new OpenLayers.Geometry.LinearRing(latlngs));
					}
					
					var obj=new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Polygon(rings));
					callback(obj);
				}
			});
		}
}




/**
 * @class
 * 地形剖面圖服務
 * @param {Polyline} 設定google.maps.Polyline
 * @param {String} domID div的domID用來存放profile的圖
 * @param {Object} googleChartOptions 設定1. chartType:只有支援ColumnChart, AreaChart, LineChart; 
 * 										 2. width: 設定寬度, 預設500; 
 * 										 3. height: 設定高度, 預設350; 
 * 										 4. samples:設定sample數量; 
 * 										 5. useEngine: 設定哪種服務進行計算profile, 包括兩種engine: 'GOOGLE'（預設）, 'ARCGIS'
 * 										 6. callback: 回傳results, status
 * 										 7. callback_mouseover: 回傳graph event object, 包括e.column, e.row, e.feature (mouseover的位置及海拔高度)
 * @return {NONE} NONE
 */
kiein.service.profile=function(gPolyline, domID, chartOptions){
		if(!(gPolyline instanceof google.maps.Polyline)){
			callback(null, '[ERROR] Profile所輸入的gPolyline錯誤');
			return;
		}
		
		if(!domID || domID==""){
			console.log('[ERROR]Profile: domID並未設定，請重新設定！');
			return;
		}
		
		if(!chartOptions){
			chartOptions={
				useEngine:'GOOGLE',
				googleChartType:"AreaChart",
				width:500,
				height:350,
				samples:25,
				callback:null,
				callback_mouseover:null,
				callback_mouseout:null
			}
		}
		
		//預設參數
		chartOptions.useEngine=chartOptions.useEngine || 'GOOGLE';
		chartOptions.googleChartType=chartOptions.googleChartType || 'AreaChart';
		chartOptions.width=chartOptions.width || 500;
		chartOptions.height=chartOptions.height || 350;
		chartOptions.samples=chartOptions.samples||25;
		chartOptions.callback=chartOptions.callback || null;
		chartOptions.callback_mouseover=chartOptions.callback_mouseover || null;
		chartOptions.callback_mouseout=chartOptions.callback_mouseout || null;
		
		//執行
		switch(chartOptions.useEngine){
			case "GOOGLE": useGoogle(gPolyline, chartOptions.callback);break;
			case "ARCGIS": useArcgis(gPolyline, chartOptions.callback);break;
			default: console.log('[ERROR]Profile: 目前不支援'+chartOptions.useEngine+', 只支援GOOGLE and ARCGIS, 請重新輸入');return; break;
		}
		
		
		function useArcgis(gPolyline, callback){	
			makoci.service.measureLength(gPolyline, function(result, error){
				if(error){callback(null, error); return;}
				
				//長度必須小於1000000公尺
				if(result.length.toFixed(4)<=1000000){
					//geometry
					var latlng;
					var array_latlng=[];
					
					gPolyline.getPath().forEach(function(latlng, i){
						array_latlng.push([latlng.lng(), latlng.lat()]);
					});
					
					var feature={};
					feature.geometry = {
						paths: [array_latlng],
						spatialReference: {wkid: 4326}
					};
					
					var featureset={};
					featureset.features=[];
					featureset.features.push(feature);
					featureset.spatialReference={wkid: 4326};			
					
					var parseJSON=new makoci.util.JSON();
		
					//post
					$.ajax({
						type:'POST',
						url: makoci.service.proxy + "?" + "http://sampleserver2.arcgisonline.com/ArcGIS/rest/services/Elevation/ESRI_Elevation_World/GPServer/ProfileService/execute",
						data:{
							Display_Segments:true,
							Image_Height: 250,
							Image_width: 500,
							Input_Polylines:parseJSON.toJSON(featureset),
							outSR: 4326,
							f: "json"
						},
						dataType:"json",
						failure: function(error){alert(error);},
						success: function(json){
							if(json.error){
								callback(json,json.error);
								return;
							}
							
							//將img src html寫入user指定的domID中
							$('#'+domID).html('<img src="' + json.results[0].value.features[0].attributes.profileURL + '" />');
							
							if(chartOptions.callback){
								chartOptions.callback(json,null);
							}
						}
					});	
				}else{
					if(chartOptions.callback){
						chartOptions.callback(null,status);
						return;
					}
				}
			});
		}
		
		
		/**
		 * 透過google的elevationService制作profile
		 * @param {Object} gPolyline
		 * @param {Object} callback
		 */
		function useGoogle(gPolyline, callback){
			//由於會透過google.visualization繪製chart
			//因此必須先check有無此lib, 如果沒有的話 就要load	
			if(typeof(google.visualization)=='undefined'){
				$.getScript("https://www.google.com/jsapi", function(){
					//似乎用googel.load會有問題
					//google.load('visualization', '1', {packages: ['corechart']});
					$.getScript('https://www.google.com/uds/api/visualization/1.0/d7d36793f7a886b687850d2813583db9/format+zh_TW,default,table,corechart.I.js',function(){
						next();
					});
				});	
			}else{
				next();
			}
			
			function next(){
				var request={
					path:gPolyline.getPath().getArray(),
					samples:chartOptions.samples
				};
				
				//elevationService
				kiein.service.GelevationService.getElevationAlongPath(request, function(results, status){
					//results.length is always 25 sample points
					if(status==google.maps.ElevationStatus.OK){
						
						//draw
						var div=document.getElementById(domID);
				
						//判斷chart type
						var chart;
						switch(chartOptions.googleChartType){
							case "ColumnChart":chart=new google.visualization.ColumnChart(div);break;
							case "AreaChart":chart=new google.visualization.AreaChart(div);break;
							case "LineChart":chart=new google.visualization.LineChart(div);break;
						}
						
						//繪圖
						var data = new google.visualization.DataTable();
			            data.addColumn('string', 'Sample');
			            data.addColumn('number', 'Elevation');
			            for (var i = 0; i < results.length; i++) {
			              data.addRow(['', results[i].elevation]);
			            }
			
			            // Draw the chart using the data within its DIV.
			            chart.draw(data, {
			              width: chartOptions.width,
			              height: chartOptions.height,
			              legend: 'none',
			              titleY: 'Elevation (m)'
			            });	
			            
			          	//mouseover callback
			           	if(chartOptions.callback_mouseover){
			            	google.visualization.events.addListener(chart, 'onmouseover', function(e){
			            		e.value=results[e.row];
			            		chartOptions.callback_mouseover(e);
			            	});
			            }
			            
			            //mouseout callback
			           	if(chartOptions.callback_mouseout){
			            	google.visualization.events.addListener(chart, 'onmouseout', function(e){
			            		e.value=results[e.row];
			            		chartOptions.callback_mouseout(e);
			            	});
			            }
			            
			           
					}
					
					//callback
					if(chartOptions.callback){
						chartOptions.callback(results, status);
					}
						
				});
			}
		}//end usegoogle()
}






/**
 * @class
 * drawGoogleChart use Google Chart API to draw openlayer.features 
 * @param {Object} olFeatures  		OpenLayers.Feature.Vector
 * @param {Array} charts			Array of Object, {googleChartWrapperOptions: please refer to Google Chart API, callback: callback function, callback_mouseover: callback while mouse moving over the chart, callback_mouseout: callback while mouse moving out the chart
 * 									For example:  	
 * 									{googleChartWrapperOptions: {
										chartType: type,
										containerId: "chart_" + type,
										//view:{columns:[0,1]},
										options: {
											width: $("#infoWidget").width() / 2.8,
											height: 350,
											title: "Area v.s. Landuse Type",
											titleX: "X",
											titleY: "Y",
											legend: ""
										}
									 },
									 callback:null,
									 callback_mouseover:null,
									 callback_mouseout:null
									}
 * @param {Array} ? limited_columns	only read limited fields (columns) in OpenLayers.Feature.Vector attribute
 * @param {Array} ? controlsOptions	{dashBoardDomID:'', googleChartControlWrappers: [googleChartControlWrapper]}
 * 									For example:
 * 									{	dashBoardDomID: "infoContent_spatialquery",
										googleChartControlWrappers:[
											{ 'controlType': 'NumberRangeFilter',
									          'options': {
									            'filterColumnLabel': 'SHAPE_AREA',
									          	'ui': {'labelStacking': ''}
											  }
									        },
									        { 'controlType': 'CategoryFilter',
									          'options': {
									            'filterColumnLabel': 'CATEGORIES',
									          	'ui': {'labelStacking': '','allowTyping': false,'allowMultiple': false}
											  }
									        }
										]
									}
 */
kiein.service.drawGoogleChart=function(olFeatures, charts, limited_columns, controlsOptions){
	if(!olFeatures || !charts){
		console.log("[ERROR]kiein.service.drawGoogleChart: olFeatures, charts are not set!");
		return;
	}
	
	if(!olFeatures instanceof OpenLayers.Feature.Vector){
		console.log("[ERROR]kiein.service.drawGoogleChart: OpenLayers.Feature.Vector needed!");
		return;
	}
	
	
	//data for drawing
	var values=[],
		columns=[],
		rows=[];
	if(limited_columns){values[0]=limited_columns};
	
	$.each(olFeatures, function(i,feature){
		rows=[];
		
		//read column and rows
		if(limited_columns){
			$.each(limited_columns, function(j,obj){
				rows.push(feature.attributes[obj]);	
			});	
		}else{
			$.each(feature.attributes, function(k,v){
				if(i==0){columns.push(k);}
				rows.push(v);
			});
			
		}
		
		if(!values[0]){values.push(columns);}
		values.push(rows);
	});	
	var data = new google.visualization.arrayToDataTable(values);
	
	
	//determine google chart lib
	//由於會透過google.visualization繪製chart
	//因此必須先check有無此lib, 如果沒有的話 就要load	
	if(typeof(google.visualization)=='undefined'){
		$.getScript("https://www.google.com/jsapi", function(){
			//似乎用googel.load會有問題
			//google.load('visualization', '1', {packages: ['corechart']});
			$.getScript('https://www.google.com/uds/api/visualization/1.0/d7d36793f7a886b687850d2813583db9/format+zh_TW,default,table,corechart.I.js',function(){
				draw();
			});
		});	
	}else{
		draw();
	}
	
	
	//draw
	function draw(){
		var gChart, chartType, containerID;
		var gCharts=[];
		
		$.each(charts, function(i, chart){
			if (!chart.googleChartWrapperOptions) {
				console.log("[ERROR]kiein.service.drawGoogleChart: no googleChartWrapperOptions!");
				return;
			}
			if (!chart.googleChartWrapperOptions.chartType) {
				console.log("[ERROR]kiein.service.drawGoogleChart: no googleChartWrapperOptions.chartType!");
				return;
			}
			if (!chart.googleChartWrapperOptions.containerId) {
				console.log("[ERROR]kiein.service.drawGoogleChart: no googleChartWrapperOptions.containerId!");
				return;
			}
			
			//chart options
			chart.loadingImage = chart.loadingImage || "images/loading.gif";
			chart.loadingImage_width = chart.loadingImage_width || "25px";
			chart.callback = chart.callback || null;
			chart.callback_mouseover = chart.callback_mouseover || null;
			chart.callback_mouseout = chart.callback_mouseout || null;
			chart.googleChartWrapperOptions.options.width = chart.googleChartWrapperOptions.options.width || 500;
			chart.googleChartWrapperOptions.options.height = chart.googleChartWrapperOptions.options.height || 350;
			chart.googleChartWrapperOptions.options.title = chart.googleChartWrapperOptions.options.title || "";
			chart.googleChartWrapperOptions.options.titleX = chart.googleChartWrapperOptions.options.titleX || "X";
			chart.googleChartWrapperOptions.options.titleY = chart.googleChartWrapperOptions.options.titleY || "Y";
			chart.googleChartWrapperOptions.options.legend = chart.googleChartWrapperOptions.options.legend || "";
			chart.googleChartWrapperOptions.options.is3D = chart.googleChartWrapperOptions.options.is3D || true;
			
			chartType = chart.googleChartWrapperOptions.chartType;
			containerID = chart.googleChartWrapperOptions.containerId;
			
			//show loading image
			$("#" + containerID).html("<img src='" + chart.loadingImage + "' width='" + chart.loadingImage_width + "' />");
			
			containerID = document.getElementById(containerID);
			
			//draw
			if(!controlsOptions){
				switch (chartType) {
					case "ColumnChart":gChart = new google.visualization.ColumnChart(containerID);break;
					case "AreaChart":gChart = new google.visualization.AreaChart(containerID);break;
					case "LineChart":gChart = new google.visualization.LineChart(containerID);break;
					case "PieChart":gChart = new google.visualization.PieChart(containerID);break;
					case "BarChart":gChart = new google.visualization.BarChart(containerID);break;
					case "BubbleChart":gChart = new google.visualization.BubbleChart(containerID);break;
					case "CandlestickChart":gChart = new google.visualization.CandlestickChart(containerID);break;
					case "MotionChart":gChart = new google.visualization.MotionChart(containerID);break; //muse include  google.load('visualization', '1', {packages: ['motionchart']});
					case "Table":gChart = new google.visualization.Table(containerID);break; //muse include google.load('visualization', '1', {packages: ['table']});
				}
				gChart.draw(data, chart.googleChartWrapperOptions.options);
					
				//mouseover callback
				if (chart.callback_mouseover) {
					google.visualization.events.addListener(gChart, 'onmouseover', function(e){
						e.value = olFeatures[e.row];
						chart.callback_mouseover(e);
					});
				}
					
				//mouseout callback
				if (chart.callback_mouseout) {
					google.visualization.events.addListener(gChart, 'onmouseout', function(e){
						e.value = olFeatures[e.row];
						chart.callback_mouseout(e);
					});
				}
					
				//callback
				if (chart.callback) {
					chart.callback();
				}
				
			//if controlsOptions
			}else{
				var gChart=new google.visualization.ChartWrapper(chart.googleChartWrapperOptions);
			
				//mouseover callback
				if(chart.callback_mouseover){
				      google.visualization.events.addListener(gChart, 'ready', function(){
				      	  google.visualization.events.addListener(gChart.getChart(), 'onmouseover', function(e){
							  e.value=olFeatures[e.row];
				          	  chart.callback_mouseover(e);
				      	  });
				      });
				}
				            
				//mouseout callback
				if(chart.callback_mouseout){
				       google.visualization.events.addListener(gChart, 'ready', function(){
				       	  google.visualization.events.addListener(gChart.getChart(), 'onmouseout', function(e){
				              e.value=olFeatures[e.row];
				              chart.callback_mouseout(e);
				       	  });
				       });
				}
				
				gCharts.push(gChart);
			}
		});
		
	
		
		//controlOptions
		if(controlsOptions){
			if(!controlsOptions.dashBoardDomID){console.log("[ERROR]kiein.service.drawGoogleChart: dashBoardDomID is needed!!");return;}
			if(!controlsOptions.googleChartControlWrappers){console.log("[ERROR]kiein.service.drawGoogleChart: googleChartControlWrappers is needed!!");return;}
			
			var controls=[];
			$.each(controlsOptions.googleChartControlWrappers, function(i, control){
				if(!control.controlType){console.log("[ERROR]kiein.service.drawGoogleChart: needed googleChartControlWrapper.controlType");return;}
				controls.push(new google.visualization.ControlWrapper(control));
			});

			// Create the dashboard.
		  	new google.visualization.Dashboard(document.getElementById(controlsOptions.dashBoardDomID)).bind(controls, gCharts).draw(data);
		}
	
	}
}






/**
 * use Google Place API to perform local search
 * @param {String} google_api
 * @param {String} location The latitude/longitude around which to retrieve Place information. This must be specified as latitude,longitude.
 * @param {Number} radius Defines the distance (in meters) within which to return Place results. The maximum allowed radius is 50 000 meters. Note that radius must not be included if rankby=distance (described under Optional parameters below) is specified.
 * @param {Boolean} sensor  Indicates whether or not the Place request came from a device using a location sensor (e.g. a GPS) to determine the location sent in this request. This value must be either true or false.
 * @param {Object} options Google Place API optional parameters, including keyword, language, name, types, rankby, pagetoken
 * @param {Function} callback_function the json result will be return by the function.
 */
kiein.service.googleLocalSearch=function(google_api, location, radius, sensor, options, callback_function){
	if(!google_api || !location || !callback_function){
		console.log("[ERROR] kiein.service.googleLocalSearch: no Google API, location, callback_function are specified!");
		return;
	}
	
	if(!OpenLayers.ProxyHost){console.log("[ERROR] kiein.service.googleLocalSearch: no OpenLayers.ProxyHost!!");return;}
	
	if(!sensor || !sensor instanceof Boolean){sensor=false;}	
	if(!radius || !radius instanceof Number){radius=500;}
	if(!options || !options instanceof Object){options={}}
	

	var url="https://maps.googleapis.com/maps/api/place/nearbysearch/json?key=" + google_api + "&location=" + location + "&sensor=" + sensor;
	if(options.rankby){url+="&rankby="+options.rankby}else{url+="&radius="+radius}
	if(options){
		$.each(options, function(e,v){
			url+="&"+e+"="+v;
		})
	}
	
	$.getJSON(OpenLayers.ProxyHost+encodeURIComponent(url), function(json){
		callback_function(json);
	});
}





/**
 * Route
 * @class
 * @param {String} from Start location, could be an address or 'latitude, longitude'
 * @param {String} to End location, could be an address or 'latitude, longitude'
 * @param {String} travelType including: BICYCLING, WALKING, TRANSIT, DRIVING
 * @param {Object} options {domID: DOM ID for the result, 
 * 							callback: function(google.maps.DirectionsResult, google.maps.DirectionsStatus)}
 */
kiein.service.route=function(from, to, travelType, options){
			if(! from || !to){
				console.log('[ERROR] kiein.service.route: no FROM and TO.');
				return;
			}		
		
			useGoogle(from, to, travelType, options);
			
			
			function useGoogle(from, to, travelType, options){
				var div_id, callback;
				if(options){
					if(options.domID){div_id=options.domID};
					if(options.callback){callback=options.callback};
				}

				//travelType
				switch(travelType){
					case "BICYCLING": travelType= google.maps.DirectionsTravelMode.BICYCLING; break;
					case "WALKING": travelType= google.maps.DirectionsTravelMode.WALKING; break;
					case "DRIVING": travelType= google.maps.DirectionsTravelMode.DRIVING; break;
					case "TRANSIT": travelType= google.maps.DirectionsTravelMode.TRANSIT; break;
				}
				
				//route
				var request = {
		          origin: from, 
		          destination: to,
		          travelMode: travelType
		        };
				
				kiein.service.GdirectionsService.route(request, function(response, status){
					if (status == google.maps.DirectionsStatus.OK) {
			            kiein.service.GdirectionRenderer.setDirections(response);
						
						//將reponse結果顯示回前端
						if(div_id){kiein.service.GdirectionRenderer.setPanel(document.getElementById(div_id));}
			        }
					
					//或者傳回response
					if(callback){callback(response, status)}
				});
			}
}




/**
 * @class
 * WPSBuffer
 * using WPS buffer process to do a buffer function. all inputs features should be in the same crs
 * @param {[OpenLayers.Feature.Vector]} featureCollection
 * @param {Double} distance
 * @param {Funtion} callback callback function(output)
 */
kiein.service.WPSbuffer=function(featureCollection, distance, callback){
	if(!featureCollection || ! distance || !callback){console.log("[ERROR] kiein.service.WPSbuffer: no featureCollection or distance or callback"); return;}
	
	//wps process
	var process=kiein.service.WPS.getProcess(kiein.service.WPS.serverName, 'gs:BufferFeatureCollection');

	process.execute({
		inputs:{
			"distance":parseFloat(distance),
			"features":featureCollection
		},
		success: callback
	});
}



/**
 * @class WPSclip
 * using WPS clip to process a clip function. all inputs features should be in the same crs
 * @param {[OpenLayers.Feature.Vector] or OpenLayers.WPSProcess.Reference} featureCollection
 * @param {OpenLayers.Feature.Vector} clipFeature
 * @param {Function} callback callback function(output)
 */
kiein.service.WPSclip=function(featureCollection, clipFeature, callback){
	if(!featureCollection || !clipFeature || !callback){console.log("[ERROR] kiein.service.WPSclip: no featureCollection, clipFeature, or callback"); return;}
	
	//wps process
	var process=kiein.service.WPS.getProcess(kiein.service.WPS.serverName, 'gs:Clip');

	process.execute({
		inputs:{
			"clip": clipFeature,
			"features": featureCollection
		},
		success: callback
	});
}



/**
 * @class WPSintersection
 * using WPS intersection to process a intersection function. all inputs features should be in the same crs
 * @param {[OpenLayers.Feature.Vector] or OpenLayers.WPSProcess.Reference} featureCollection
 * @param {[OpenLayers.Feature.Vector] or OpenLayers.WPSProcess.Reference} intersectionFeature
 * @param {Function} callback callback function(output)
 */
kiein.service.WPSintersection=function(featureCollection, intersectionFeatureCollection, callback){
	if(!featureCollection || !intersectionFeatureCollection || !callback){console.log("[ERROR] kiein.service.WPSintersection: no featureCollection, intersectionFeatureCollection, or callback"); return;}
	
	//wps process
	var process=kiein.service.WPS.getProcess(kiein.service.WPS.serverName, 'gs:IntersectionFeatureCollection');

	process.execute({
		inputs:{
			"first feature collection": intersectionFeatureCollection,
			"second feature collection": featureCollection
		},
		success: callback
	});
}



/**
 * @class WPSquery
 * using WPS query to process a query function. all inputs features should be in the same crs
 * @param {[OpenLayers.Feature.Vector] or OpenLayers.WPSProcess.Reference} featureCollection
 * @param {String} queryString SQL format
 * @param {Function} callback function(output)
 */
kiein.service.WPSquery=function(featureCollection, queryString, callback){
	if(!featureCollection || !queryString || !callback){console.log("[ERROR] kiein.service.WPSquery: no featureCollection, queryString, or callback"); return;}
	
	//wps process
	var process=kiein.service.WPS.getProcess(kiein.service.WPS.serverName, 'gs:Query');

	process.execute({
		inputs:{
			"features": featureCollection,
			"filter": queryString
		},
		success: callback
	});
}



/**
 * @class WPSnearest
 * using WPS query to process a nearest function. all inputs features should be in the same crs
 * @param {[OpenLayers.Feature.Vector] or OpenLayers.WPSProcess.Reference} featureCollection
 * @param {OpenLayers.Feature} point
 * @param {Function} callback function(output)
 */
kiein.service.WPSnearest=function(featureCollection, point, callback){
	if(!featureCollection || !point || !callback){console.log("[ERROR] kiein.service.WPSquery: no featureCollection, point, or callback"); return;}
	
	//wps process
	var process=kiein.service.WPS.getProcess(kiein.service.WPS.serverName, 'gs:Nearest');

	process.execute({
		inputs:{
			"features": featureCollection,
			"point": point
		},
		success: callback
	});
}



/**
 * @class WPSreproject
 * using WPS query to process a reproject function. all inputs features should be in the same crs
 * @param {[OpenLayers.Feature.Vector] or OpenLayers.WPSProcess.Reference} featureCollection
 * @param {String} from_crs eg: "EPSG:4326"
 * @param {String} to_crs eg: "EPSG:4326"
 * @param {Function} callback function(output)
 */
kiein.service.WPSreproject=function(featureCollection, from_crs, to_crs, callback){
	if(!featureCollection || !from_crs || !to_crs || !callback){console.log("[ERROR] kiein.service.WPSquery: no featureCollection, from_crs, to_crs, or callback"); return;}
	
	//wps process
	var process=kiein.service.WPS.getProcess(kiein.service.WPS.serverName, 'gs:Reproject');

	process.execute({
		inputs:{
			"features": featureCollection,
			"forcedCRS": from_crs,
			"targetCRS": to_crs
		},
		success: callback
	});
}




/**
 * @class WPSsimplify
 * using WPS  to process a geometry simplify function. all inputs features should be in the same crs
 * @param {[OpenLayers.Feature.Vector] or OpenLayers.WPSProcess.Reference} featureCollection
 * @param {Number} distance Simplification distance tolerance, in units of the input geometry
 * @param {Function} callback function(output)
 */
kiein.service.WPSsimplify=function(featureCollection, distance, callback){
	if(!featureCollection || !distance || !callback){console.log("[ERROR] kiein.service.WPSsimplify: no featureCollection, distance, or callback"); return;}
	
	//wps process
	var process=kiein.service.WPS.getProcess(kiein.service.WPS.serverName, 'gs:Simplify');

	process.execute({
		inputs:{
			"features": featureCollection,
			"distance": distance,
			"preserveTopology":true
		},
		success: callback
	});
}




/**
 * @class WPSvectorZonalStatistics
 * Computes statistics for the distribution of a given attribute in a set of polygonal zones. Input must be points.
 * @param {[OpenLayers.Feature.Vector] or OpenLayers.WPSProcess.Reference} pointFeatureCollection Input collection of point features
 * @param {String} attributeName dataAttribute from pointFeatureCollection to use for computing statistics
 * @param {[OpenLayers.Feature.Vector] or OpenLayers.WPSProcess.Reference} polygonFeatureCollection Zone polygon features for which to compute statistics
 * @param {Function} callback function(output)
 */
kiein.service.WPSvectorZonalStatistics=function(pointFeatureCollection, attributeName, polygonFeatureCollection, callback){
	if(!pointFeatureCollection || !polygonFeatureCollection || !attributeName || !callback){console.log("[ERROR] kiein.service.WPSvectorZonalStatistics: no pointFeatureCollection, polygonFeatureCollection,  attributeName or callback"); return;}

	//wps process
	var process=kiein.service.WPS.getProcess(kiein.service.WPS.serverName, 'gs:VectorZonalStatistics');

	process.execute({
		inputs:{
			"data": pointFeatureCollection,
			"dataAttribute": attributeName,
			"zones":polygonFeatureCollection
		},
		success: callback
	});
}



