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

var posi_frames=80;
var frame_ptr=0;
var mw_dist_x_pos=[];
function draw_positive_animation(ptr){
	var fade_out_frm=10;var move_frm=40;var move_down_frm=70;
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
		else{
			for (var i=0;i<8;i++){
				ctx.fillText(words_selected[i],mw_dist_x_pos[i],text_pos_y[i]+map_range_2(ptr,move_frm,(move_down_frm-1),0,h));
				
			}
			if (ptr==move_down_frm-1){
				for (var i=0;i<8;i++){	//force erase black strips
					blackout_l[i]=0;
					blackout_r[i]=w;
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
