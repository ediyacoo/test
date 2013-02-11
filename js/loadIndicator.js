
$(function(){
	app.main.initUI();

	app.main.initMap();


	//read theme from theme.json
	$.getJSON("db/indicator.json", function(json){
		app.theme=json;

		showTheme();
	});
	
});





//show theme
function showTheme(){
	var html="<ul>";
	$.each(app.theme, function(k,value){
		html+="<li title='" + k + "' onclick='showIssue(\"" + k + "\")'><center><img src='" + value.image + "' /><br>" + k + "</center></li>";
	});
	html+="</ul>";
			
	$("#theme").html(html);
	
	var title="<a href='#' onclick='showTheme()'>HOME</a>",
		description="description";
	changeContent(title, description, html);
	
	$("#dialog_indicator").dialog({title:"KIEIN Indicators",modal:true, width:$(window).width()-100, height:$(window).height()-50, position:"center", resizable:false, draggable:false})
}




//show issue
function showIssue(theme){
	var html="<ul>";
	$.each(app.theme[theme].issue, function(key, value){
		html+="<li title='" + key + "' onclick='showIndicator(\"" + theme + "\", \"" + key + "\")'><center><img src='" + value.image + "' /><br>" + key + "</center></li>";
	});
	
	var title="<a href='#' onclick='showTheme()'>HOME</a>  >  " + theme,
		description=app.theme[theme].description;
	changeContent(title, description, html);
}



//show indicator
function showIndicator(theme, issue){
	var html="<ul>";
	$.each(app.theme[theme].issue[issue].indicators, function(i, indicator){
		html+="<li title='" + indicator.name + "' onclick='showModel(\"" + theme +"\", \"" + issue + "\", " + i + ")'><center><img src='" + indicator.image + "' /><br>" + indicator.name + "</center></li>";
	});
	
	var title="<a href='#' onclick='showTheme()'>HOME</a>  >  <a href='#' onclick='showIssue(\"" + theme + "\")'>" + theme + "</a>" + "  >  " + issue,
		description=app.theme[theme].issue[issue].description;
	changeContent(title, description, html);
}



//show formula
function showModel(theme, issue, num){
	var model=app.theme[theme].issue[issue].indicators[num];
	var html= readMetadata(model) + "<p></p><center><button id='btn_readModel'>Select</button></center>";
	
	var title="<a href='#' onclick='showTheme()'>HOME</a>  >  <a href='#' onclick='showIssue(\"" + theme + "\")'>" + theme + "</a>" + "  >  <a href='#' onclick='showIndicator(\"" + theme + "\", \"" + issue + "\")'>" + issue + "</a> > " + model.name,
		description=model.description;
	changeContent(title, description, html);
	
	$("#btn_readModel").click(function(){
		readModel(model, theme, issue);		
	});
}



function changeContent(title, description, content){
	$("#dialog_indicator_title").html(title);
	$("#dialog_indicator_description").html(description);
	$("#dialog_indicator_content").html(content);
}


/**
 * read model 
 */
function readModel(obj, theme, issue){
	//reset
	$("#infoContent_tabs_about, #infoContent_chart, #infoContent_toc").html("");
	
	
	//read metadata
	$("#infoContent_tabs_about").html(readMetadata(obj));
	
	
	//read layers
	if(obj.layers && obj.layers.length>0){
		var html_toc="<b>Layers: </b><p></p><ul>";
		$.each(obj.layers, function(i,layer){
			html_toc+="<li><input type='checkbox' class='toc_chk' id='toc_layer_" + i +"' />&nbsp; &nbsp;" + layer.name + "</li>";
		});
		html_toc+="</ul>";
		$("#infoContent_toc").html(html_toc);
		
		$(".toc_chk").click(function(){
			var id=this.id.split("_")[this.id.split("_").length-1],
				layer=obj.layers[id];
			
			if(this.checked){
				layer.timeStart=new Date().getTime();
				layer.timeEnd=0;
				layer.timeDuration=0;
				layer.timeDurations=[];
				layer.timeAverage=0;

				app.main.showLayer(layer);
			}else{
				if(layer.oplayer){
					layer.oplayer.setVisibility(false);
				}
			}
		});
	}else{
		$("#infoContent_toc").html("no relevant layers");
	}
	
	
	//calculate indicator
	//send a request to the server and get the result of the indicator in the geojson format
	if(obj.url && obj.url!=""){
		$.getJSON("db/spatialquery_landuse.json", function(json){
			var features=new OpenLayers.Format.GeoJSON().read(json),
				charts=[],
				chartTypes=["PieChart", "LineChart", "Table"];
			
			//draw chart	
			$.each(chartTypes, function(i,chart){
				//create div
				$("#infoContent_chart").append("<div id='chart_" + chart + "' class='chart'></div>");
				
				charts.push({
					googleChartWrapperOptions: {
						chartType: chart,
						containerId: "chart_"+chart,
						view:{columns:[0,1]},
						options: {
							width: 500,
							height: 300,
							title: "",
							titleX: "CATEGORIES",
							titleY: "SHAPE_AREA",
							legend: ""
						}
					},
					callback:null,
					callback_mouseover:function(e){
						var f=e.value.clone();
						f.geometry.transform(obj.srs, app.map.projection);

						//remove app.feature.chart
						if(app.feature.chart){app.vectorLayer.toolbox.removeFeatures([app.feature.chart]);}
					
						app.feature.chart=new OpenLayers.Feature.Vector(f.geometry, e, {fillColor: "#ff0000",strokeColor: "#ff0000"});
						app.vectorLayer.toolbox.addFeatures([app.feature.chart]);
						app.vectorLayer.toolbox.redraw();
					},
					callback_mouseout:function(e){
						//remove app.feature.chart
						if(app.feature.chart){app.vectorLayer.toolbox.removeFeatures([app.feature.chart]);}
					}
				});
			});
			kiein.service.drawGoogleChart(features, charts, ["CATEGORIES", "SHAPE_AREA"]);
				
				
			//add layer
			if(obj.srs && obj.srs!=""){
				kiein.service.WPSreproject(features, obj.srs, "EPSG:900913", function(output){
					app.vectorLayer.toolbox.addFeatures(output.result);
					
					//dialog destroy
					$("#dialog_indicator").dialog("destroy");
				});
			}


		});
	}else{
		$("#infoContent_chart").html("No relevant URL");
	}
	
	
	
	
	
	
}




/**
 * READ METADATA FROM INDICATOR 
 */
function readMetadata(indicator){
	var html_metadata="<table border=0 class='table-metadata' width=99%;>";
	$.each(indicator, function(k,v){
		if(k!="layers"){
			html_metadata+="<tr><td>"+k+"</td><td>"+v+"</td></tr>";
		}
	});
	html_metadata+="</table>";
	return html_metadata;
}
