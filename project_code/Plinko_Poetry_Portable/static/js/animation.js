// JavaScript Document

function map_range(value, low1, high1, low2, high2) {
    return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
}

function map_range_2(value, low1, high1, low2, high2) {
	var v2=value-low1; var dist = high1-low1;
	v2=v2/dist;
	v2=-v2*(v2-1)+v2;
	value=v2*dist+low1;
    return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
}

var frame_ptr=0;

var posi_frames=110;
var mw_dist_x_pos=[];
var imageSearch=[];
function draw_positive_animation(ptr){
	if (ptr==0){	//fetch google images
		google_imgs.innerHTML = '';
		for (var i=0;i<8;i++){
			// Create an Image Search instance.
			imageSearch[i] = new google.search.ImageSearch();
			// Set searchComplete as the callback function when a search is 
			// complete.  The imageSearch object will have results in it.
			imageSearch[i].setSearchCompleteCallback(this, searchComplete, [i]);		
			// Find me a beautiful car.
			imageSearch[i].execute(words_selected[i]);
		}	
	}
	
	
	var fade_out_frm=10;var move_frm=40;var idle_frm=70;var move_down_frm=100;
	if (ptr < fade_out_frm){
		var color_value=Math.round(255*ptr/(fade_out_frm-1));
		for (var i=0;i<8;i++){
			ctx.beginPath();
			ctx.rect(0, text_pos_y[i], blackout_l[i], -text_size_px);
			ctx.fillStyle = 'rgb('+color_value+','+color_value+','+color_value+');';
			ctx.fill();
			ctx.rect(blackout_r[i], text_pos_y[i], w-blackout_r[i], -text_size_px);
			ctx.fill();	
		}
	}else if(ptr < (move_down_frm)){
		ctx.font = text_size_px+"px Arial";	//test main text
		if (ptr==fade_out_frm){	//calculate something in 1st frame
			var widest = 0;
			for (var i=0;i<8;i++){
				var wid=ctx.measureText(words_selected[i]).width;
				if (wid>widest) widest = wid;
			}
			for (var i=0;i<8;i++){
				mw_dist_x_pos[i]=w*0.99-widest;
			}
			
		}
		ctx.beginPath();
		ctx.rect(0, text_pos_y[7]+text_size_px*0.1, w, text_pos_y[0]-text_size_px*(1.2)-text_pos_y[7]);
		ctx.fillStyle = 'white';
		ctx.fill();
		ctx.textBaseline="bottom"; 
		ctx.fillStyle = 'black';
		if (ptr < (move_frm))
			for (var i=0;i<8;i++){
				//ctx.fillText(words_selected[i],words_selected_pos[i],text_pos_y[i]);
				ctx.fillText(words_selected[i],map_range_2(ptr,fade_out_frm,move_frm-1,words_selected_pos[i],mw_dist_x_pos[i]),text_pos_y[i]);	
			}
		else if(ptr >= (idle_frm)){
			if (ptr==idle_frm){
				google_imgs.style.display='none';
			}
			
			for (var i=0;i<8;i++){
				ctx.fillText(words_selected[i],mw_dist_x_pos[i],text_pos_y[i]+map_range_2(ptr,idle_frm,(move_down_frm-1),0,h));
				
			}
			if (ptr==move_down_frm-1){
				for (var i=0;i<8;i++){	//force erase black strips
					blackout_l[i]=0;
					blackout_r[i]=w;
				}
			}
		}else{	//idle
			
			if (ptr==move_frm){
				google_imgs.style.display='inline';
			}
		
			for (var i=0;i<8;i++){
				ctx.fillText(words_selected[i],mw_dist_x_pos[i],text_pos_y[i]);			
			}
		}
	}else{
		var alpha_all=1-((ptr-move_down_frm)/(posi_frames-move_down_frm+1));
		ctx.beginPath();
		ctx.rect(0, text_pos_y[7]+text_size_px*0.1, w, text_pos_y[0]-text_size_px*(1.2)-text_pos_y[7]);
		ctx.fillStyle = 'rgba(255,255,255,'+alpha_all+');';
		ctx.fill();
	}
	
	if (ptr>posi_frames){
		return false;	
	}else{
		return true;	
	}
}

var nega_frames=50;
var mw_dist_x_pos=[];
function draw_negative_animation(ptr){
	var black_all_frm=10;var break_1_frm=20;var fade_out_frm=30;var break_2_frm=40;
	
	if (ptr < fade_out_frm){
		var ptr2 = ptr;
		if (ptr>=black_all_frm) ptr2=black_all_frm;
		for (var i=0;i<8;i++){
			var width_black = map_range_2(ptr2,0,(black_all_frm-1),0,blackout_r[i]-blackout_l[i]+w*0.01);
			ctx.beginPath();
			ctx.rect(blackout_l[i]-w*0.005, text_pos_y[i], width_black, -text_size_px);
			ctx.fillStyle = 'black';
			ctx.fill();
		}
		if (ptr>=break_1_frm){
			var width_white = map_range_2(ptr,break_1_frm,(fade_out_frm-1),0,w);
			ctx.beginPath();
			ctx.rect(0, text_pos_y[7]+text_size_px*0.1, width_white, text_pos_y[0]-text_size_px*(1.2)-text_pos_y[7]);
			ctx.fillStyle = 'white';
			ctx.fill();
			if (ptr==fade_out_frm-1){
				for (var i=0;i<8;i++){	//force erase black strips
					blackout_l[i]=0;
					blackout_r[i]=w;
				}
			}
		}
	}else{
		var alpha_all=1-((ptr-break_2_frm)/(nega_frames-break_2_frm+1));
		if (alpha_all>1) alpha_all=1;
		ctx.beginPath();
		ctx.rect(0, text_pos_y[7]+text_size_px*0.1, w, text_pos_y[0]-text_size_px*(1.2)-text_pos_y[7]);
		ctx.fillStyle = 'rgba(255,255,255,'+alpha_all+');';
		ctx.fill();
		
	}
	
	
	if (ptr>nega_frames){
		return false;	
	}else{
		return true;	
	}
}

function searchComplete(value) {
// Check that we got results
	if (imageSearch[value].results && imageSearch[value].results.length > 0) {
		// Loop through our results, printing them to the page.
		var results = imageSearch[value].results;
		var i = Math.floor((Math.random()*results.length));
		// For each result write it's title and image to the screen
		var result = results[i];
		//var imgContainer = google_imgs.createElement('div');
		var newImg = document.createElement('img');
		
		newImg.src=result.tbUrl;
		google_imgs.appendChild(newImg);
	
	}
}
