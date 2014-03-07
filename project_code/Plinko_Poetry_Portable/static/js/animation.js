// JavaScript Document

function modified_base64(str){
    return str.replace(/\+/g, '-').replace(/\//g, '_').replace(/\=+$/, '');
}

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
var a_new_img_loaded=false;
var posi_frames=300;
var mw_dist_x_pos=[];
var imageSearch=[];
var google_images_loaded=[];
var display_kaleidoscope=false;
var k_canvas,k_ctx;
var small_canvas,small_ctx;

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
			google_images_loaded[i]=false;
		}	
		display_kaleidoscope=false;
		k_canvas=document.getElementById("tempCanvas4Kaleidoscope");
		k_canvas.width=w;
		k_canvas.height=h;
		k_ctx=k_canvas.getContext("2d");
		k_ctx.clearRect(0,0,w,h);
		
		small_canvas=document.getElementById("tempCanvas4SmallImg");
		small_ctx=small_canvas.getContext("2d");
		
		//calculate something in 1st frame
		var widest = 0;
		for (var i=0;i<8;i++){
			var wid=ctx.measureText(words_selected[i]).width;
			if (wid>widest) widest = wid;
		}
		for (var i=0;i<8;i++){
			mw_dist_x_pos[i]=w*0.95-widest;
		}
	}
	
	
	var fade_out_frm=10;var move_frm=40; var k_fadein=55;var k_fadeout=245; var idle_frm=260;var move_down_frm=290;
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

			
			for (var i=0;i<8;i++){
				ctx.fillText(words_selected[i],mw_dist_x_pos[i],text_pos_y[i]+map_range_2(ptr,idle_frm,(move_down_frm-1),0,h));
				
			}
			
			if (ptr==idle_frm){
				google_imgs.style.display='none';
			}
			
			if (ptr==move_down_frm-1){
				for (var i=0;i<8;i++){	//force erase black strips
					blackout_l[i]=0;
					blackout_r[i]=w;
				}
			}
		}else{	//idle
			if (ptr==move_frm){
				//google_imgs.style.display='inline';
			}else{
				if (a_new_img_loaded){	//give more time
					a_new_img_loaded=false;
					ptr=move_frm
				}
			}
			var phase=1;
			if (display_kaleidoscope) {
				if (ptr<k_fadein) {
					phase=map_range(ptr, move_frm, k_fadein, 0, 1)
					ctx.globalAlpha=phase;
				}else if (ptr>=k_fadeout){
					phase=map_range(ptr, idle_frm, k_fadeout, 0, 1);
					ctx.globalAlpha=phase;
				}
				ctx.drawImage(k_canvas,0,0);
				ctx.globalAlpha=1.0;
			}
			
			if (display_kaleidoscope && ptr<idle_frm && ptr>=move_frm){
				ctx.fillStyle = "rgba(0, 0, 0, "+phase*0.3+")";
				ctx.beginPath();
				ctx.rect(w,0,-(w-(mw_dist_x_pos[0]-0.05*w)),h);
				ctx.fill();
				var grey = Math.round(phase*255);
				ctx.fillStyle = "rgb("+grey+","+grey+","+grey+")";
			}else{
				ctx.fillStyle = "black"
			}
			
			for (var i=0;i<8;i++){
				ctx.fillText(words_selected[i],mw_dist_x_pos[i],text_pos_y[i]);			
			}
			
			//if (display_kaleidoscope && ptr==k_fadeout-1){
			if (display_kaleidoscope && ptr==k_fadein+1){	//change it back after test
				var url=null;
				try{
					url = canvas.toDataURL('image/jpeg');
				}catch(err){
					console.log("Browser with CORS protection will not upload to gallery. Sorry.");
				}
				if (url!=null){
					var img_data=url.substring( "data:image/jpeg;base64,".length )
					img_data=modified_base64(img_data);
					var upload = new XMLHttpRequest();
					upload.open('POST', 'upload_poster', false);
					upload.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
					upload.onreadystatechange = function() {
						if(upload.readyState == 4 && upload.status == 200) {
							console.log(upload.responseText);
						}
					}
					var encoded_poem=btoa(words_selected.join(' '));
					encoded_poem=modified_base64(encoded_poem);
					upload.send("poem="+encoded_poem+"&"+"imgData="+img_data);
					//upload it to server
				}
				
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

function kaleidoscope_fill(img,x,y,x1,ctx,w,h){
	var sqrt3=Math.sqrt(3);
	var small_w=x1-x;
	var small_h=Math.ceil(small_w*0.5*sqrt3);
	var x_num=Math.ceil(w/small_w)+1;
	var y_num=Math.ceil((h+small_h/3)/small_h)*2;
	
	for (var j=0;j<y_num;j++){
		var x_offset;
		if ((j%4)==0 || (j%4)==3) x_offset=0;
		else x_offset=small_w*0.5;
		var y_pos=(Math.floor(j/2)*3+(j%2))*small_h/3;
		for (var i=0;i<x_num;i++){
			ctx.save();
			ctx.translate(i*small_w+x_offset,y_pos);
			var rotate_angle=(Math.floor(j*0.25))*(Math.PI*2/3);		
			if (j&1!=0){	//odd row
				rotate_angle-=(i+j)*(Math.PI*2/3);
				if (((j&3)==1))  rotate_angle-=(Math.PI*2/3);;
				rotate_angle+=Math.PI;
				ctx.scale(-1,1);
			}else{	//even row
				rotate_angle-=(i+j)*(Math.PI*2/3);
			}
			ctx.rotate(rotate_angle);
			
			ctx.beginPath();
    		ctx.moveTo(-small_w*0.5,-small_h/3);
			ctx.lineTo(small_w*0.5,-small_h/3);
			ctx.lineTo(0,2*small_h/3);
			ctx.closePath();
			
			ctx.clip();
			ctx.drawImage(img,-small_w*0.5,-small_h/3);
			ctx.restore();
		}	
	}
}

function google_images_loaded_func(value){			
	google_images_loaded[value]=true;
	if (!display_kaleidoscope){
		var images_arr=[];
		var smallest_w=99999;
		var smallest_h=99999;
		for (var i=0;i<8;i++){
			if (google_images_loaded[i]) {
				var img=document.getElementById("google_image_"+i);
				images_arr.push(img);
				if (smallest_w>img.width) smallest_w=img.width;
				if (smallest_h>img.height) smallest_h=img.height;
			}
		}
		if (images_arr.length>=5) {
			small_canvas.width=smallest_w;
			small_canvas.height=smallest_h;
			
			//small_ctx.globalAlpha = 1.5/images_arr.length;
			var blend_arr=[];
			var imgData,data_arr;
			for (var i=0;i<images_arr.length;i++){
				small_ctx.globalAlpha = 1/i;
				var x=((smallest_w-images_arr[i].width)*0.5);
				var y=((smallest_h-images_arr[i].height)*0.5);
				small_ctx.drawImage(images_arr[i],x,y);
			}
			small_ctx.globalAlpha = 1.0;
			var tri_w;
			if (smallest_w*0.5*Math.sqrt(3)<smallest_h) tri_w=smallest_w;
			else tri_w=smallest_h*2/Math.sqrt(3);
			
			kaleidoscope_fill(small_canvas,0,0,tri_w,k_ctx,w,h);
			document.getElementById("scream");
			display_kaleidoscope=true;
		}
	}
	//console.log("IMG loaded: "+value);
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
		newImg.id = "google_image_"+value;
		newImg.onload = function(){google_images_loaded_func(value)};
		/*newImg.style.position = 'absolute';
		//newImg.height = (text_pos_y[2]-text_pos_y[1])*1;
		if (value%2==0){
			newImg.style.left = (mw_dist_x_pos[value]-w*0.3)+'px';
		}else{
			newImg.style.left = (mw_dist_x_pos[value]-w*0.18)+'px';
		}
		//console.log((mw_dist_x_pos[value]-img_width)+'px');
		newImg.style.top = (text_pos_y[value]-(text_pos_y[2]-text_pos_y[1])) + 'px';*/
		newImg.src=result.tbUrl;
		google_imgs.appendChild(newImg);
		
		a_new_img_loaded=true;
	
	}
}
