
//show theme
function showTheme(){

	if(app.theme){
		var html='';
		$.each(app.theme, function(key, value){
			//show title
			//$("#theme_title").html(id);
			
			//show description
			//$("#theme_description").html(value.description)
			//console.log(value.background_color)
			//html+="<h3 style='background:" + (value.background_color || "") + "'><a href='#'>"+ key + "</a></h3><div style='background:" + value.background_color + "; background-image:url(\""+ (value.background_image || "") +"\");background-repeat:no-repeat;background-size:100%'><ul>";
			html+="<h3 style=''><a href='#'>"+ key + "</a></h3><div style='background-image:url(\""+ (value.background_image || "") +"\");background-repeat:no-repeat;background-size:100%'><ul>";
			var layer_name="";
			$.each(value, function(k, obj){		
				//layer
				if(k=="layers"){
					$.each(obj, function(i, layer){
						layer_name=key + "_" + k + "_" + i;
						html+="<li><input type=checkbox id='" + app.layersNum + "' name=" + layer_name + " class='layer_chk' title='show/hide layers on the map'/>&nbsp;<img src='images/loading.gif' id='loading_" + app.layersNum +"' style='display:none' />&nbsp;<label>" + layer.name + "</label></li>"; 
						app.layersNum++;
					});
				}
			});
			html+="</ul></div>";
		});
		
		$("#layersAccordion").html(html);
		$("#layersAccordion").accordion({
			autoHeight:false,
		});
		

		//add click event on layer checkbox
		$(".layer_chk").click(function(){
	  		//if checked
	  		if(this.checked){
	  			var theme=this.name.split("_")[0],
	  				issue=this.name.split("_")[1],
	  				num=this.name.split("_")[2],
	  				wms_url=app.theme[theme].layers[num].wms_url,
	  				wms_param=app.theme[theme].layers[num].wms_param,
		  			type=app.theme[theme].layers[num].type,
		  			that=this;
		  		
		  		//record what checkbox has been checked
		  		//$(this).attr('checked', true);
		  		//app.theme[theme].layerHtml=$("#layer").html();
		  		
		  		var url=wms_url+"?service=WMS&version=1.1.0&request=GetMap&";
		  		$.each(wms_param, function(index, param){
		  			url+=index+"="+param+"&";
		  		});
		  		
		  		
		  		//show loading icon
		  		$("#loading_" + this.id).show();

		  		switch(type){
		  			case "WMS":
		  				var wms=new makoci.layer.WMS(url);
		  				app.map.overlayMapTypes.setAt(this.id, wms);
		  				
		  				google.maps.event.addListener(wms, "tilesloaded", function(){
		  					//hide loading icon
		  					$("#loading_" + that.id).hide();
		  				});
		  				
		  				//show legend
		  				$("#legend ul").append("<li id='legend_"+ this.id +"'>"+makoci.layer.WMS.getLegend(url, true) + "</li>");
		  			break;
		  		}
		  		
	  		}else{
	  			//if use removeAt to remove overlay, the sequence in the array of overlayMapTypes will be wrong
	  			//app.map.overlayMapTypes.removeAt(parseFloat(this.id));
	  			app.map.overlayMapTypes.setAt(this.id, null);
	  			
	  			//record what checkbox has been checked
	  			$(this).attr('checked', false);
		  		app.theme[this.name.split("_")[0]].layerHtml=$("#layer").html();
	  			
	  			//remove legend
	  			$("#legend_"+this.id).remove();
	  			
	  			//hide loading icon
		  		$("#loading_" + this.id).hide();
		  		
	  		}
	  	});
		
		
		//show theme
		var elem=$("#menuContent")[0];
		if(elem.style.display=='none'){
			$("#menuContent").show();
		
			$("#mapContent").animate({width:$(window).width()  - $("#menuContent").width() - 8}, 150, function(){
			$("#mapContent").css('width', '80%');
				google.maps.event.trigger(app.map, "resize");
			});
		}
		
	}//end if
}