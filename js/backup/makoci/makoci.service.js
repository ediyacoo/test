/**
 * @author ediyacoo 2011.12.08
 * 針對iSDSS的基本分析功能，
 * 包括：geocoding, reverse geocoding, network, terrain profile, buffer, 
 * 2011/12/15: 增加介接taipei open data 在geocoding和locateMyPlace當中
 */

if (!window.makoci) {
	window.makoci = function(){};
} 

/**
 * 提供基本的空間服務功能
 */
makoci.service=function(){};



//設定makoci的proxy
makoci.service.proxy='../proxy/proxy.ashx';
//makoci.service.proxy='http://www.makoci.com/proxy';



/**
 * @class
 * geocoding 地址對位服務
 * @param {Object} address 地址
 * @param {Object} callback 傳回1. google.maps.LatLng; 2. Array <google.maps.GeocoderResult>; 3. google.maps.GeocoderStatus)
 */
makoci.service.geocodingAddress=function(address, callback){
				
				//預設是用google來做geocoding
				useGoogle(address, callback);
				
				function useGoogle(address, callback){
					if(makoci.geocoder){
						makoci.geocoder.geocode({address:address}, function(results,status){
							if(status==google.maps.GeocoderStatus.OK){
								callback(results[0].geometry.location, results, status);
							}else{
								console.log('[ERROR]makoci.geocoder error=' + status);
								callback(null,null, status)
							}
						});
					}else{
						callback(null, null, '[ERROR]makoci.geocoder(google.maps.Geocoder)尚未init!');
					}
				}
}
			
	
	
/**
 * 路徑規劃服務
 * @class
 * @param {String} from 起點，可以是地址的字串，或者是"緯度, 經度 "的字串
 * @param {String} to 終點，可以是地址的字串，或者是"緯度, 經度"的字串
 * @param {String} travelType 包括BICYCLING, WALKING, TRANSIT, DRIVING
 * @param {Object} options。包含options.domID 路徑規劃結果，傳回至此DOM ID當中; 或者options.callback將路徑規劃的結果傳回reponse和status
 */
makoci.service.route=function(from, to, travelType, options){
			if(! from || !to){
				console.log('[ERROR] makoci.service.route發生錯誤，並未給予from, to參數');
				return;
			}		
		
			useGoogle(from, to, travelType, options);
			
			
			function useGoogle(from, to, travelType, options){
				var div_id, callback;
				if(options){
					if(options.domID){div_id=options.domID};
					if(options.callback){callback=options.callback};
				}
			
				if(!from || !to){
					alert('請重新輸入from and to位置');
					return;
				}
				
				//判斷travelType
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
				
				makoci.directionsService.route(request, function(response, status){
					if (status == google.maps.DirectionsStatus.OK) {
			            makoci.directionsDisplay.setDirections(response);
						
						//將reponse結果顯示回前端
						if(div_id){makoci.directionsDisplay.setPanel(document.getElementById(div_id));}
			        }
					
					//或者傳回response
					if(callback){callback(response, status)}
				});
			}
}
	
	



/**
 * @class
 * 測量長度
 * @param {GPolyline} gPolyline
 * @param {function} callback 傳回object，包含object.length長度以及object.lengthUnit單位(目前只支援公尺)。
 */
makoci.service.measureLength=function(gPolyline, callback){
		if(!(gPolyline instanceof google.maps.Polyline)){
			callback(null, '[ERROR]測量長度未輸入正確的GPolyline物件');
			return;
		}
	
		useArcgis(gPolyline, callback);
		
		function useArcgis(gPolyline,callback){
			//將經緯度轉換持平面座標 meter
			var array_meter=[],
				latlng, meter,
				coord=new makoci.util.coordinate(),
				parseJSON=new makoci.util.JSON();
			
			
			gPolyline.getPath().forEach(function(latlng, i){
				meter=coord.latlngToMeter(latlng.lat(), latlng.lng());
				array_meter.push([meter.x, meter.y]);
			});
			
			var polylines=[];
			polylines.push({paths: [array_meter]});
			
			//makoci.util.JSON是用來將object變成json字串, initilized in makoci.util.js
			$.getJSON('http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer/lengths?f=json&polylines=' + parseJSON.toJSON(polylines) + '&sr=102113&callback=?', function(json){
				if(json.error){
					callback(null, json.error);
					return;
				}
				
				var obj={};
				obj.length=json.lengths[0];
				obj.lengthUnit='meter';
				
				callback(obj);
			});
		}
		
}//end mesureLength
	


/**
 * 測量面積
 * @class
 * @param {Polygon} gPolygon 傳入google.maps.Polygon
 * @param {function} callback 將傳回object.area, object.perimeter, object.areaUnit, object.lengthUnit
 */
makoci.service.measureArea=function(gPolygon, callback){
		if(!(gPolygon instanceof google.maps.Polygon)){
			callback(null,'[ERROR]測量面積未輸入正確的GPolygon物件')
			return;
		}
		
		useArcgis(gPolygon, callback);
		
		
		function useArcgis(gPolygon, callback){
			//將經緯度轉換持平面座標 meter
			var array_meter=[],
				latlng, meter,
				coord=new makoci.util.coordinate(),
				parseJSON=new makoci.util.JSON();
			
			gPolygon.getPaths().forEach(function(path, i){
				path.forEach(function(latlng,j){
					meter=coord.latlngToMeter(latlng.lat(), latlng.lng());
					array_meter.push([meter.x, meter.y]);
				});
			});
			
			var polygons=[];
			polygons.push({rings: [array_meter]});
		
			//__makoci_json是makoci.util.JSON是用來將object變成json字串, initilized in makoci.util.js
			$.getJSON('http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer/areasAndLengths?f=json&polygons=' + parseJSON.toJSON(polygons) + '&sr=102113&callback=?', function(json){
				if(json.error){
					callback(null, json.error);
					return;
				}
				
				var obj={};
				obj.area=Math.abs(parseFloat(json.areas[0]));
				obj.perimeter=Math.abs(parseFloat(json.lengths[0]));
				obj.areaUnit='squre meter';
				obj.lengthUnit='meter';
				callback(obj);
			});
		}
}
	
	

/**
 * @class
 * 使用環域分析服務
 * @param {GOverlay} goverlay 限定google.maps.LatLng, google.maps.Marker, google.maps.Polyline, google.maps.Polygon
 * @param {String} distance Buffer的距離。可用', '區隔多個距離。譬如：500, 1000
 * @param {Function} callback 傳回makociFeature
 */
makoci.service.buffer=function(goverlay, distance, callback){
		if(!goverlay || !distance){
			callback(null, '[ERROR] Buffer輸入參數不完整，請重新輸入！');
			return;
		}
		
		useArcgis(goverlay, distance, callback);
		
		
		function useArcgis(goverlay, distance, callback){
			//判斷geometry
			var geometries={},
				parseJSON=new makoci.util.JSON();
				
			geometries.geometries=[];
			
			//判斷goverlay
			if(goverlay instanceof google.maps.LatLng){
				geometries.geometryType='esriGeometryPoint';
				geometries.geometries.push({x: goverlay.lng(), y: goverlay.lat(), spatialReference: {wkid:4326}});
			}
			if(goverlay instanceof google.maps.Marker){
				geometries.geometryType='esriGeometryPoint';
				geometries.geometries.push({x: goverlay.getPosition().lng(), y: goverlay.getPosition().lat(), spatialReference: {wkid:4326}});
			}
			if(goverlay instanceof google.maps.Polyline || goverlay instanceof google.maps.Polygon){
				var array_latlng=[];
				
				if(goverlay instanceof google.maps.Polyline){
					goverlay.getPath().forEach(function(latlng,i){
						array_latlng.push([latlng.lng(), latlng.lat()]);
					});
					
					geometries.geometryType='esriGeometryPolyline';
					geometries.geometries.push({paths: [array_latlng]});
				}
				
				if(goverlay instanceof google.maps.Polygon){
					goverlay.getPaths().forEach(function(path,i){
						path.forEach(function(latlng,j){
							array_latlng.push([latlng.lng(), latlng.lat()]);
						});
					});
					
					geometries.geometryType='esriGeometryPolygon';
					geometries.geometries.push({rings: [array_latlng]});
				}
			}
			
			//post
			$.ajax({
				type:'POST',
				url: makoci.service.proxy + "?" + "http://sampleserver1.arcgisonline.com/arcgis/rest/services/Geometry/GeometryServer/buffer",
				data:{
					bufferSR:102113,
					distances: distance,
					f:"json",
					geometries: parseJSON.toJSON(geometries),
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
					
					var obj=new makoci.Feature();
					for(var i=0;i<json.geometries.length;i++){
						var ring=json.geometries[i].rings[0];
						var latlngs=[];
						for(var j=0;j<ring.length;j++){
							latlngs.push(new google.maps.LatLng(ring[j][1], ring[j][0]));
						}
						obj.gLatLngs=latlngs;
						obj.gOverlays.push(makoci.util.createPolygon(latlngs));
					}
					//console.log(obj);
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
makoci.service.profile=function(gPolyline, domID, chartOptions){
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
		 * !!原本希望useGoogle能回傳googleChart，但是似乎會卡在load google.visualization library的問題，因此尚未解決！！！
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
				makoci.elevationService.getElevationAlongPath(request, function(results, status){
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
 * 執行iWant功能
 * @class
 * @param {DOM ID} div_id 傳入DOM Select的id, 自動讀取資料庫中的資料，做為受詞的 下拉式選單的value
 */
makoci.service.iWant=function(div_id){
		//load object list載入object的資料
		if(!div_id || div_id==""){
			console.log('[ERROR]必須輸入DOM ID於iWant class中!');
			return;
		}
		loadObjectList(div_id);
		
		
		this.num=1;
		
		/**
		 * @private
		 * @param {Object} id
		 */
		function loadObjectList(id){
			var that=this;
			$.getJSON('http://www.makoci.com/ws/makoci/iwant/objects?callback=?', function(json){
				that.objectList=json;
				
				var html="";
				for(var i=0;i<json.length;i++){
					html+="<option value='" + json[i].uuid + "'>"+ json[i].name + "</option>";
				}
				$("#"+id).html(html);
			});
		}
		
		
		
		/**
		 * 設定iWant的主詞，給定geojson
		 * @param {Object} geojson
		 */
		this.setSubject=function(geojson){
			this.subject=geojson;
		}
		
		/**
		 * 讀取iWant的主詞，格式為geojson
		 * @return {Object} geojson
		 */
		this.getSubject=function(){
			return this.subject;
		}
		
		/**
		 * 給定iWant的關係 格式為json, 包括：type{near / within / intersect}, value, unit
		 * @param {Object} json
		 */
		this.setRelation=function(json){
			this.relation=json;
		}
		
		/**
		 * 讀取iWant的關係，格式為json
		 * @return {Object} json
		 */
		this.getRelation=function(){
			return this.relation;
		}
		
		/**
		 * 給定iWant的受詞，
		 * @param {String} id
		 */
		this.setObject=function(id){
			this.object=id;
		}
		
		/**
		 * 讀取iWant的受詞
		 * @return {String} id
		 */
		this.getObject=function(){
			return this.object;
		}
		
		/**
		 * 依據給定的主詞、關係以及受詞，執行iWant的查詢功能
		 * @param {Function} callback(obj)透過geojson的格式傳回至callback function中
		 */
		this.query = function(callback){
			var parseJSON=new makoci.util.JSON();
			
			//post 會有crossdomain的問題，要注意
			$.post(
				"http://www.makoci.com/ws/makoci/iwant/query",
				{subject: parseJSON.toJSON(this.subject), relation: parseJSON.toJSON(this.relation), object: this.object},
				function(data){callback(data);},
				"json"
			);
			
			
			//test
//			$.getJSON('json/point.json', function(json){
//				callback(json);
//			});
			
			//json callback
//			$.getJSON('http://www.makoci.com/iwant/query?subject=' + parseJSON.toJSON(this.subject) + "&relation=" + parseJSON.toJSON(this.relation) + "&object=" + this.object + "&callback=?",function(geojson){
//				callback(geojson);
//			});
		}
		
		
		/**
		 * 將query結果的feature傳回
		 * @param {Object} features
		 */
		this.setQueryResult = function(result){
			this.queryResult=result;
		}
}
	


/**
 * 將經緯度的座標，找出最近的地址
 * @param {GLatLng} latlng
 * @param {Function} callback callback(address, error) 回傳此經緯度的最近地址
 */
makoci.service.reverseGeocoding=function(latlng, callback){
		makoci.geocoder.geocode({location:latlng}, function(results, status){
			console.log(results);
			if (status == google.maps.GeocoderStatus.OK) {
				//取最精細的
				callback(results[0].formatted_address);
			}else{
				callback(null);
			}
		});
}
	
	
	
	
/**
 * 透過topocoding api抓取某一點的地形高度
 * @param {GLatLng} latlng
 * @param {Function} callback callback(altitude, error)回傳此點的地形高度值，以及錯誤（如果有的話）
 */
makoci.service.elevation=function(point, callback){
		if(!(point instanceof google.maps.LatLng || point instanceof google.maps.Marker) || !point){
			console.log('[ERROR]point設定錯誤，只接受latlng or marker, 請重新設定')
			return;
		}
		
		var latlng;
		if(point instanceof google.maps.LatLng){
			latlng=point;
		}else{
			latlng=point.getPosition();
		}
		
		
		//use3rdParty(latlng, callback);
		useGoogle(latlng, callback);
		
		
		/**
		 * @private
		 * 但是由於http://topocoding.com的api有所 domain, 因此如果寫成API的方式來呼叫的話，會在不同domain下不能執行。
		 * 最好還是自行開發web service 來滿足此需求
		 */
		function use3rdParty(latlng, callback){
			$.getScript('http://topocoding.com/api/getapi_v1.php?key=KGYPTDSIPVLDNJR', function(){
				//topoGetAltitude from topocoding api
				if(topoGetAltitude){
					topoGetAltitude(latlng.lat(), latlng.lng(), function(altitude ) {    					           
					    if(callback){
							callback(altitude);
						}
				   });
				}
			});
		}


		/**
		 * 使用google map v3提供的elevationService
		 * @param {LatLng} latlng
		 * @param {Function} callback 傳回1. altitude值，2. ElevationResult, 3. ElevationStatus
		 */
		function useGoogle(latlng, callback){
			var request={
				locations:[latlng]
			};
			makoci.elevationService.getElevationForLocations(request, function(result, status){
				if(status==google.maps.ElevationStatus.OK){
					callback(result.elevation, result, status);	
				}else{
					callback(null,result,status);
				}
			});
		}
	
}
	


	
/**
 * 
 * @param {Object} key
 */
makoci.service.geoCens = function(key){
	//iA7FRoRInzJj3mmzK5Sa 
	this.key = key;
}		
		
/**
 * 針對GeoCens搜尋可用的WMS服務
 * @param {String} keyword
 * @param {Function} callback 傳回1. object [] (包含.name, .url, .bbox屬性) 以及 2. message
 */
makoci.service.geoCens.prototype.searchWMS=function(keyword, callback){
			$.getJSON(makoci.service.proxy + '?' + 'http://dev.geocens.ca/api/v1/layers?keyword=wms:'+ keyword + '&api_key=' + this.key ,function(json){
				
				if(json.layers && json.layers.length>0){
					var array_obj=[];
					
					for(var i=0;i<json.layers.length; i++){
						var layer=json.layers[i];
						var obj={}
						obj.url=layer.service_url+'?request=GetMap&service=WMS&layers=' + layer.property + '&srs=EPSG:4326&format=image/png&version=1.1.0&bbox=' + layer.bbox;
						obj.name=layer.name;
						obj.bbox=layer.bbox;
						array_obj.push(obj);
					}
					callback(array_obj, json.message);
				}else{
					callback(null, '無資料，請重新查詢');
				}
			});
}
		
/**
 * 針對GeoCens搜尋可用的SOS服務
 * @param {String} keyword
 * @param {Function} callback 傳回1. object [] (包含.name, .url, .bbox屬性) 以及 2. message
 */
makoci.service.geoCens.prototype.searchSOS=function(keyword, callback){
			$.getJSON(makoci.service.proxy + '?' + 'http://dev.geocens.ca/api/v1/layers?keyword=sos:'+ keyword + '&api_key=' + this.key ,function(json){
				if(json.layers && json.layers.length>0){
					//要等宏洋開發sos的中間層，再作動作。
					
				}else{
					callback(null, json.message);
				}	
			});
}	

	

	
/**
 * @class
 * dynSegmentation 動態分段功能，幫助使用者找尋每條線段上，距離起點的多少公尺的點位，譬如：國道三號100km處。
 * @param {GMap} gmap GMap v2.x物件
 * @param {String} from 起點
 * @param {String} to 終點
 * @param {Function} callback 回傳gPolyline, status
 */
makoci.service.DynSegmentation = function(from, to, callback){
		if (!from || !to) {
			callback(null,'[ERROR]起點與終點尚未輸入，請重新輸入');
			return;
		}
		
		this.from = from;
		this.to = to;
		var that = this;
		
		//透過google的route功能，先算出起點至終點的路徑，
		makoci.service.route(from, to, 'DRIVING', {callback: function(results, status){
				if (status==google.maps.DirectionsStatus.OK) {
					//create polyline
					that.polyline=makoci.util.createPolyline(results.routes[0].overview_path);
					callback(that.polyline, status);
				}else{
					callback(null, status);
				}
				
		}});	
}
	

	
/**
 * 抓取某線段多少公尺處的位置
 * @param {Object} metres 輸入公尺
 * @result {GLatLng} GLatLng 回傳此公尺處的經緯度
 */
makoci.service.DynSegmentation.prototype.getPointFromDistance=function(metres) {
			  if(!metres){console.log('[ERROR] makoci.service.DynSegmentation給予公尺錯誤, 請重新輸入'); return;}
			  // some awkward special cases
			  if (metres == 0) return this.polyline.getPath().getAt(0);
			  if (metres < 0) return null;
			  var dist=0;
			  var olddist=0;
			  
			  var array_path=this.polyline.getPath().getArray();
			  for (var i=1; (i < array_path.length && dist < metres); i++) {
			    olddist = dist;
			    dist += google.maps.geometry.spherical.computeDistanceBetween(array_path[i], array_path[i-1]);
			  }
		
			  if (dist < metres) {return null;}
			  var p1= array_path[i-2];
			  var p2= array_path[i-1];
			 
			  var m = (metres-olddist)/(dist-olddist);
			  return new google.maps.LatLng( p1.lat() + (p2.lat()-p1.lat())*m, p1.lng() + (p2.lng()-p1.lng())*m);
}
	
	
/**
 * 抓取兩個距離間段的線段的位置
 * @param {Number} from_meter 區間段的起點
 * @param {Number} to_meter 區間段的終點
 * @result {GLatLng} GLatLng 回傳此公尺處的經緯度
 */
makoci.service.DynSegmentation.prototype.getPathFromDistance = function(from_meter, to_meter){
		if (!from_meter || !to_meter) {
			console.log('[ERROR] makoci.service.DynSegmentation給予公尺區段錯誤, 請重新輸入');
			return;
		}
		// some awkward special cases
		if (from_meter == 0 && to_meter == 0) 
			return null;
		if (from_meter < 0 || to_meter < 0) 
			return null;
		if (from_meter >= to_meter){console.log('[ERROR] makoci.service.DynSegmentation給予的起點和終點的區段不正確：起點<=終點');return;}
			  
		var dist=0,
			olddist=0,
			from_index=0,
			from_olddist=0,
			from_dist=0,
			array_latlng=[],
			array_path=this.polyline.getPath().getArray();
			
		for (var i=1, max=array_path.length; (i < max && dist < to_meter); i++) {
			  olddist = dist;
			  dist += google.maps.geometry.spherical.computeDistanceBetween(array_path[i], array_path[i-1]);
			  //抓取from_meter的index
			  if(dist > from_meter){
			  	if(from_index==0){
					from_index=i;
					from_olddist=olddist;
					from_dist=dist;
				}else{
					array_latlng.push(array_path[i]);
				}
			  }
		}
		
		if (dist < to_meter) {return null;}
		
		var from_p1=array_path[from_index-1], 
			from_p2=array_path[from_index], 
			to_p1=array_path[i-2], 
			to_p2=array_path[i-1],
			from_m=(from_meter-from_olddist)/(from_dist-from_olddist),
			from_latlng=new google.maps.LatLng( from_p1.lat() + (from_p2.lat()-from_p1.lat())*from_m, from_p1.lng() + (from_p2.lng()-from_p1.lng())*from_m),
			to_m=(to_meter-olddist)/(dist-olddist),
			to_latlng=new google.maps.LatLng( to_p1.lat() + (to_p2.lat()-to_p1.lat())*to_m, to_p1.lng() + (to_p2.lng()-to_p1.lng())*to_m);
	
		//將from_latlng插入array_latlng第一筆
		array_latlng.splice(0,0,from_latlng);
		//刪除最後一筆資料
		array_latlng.pop();
		//將to_latlng插入array_latlng最後一筆
		array_latlng.push(to_latlng);
		
		return array_latlng;
}
			




/**
 * Open Weather Map
 * @param {GMAP2} GMAP2 
 */
makoci.service.OpenWeatherMap=function(GMAP3, callback){
	if(!GMAP2 || !(GMAP2 instanceof GMap2)){
		console.log('[ERROR]沒有傳入GMAP2物件')
	}
	
	var swLatlng=GMAP3.getBounds().getSouthWest(),
		neLatlng=GMAP3.getBounds().getNorthEast(),
		zoom=GMAP3.getZoom();
	
	$.getJSON(makoci.service.proxy + "?" + "http://openweathermap.org/data/getrect?type=city&lat1=" + swLatlng.lat() + '&lat2=' + neLatlng.lat() + '&lng1=' + swLatlng.lng() + '&lng2=' + neLatlng.lng(), function(json){
		var geojson={type:"FeatureCollection", features:[]},
			error={code:"", msg:""};
		
		//假如有資料的話
		if(json.cod=='200'&&json.list.length>0){
			$.each(json.list, function(i, obj){
				var feature={
					type:"Feature",
					geometry:{"type": "Point", "coordinates": [obj.lng, obj.lat]},
					properties:{}
				};
				
				$.each(obj, function(key,value){
					//假如有temp的字串的話，就轉換溫度的單位從Kelvin到Celsius
					if(key.split('temp').length>1){
						feature.properties[key]=(parseFloat(value)-273.15).toFixed(1);
					}else{
						feature.properties[key]=value;
					}
				});
				
				geojson.features.push(feature);
			});
			callback(geojson,null);
		}else{
			error.code=json.cod;
			error.msg=json.message;
			callback(null, error);
		}
		
	});
}	



/**
 * 獲取某個範圍的local information, 
 * @param {Object} subject 查詢的主詞, 格式為geojson
 * @param {Object} relation 查詢的關係，格式為json, 包括：type{near / within / intersect}, value, unit
 * @param {Function} callback 傳回geojson
 */
makoci.service.localInformation=function(subject, relation, callback){
	if(!subject || !relation){
		console.log('[ERROR] makoci.service.localInformation發生錯誤，輸入參數不正確，請重新輸入');
		return;
	}
	
	var data={
		fieldNames:["P_CNT", "M_CNT", "F_CNT", "C_CNT", "C1_A_CNT","C1_B_CNT","C1_C_CNT","C1_D_CNT","C1_E_CNT","C1_F_CNT","C1_G_CNT","C1_H_CNT","C1_I_CNT","C1_J_CNT","C1_K_CNT","C1_L_CNT","C1_M_CNT","C1_N_CNT","C1_O_CNT","C1_P_CNT","C1_Q_CNT","C1_R_CNT","C1_S_CNT", "A0A14_CNT","A0A14_M_CN","A0A14_F_CN","A15A64_CNT","A15A64_M_C","A15A64_F_C","A65UP_CNT","A65UP_M_CN","A65UP_F_CN"],
		labels:["總人口數", "男生人數", "女生人數", "工商家數","農、林、漁、牧業","礦業及土石採取業","製造業","電力及燃氣供應業","用水供應及污染整治業","營造業","批發及零售業","運輸及倉儲業","住宿及餐飲業","資訊及通訊傳播業","金融及保險業","不動產業","專業、科學及技術服務業","支援服務業","公共行政及國防；強制性社會安全","教育服務業","醫療保健及社會工作服務業","藝術、娛樂及休閒服務業","其他服務業","0-14歲人口數","0-14歲男性人口數","0-14歲女性人口數","15-64歲人口數","15-64歲男性人口數","15-64歲女性人口數","65歲以上人口數","65歲以上男性人口數","65歲以上女性人口數"],
		values:{} // values利用object的key-value pair來儲存，key是fieldName, value則會是加總過後的人數
	};
			
	
	
//	$.getJSON("http://www.makoci.com/ws/makoci/localInfo/objects", function(object_json){
//		var parseJSON=new makoci.util.JSON();	
//		//post 會有crossdomain的問題，要注意
//		$.post(
//			"http://www.makoci.com/ws/makoci/localInfo/query",
//			{subject: parseJSON.toJSON(subject), relation: parseJSON.toJSON(relation), object: object_json.uuid},
//			function(geojson){
//				if(geojson.features.length>0){
//					callback(sum(geojson, data));
//				}else{
//					callback(null);
//				}
//			},
//			"json"
//		);
//	});
	
	

	
	$.getJSON("json/daan_pop.json",function(geojson){
		if(geojson){
			if(geojson.features.length>0){
				callback(sum(geojson, data));
			}else{
				callback(null, "此地區暫無在地情報，請重新查詢!");
			}
		}else{
			callback(null, "系統錯誤！請稍後查詢");
		}
		
	});
	
	
	//針對geojson的特定欄位值作sum
	function sum(geojson, data){
		$.each(geojson.features, function(i, feature){
				//統計每個欄位
				$.each(data.fieldNames, function(k, fieldName){
					//給予values預設的值0
					if(i==0){
						data.values[fieldName]=0;
					}
					
					if (feature.properties[fieldName]) {
						data.values[fieldName] += parseFloat(feature.properties[fieldName]);
					}
				});
		});
		return data;
	}

	
}
	