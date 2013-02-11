var app={
      	map:null,
      	layers:[
      		   ],
      	css:{map_height:'70%',
      		 menuContent_height:$(window).height()-150,
      		 menuContent_width:325,
      		 menuContent_position:['right',25],
      		 menuContent_dialogClass:'alpha',
      	},
      	mapTypes:[{id:"OSM", mapType:new makoci.layer.OSM("OSM",{name:"OSM"})}],
      	mapTypeIDs:[google.maps.MapTypeId.ROADMAP, google.maps.MapTypeId.HYBRID, google.maps.MapTypeId.TERRAIN],
      	theme:{},
      	layersNum:0
};
      
      

	  
//init
$(function(){
	UI();

	gmap_init();
});
	  


//set themeWidget
function setThemeWidget(){
	var html="<ul style='list-style:none; padding:0px; margin:0px;'>";
	$.each(app.theme, function(key, value){
		html+="<li onclick='showTheme(\"" + key + "\");' title='" + key + "'><label>" + key + "</label></li>";
	});
	html+="</ul>";	
  	$("#themeWidget").html(html);
}


//adjust ui
function UI(){
	//juery ui tabs
	$(".tabs").tabs();
	
	//jquery ui accordion
	$(".accordion").accordion({
		autoHeight: false,
	});
	
	//button
	$('button').button();
	
	//buttonset
	$('#radioset').buttonset();
	
	//show menuContent dialog
	//$('#menuContent').dialog({title:'Menu', position:app.css.menuContent_position, minWidth:app.css.menuContent_width, height:app.css.menuContent_height, dialogClass:app.css.menuContent_dialogClass});
		
	//make mapPanel resizable
	$('#mapContent > div:first').resizable({
		handles: 's',
		minHeight : 200,
		maxHeight : $(document).height() - $('#titleContent').height(),
		resize:function(){
			var remainingSpace=$(this).parent().height() - $(this).outerHeight();
			var divTwo = $(this).next();
			var divTwoHeight = remainingSpace - (divTwo.outerHeight() - divTwo.height());
			divTwo.css('height', divTwoHeight +'px');
			google.maps.event.trigger(app.map, 'resize');
			app.css.map_height=$(this).outerHeight();
			
			//set mapPanel width = 100%
			$('#mapPanel').css('width', '100%');
		}
	});
	
	setTimeout(function(){
		$("#statusWidget").fadeIn();
	},3000);
	
	setTimeout(function(){
		$("#statusWidget").fadeOut();
	},6000);
	
	//$('#mainContent').height($(document).height() - $('#titleContent').height());
}


	  
//init map
function gmap_init() {

		//map options
        var mapOptions = {
          zoom: 12,
          center: new google.maps.LatLng(29.3,48),
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          mapTypeControlOptions:{style:google.maps.MapTypeControlStyle.DROPDOWN_MENU},
          zoomControlOptions:{style:google.maps.ZoomControlStyle.SMALL},
          panControl:false
        };
		
		//init map
        app.map = new google.maps.Map(document.getElementById('div_map'), mapOptions);
        
        //add toolbox control
        app.map.controls[google.maps.ControlPosition.TOP_CENTER].push($('#toolboxContent')[0]);
        
        //add infoWindowButton control
        app.map.controls[google.maps.ControlPosition.BOTTOM_CENTER].push($('#infoPanelButton')[0]);
        
        //add statusWidget 
        app.map.controls[google.maps.ControlPosition.TOP_RIGHT].push($('#statusWidget')[0]);
        
        //add copyright
        app.map.controls[google.maps.ControlPosition.BOTTOM_LEFT].push($('#copyright')[0]);
        
        //add menuWidget
        app.map.controls[google.maps.ControlPosition.RIGHT_CENTER].push($('#menuWidget')[0]);
        
        
        //add base map types
		$.each(app.mapTypes,function(i,obj){
			if(obj.mapType instanceof google.maps.ImageMapType){
				app.map.mapTypes.set(obj.id, obj.mapType);
				app.mapTypeIDs.push(obj.id);
			}else{
				console.log('[ERROR]makoci.map: mapTypes不是google.maps.ImageMapType');
			}
		});
		//set mapTypeControlOptions
		app.map.setOptions({mapTypeControlOptions:{mapTypeIds: app.mapTypeIDs, style:google.maps.MapTypeControlStyle.DROPDOWN_MENU}});
        
}



//showHide content
function showHide(dom_id){
	var elem=$("#"+dom_id)[0];
	
	if(elem.style.display=='none'){
		$('#'+dom_id).show();
		
		switch (dom_id){
			case "menuContent":
				$("#mapContent").animate({width:$(window).width()  - $("#menuContent").width() - 8}, 150, function(){
					$("#mapContent").css('width', '80%');
					google.maps.event.trigger(app.map, "resize");
				});	
				//show menuContent dialog
				//$('#'+dom_id).dialog({title:'Menu', position:app.css.menuContent_position, minWidth:app.css.menuContent_width, height:app.css.menuContent_height, dialogClass:app.css.menuContent_dialogClass});
			break;
			case "infoPanel":
				$("#mapPanel").animate({height:app.css.map_height}, 150, function(){
					google.maps.event.trigger(app.map, "resize");
				});
			break;
		}
	}else{
		$('#'+dom_id).hide();
		
		switch (dom_id){
			case "menuContent":
				$("#mapContent").animate({width:$(window).width() - 2}, 150, function(){
					$("#mapContent").css('width', '100%');
					google.maps.event.trigger(app.map, "resize");
				});
				//hide menuContent dialog
				//$('#'+dom_id).dialog("close");
			break;
			case "infoPanel":
				$("#mapPanel").animate({height:'100%'}, 150, function(){
					google.maps.event.trigger(app.map, "resize");
				});
			break;
		}
	}
	
	google.maps.event.trigger(app.map, "resize");
}



//show dialog
function showDialog(dom_id, html, options){
	$("#"+dom_id).html(html);
	$("#"+dom_id).dialog(options);
}






