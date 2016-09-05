/*jshint -W069 */
var DEFAULT_DAY = 'monday';
var DAY = DEFAULT_DAY;
var day_panel = false;
var paths_settings_panel = null;
var option_panel = 'null';
var modify_path_panel = false;
var old_name = null;
var old_time = null;
var to_delete_path = false;
var day_selection = null;
var options_buttons = false;
var loaded_paths = null;
var loaded_shops = null;
var ordering = {'name': 'asc',
'time': 'asc'
};
var autocomplete_id = null;
var autocomplete = [];



$(document).ready(function() {

	DAY = get_date_day();
	show_day(true);
	$('.days_selection[data-eng_value="'+DAY.toLowerCase()+'"]').parent('li').addClass('active');

	$("#menu-toggle").click(function(e) {
		e.preventDefault();
		$("#wrapper").toggleClass("toggled");
	});

	$(".menu_selection").click(function() {
		$('.menu_selection').removeClass('active');
		$($(this).addClass('active'));
	});


	$('.to_sort_name, .to_sort_time ').on('click', function() {
		var cl = null;
		var new_order = {};
		var new_order1 = {};
		var where = $(this).closest('table').first().attr('id');


		var odd_children = $('#'+where+'_listTable').find('.modify_path_time');
		where = where.replace('_list_table', '');
		var odd_trs = $('#'+where+'_listTable').children('.with_data');
		if($(this).hasClass('to_sort_name')) {
			cl = 'name';

		} else {
			cl = 'time';

		}
		var to_order = [];

		html_content = {};
		$.each(odd_trs, function(i) {


			html_content[$(this).attr('data-row_id')] = $(this).next().html();
			$(this).next().find('.lists').first().hide();

			tmp = null;
			if(cl == 'name') {
				tmp = $(this).find('.print').first();
				new_order1[$(this).attr('data-row_id')] = tmp.text();
				to_order.push(tmp.text());
			} else {
				tmp = $(this).find('.modify_path_'+cl).first();
				new_order1[$(this).attr('data-row_id')] = tmp.val();
				to_order.push(tmp.val());
			}
		});
		to_order.sort();
		if(ordering[cl] == 'desc')
			to_order.reverse();

		$.each(to_order, function(i){

			$.each(new_order1, function(index, element){
				if(element == to_order[i]) {
					new_order[index] = i;
					delete new_order1[index];
				}
			});
		});


		if(ordering[cl] == 'asc')
			ordering[cl] = 'desc';
		else
			ordering[cl] = 'asc';

		add_paths_list(loaded_paths, where, new_order, html_content);



	});


	get_shops("add_shops_list");
	get_paths("add_paths_list", "paths");

	$("#shops_list_table").stupidtable();
	//for objects in html page
	$('.days_selection, .days_modification').on('click', function() {

		DAY = $(this).attr('data-eng_value');
		if($(this).hasClass('days_selection')) {
			cl = 'days_selection';
			show_day(true);
		} else {
			cl = 'days_modification';
			show_option_panel('path', 'modify', true);
		}
		$('.'+cl).removeClass('active');
		$('.'+cl+'[data-eng_value="'+DAY+'"]').addClass('active');


	});


	$('#print').printPage({
		url: '/print'
	});
	$('#make_print').on('click', function() {
		$.when(collect_days_data('print')).done(function(){
			$( "#print" ).trigger( "click" );
		});
	});

	//for objects added at runtime

	$(".clockpicker").livequery(function(){
		$(this).clockpicker();
	});

	//for paths table
	$(document).on('click', ".automatic_insertion", function(){
		if($(this).hasClass('active')) {
			$(this).removeClass('active');
		} else {
			$(this).addClass('active');

		}


	});

	$(document).on('click', ".automatic_reorder_from_paths, .automatic_reorder_from_days", function(){
		var cl = null;
		if($(this).hasClass('automatic_reorder_from_paths')) {
			cl = "paths";
		} else {
			cl = "days";

		}
		ul = $(this).parent().siblings('div.ul_list_container').children('ul').first();
		collect_modify_path_data(ul, cl, true);


	});

	$(document).on('click', ".automatic_reversal_from_paths, .automatic_reversal_from_days", function(){
		var cl = null;
		if($(this).hasClass('automatic_reversal_from_paths')) {
			cl = "paths";
		} else {
			cl = "days";

		}

		ul = $(this).parent().siblings('div.ul_list_container').children('ul').first();

		shops = [];
		shops = ul.children('li');
		tmp = [];
		$.each(shops, function() {
			tmp.push($(this).text());
		});
		tmp.reverse();
		ul.empty();
		$.each(tmp, function(index, element) {
			var li ='<li class="ui-state-default"><img class="arrow_img" src="images/arrow.png">'+element+'<span class="glyphicon glyphicon-remove pull-right remove_shop_from_'+cl+'" aria-hidden="true"></span></li>';
			ul.append(li);
		});
		collect_modify_path_data(ul, cl, false);


	});



	$(document).on('click', ".remove_shop_from_paths, .remove_shop_from_days", function(){
		cl = null;
		if($(this).hasClass("remove_shop_from_paths"))
			cl = "paths";
		else
			cl = "days";
		li = $(this).parent();
		ul = $(this).parent().parent();
		li.fadeOut( "slow", function() {
			// Animation complete.
			$(this).remove();
			collect_modify_path_data(ul, cl, false);

		});

	});

	$(document).on('click', ".dropdown_from_paths, .dropdown_from_days", function(){
		var tr = $(this).parent('tr');

		var div = tr.next().find('div.lists').first();
		if(div.is(":visible")) {
			div.hide('drop');
		} else {

			tr.addClass("already_showed");

			cl = null;
			if($(this).hasClass('dropdown_from_paths'))
				cl = "paths";
			else
				cl = "days";

			add_ul_list(tr, cl);
			div.show('drop');
			$('html, body').animate({
				scrollTop: tr.offset().top
			}, 700);



		}
	});


	$( ".sortable_paths" ).livequery(function(){
		$(this).sortable({
			update: function( event, ui ) {
				//var ul = $(this).text();
				collect_modify_path_data($(this), "paths", false);

			}
		});
	});
	$( ".sortable_days" ).livequery(function(){
		$(this).sortable();
	});
	$(".confirm_path_deletion_from_paths").livequery(function() {

		$(this).confirm({
			text: "Do you really want to delete this path?",
			title: "Confirm",
			confirm: function(button) {
				tr = button.parent();
				tr.fadeOut( "slow", function() {

					var id = $(this).attr('data-row_id');
					var new_values = {};
					new_values["id"] = id;
					new_values["day"] = DAY;
					new_values["to_delete"] = true;
					$(this).next().remove();
					$(this).remove();
					modify_path(new_values, true, false);


				});

			},
			cancel: function(button) {
				// nothing to do
			},
			confirmButton: "Delete",
			cancelButton: "Cancel",
			post: true,
			confirmButtonClass: "btn-danger",
			cancelButtonClass: "btn-default",
			dialogClass: "modal-dialog modal-lg" // Bootstrap classes for large modal
		});
	});
	$(document).on("click", ".confirm_path_deletion_from_days", function(){
		tr = $(this).parent();
		tr.fadeOut( "slow", function() {

			$(this).next().remove();
			$(this).remove();
		});

	});


	$(document).on("click", ".add_shop_to_list_from_paths, .add_shop_to_list_from_days", function(){

		var ul = null;
		var cl = null;
		var reorder = false;
		var shop = $(this).parent().siblings('.autocomplete_input').val();

		if($(this).hasClass("add_shop_to_list_from_paths")) {
			cl = "paths";
		} else {
			cl = "days";
		}
		ul = $(this).parents('div.insert_new_shop_container').first().siblings('div.ul_list_container').children('ul.sortable_'+cl).first();
		tmp = ul.children('li');
		list = [];
		$.each(tmp, function(i) {
			list.push($(this).text());
		});

		if(shop === '') {
			alert('You can\'t add an empty field');
		} else if(!(shop in autocomplete_id)) {
			alert("Shop not found");

		} else if($.inArray(shop, list) > -1) {
			alert("Shop already in the list");

		}
		else {
			button = ul.parents('div.ul_list_container').first().siblings('div.buttons_list_container').first().find('.automatic_insertion').first();
			if(button.hasClass("active")) {
				reorder = true;
			}

			var tmp = '<li class="ui-state-default ui-sortable-handle"><img class="arrow_img" src="images/arrow.png">'+shop+'<span class="glyphicon glyphicon-remove pull-right remove_shop_from_'+cl+'" aria-hidden="true"></span></li>';
			$(this).parent().siblings('.autocomplete_input').val('');
			ul.append(tmp);

			collect_modify_path_data(ul, cl, reorder);


		}
	});


	$(document).on('click', ".with_data td", function(evt, newValue) {
		new_values = {};
		var table = $(this).closest('table');
		var th = $(this).closest('table').find('th').eq( this.cellIndex );
		var id = $(this).closest('tr').attr('data-row_id');
		new_values["param"] = th.attr('data-eng_value');
		new_values["id"] = id;

		if(table.attr('id') == 'paths_list_table') {
			$('.with_data td').on('change', function(evt, newValue) {

				// do something with the new cell value
				if(newValue !== undefined) {
					new_values["value"] = newValue;
					modify_path(new_values, true, false);
				}
			});
			$('.with_data td div input').on('change', function(evt, newValue) {
				new_values["value"] = $(this).val();
				modify_path(new_values, true, false);
			});
		}
	});

	//for shops table

	$(".confirm_shop_deletion").livequery(function() {
		$(this).confirm({
			text: "Do you really want to delete this shop?",
			title: "Confirm",
			confirm: function(button) {
				tr = button.parent();
				tr.fadeOut( "slow", function() {
					var new_values = {};

					var id = $(this).attr('data-row_id');
					new_values["id"] = id;
					new_values["to_delete"] = true;

					$(this).remove();

					modify_shop(new_values, false);


				});
			},
			cancel: function(button) {
				// nothing to do
			},
			confirmButton: "Confirm",
			cancelButton: "Cancel",
			post: true,
			confirmButtonClass: "btn-danger",
			cancelButtonClass: "btn-default",
			dialogClass: "modal-dialog modal-lg" // Bootstrap classes for large modal
		});
	});

	$(document).on('click', "#shops_list_table td", function(evt, newValue) {
		var new_values = {};
		var th = $(this).closest('table').find('th').eq( this.cellIndex );
		var id = $(this).closest('tr').attr('data-row_id');
		new_values["param"] = th.attr('data-eng_value');
		new_values["id"] = id;

		$('#shops_list_table td').on('change', function(evt, newValue) {

			// do something with the new cell value
			new_values["value"] = newValue;

			modify_shop(new_values, true);
		});
	});




});

function
get_date_day() {
	var date = new Date();
	var weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
	var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

	var weekday = weekdays[date.getDay()];
	var day = weekdays[date.getDay()];
	var month = months[date.getMonth()];
	var numb_day = date.getDate();
	var year = date.getFullYear();
	var date_en = day + ", " + numb_day + " " + month + " " + year;
	$("#menu_date").append(date_en);
	return weekday;

}

function
show_option_panel(which, what, update) {


	tmp_string = what+"_"+which;
	if (which === false) {
		str = option_panel.replace('modify', 'new');
		$("#"+str).hide();
		$("#"+option_panel).hide();
		option_panel = null;

	} else if(what === false) {
		$("#new_"+which).hide();
	} else if (what === 'new') {

		$("#new_"+which).fadeIn(700);

	} else {
		$("#select_day").children('button').removeClass('active');
		$("#select_day").children('button[data-eng_value='+ DAY+']').first().addClass('active');
		if(tmp_string != option_panel || update) {
			show_day(false, false);
			if(option_panel === null) {
				day = DEFAULT_DAY;
				option_panel = tmp_string;
			}
			str = option_panel.replace('modify', 'new');

			$("#"+str).hide();
			if(tmp_string != option_panel)
				$("#"+option_panel).hide();

			option_panel = tmp_string;
			$("#"+option_panel).fadeIn(700);

			if(autocomplete_id === null) {

			} else {
				arg = "add_"+which+"s_list";
				arg1 = which+"s";
				func = "get_"+which+"s";
				window[func](arg, arg1);
			}
		}
	}
}


function
get_paths(what, where) {

	data = { "request": "paths_names",
		"day": DAY};
	data = JSON.stringify(data);

	var paths = [];
	return $.ajax({
		type: "POST",
		dataType: "json",
		processData: false,
		contentType: 'application/json; charset=utf-8',
		url: "/get_paths",
		data: data,
		success: function (data, state) {
			$.each(data, function(index, element) {
				paths.push(element);

			});

			//	alert(JSON.stringify(loaded_paths));
			loaded_paths = paths;

			//	alert(JSON.stringify(loaded_paths));
			if(what == "add_paths_list") {
				add_paths_list(paths, where, null, null);

			}

		},
		error: function (request, state) {
			alert("An error occurred:\n" + state);
		}});

}


function
add_paths_list(paths, where, new_order, html_content) {

	$("#"+where+"_listTable").empty();
	counter = 0;
	var has_order = false;
	var order = null;

	if(new_order !== null) {
		has_order = true;
		order = new Array(2*(Object.keys(new_order).length));
	}
	paths.forEach(function(path) {
		path_show_more = '<td class="edit-disabled dropdown_from_'+where+'"><span class="glyphicon glyphicon-chevron-down" aria-hidden="true"></span></td>';

		path_name='<td class="print">' + path['name']+ '</td>';
		//path_time='<td class="path_name">' + path['time']+ '</td>';
		path_time = '<td class="edit-disabled"><div class="input-group text-center clockpicker_container clockpicker"  data-autoclose="true" ><input type="text" class="form-control modify_path_time" value='+path['time']+'><span class="input-group-addon "><span class="glyphicon glyphicon-time"></span></span></div></td>';

		path_delete = '<td class="edit-disabled  confirm_path_deletion_from_'+where+'"><span class="glyphicon glyphicon-remove pull-right" aria-hidden="true"></span></td>';
		path_automatic_insertion = '<button type="button" class="btn btn-default btn-sm automatic_insertion pull-right">Automatic Insertion</button><br><br>';


		path_automatic_reorder = '<button type="button" class="btn btn-default btn-sm automatic_reorder_from_'+where+' pull-right">Automatic reordering</button>';
		path_automatic_reversal = '<button type="button" class="btn btn-default btn-sm automatic_reversal_from_'+where+' pull-right">Reverse List</button>';
		path_buttons = '<div class="buttons_list_container">'+path_automatic_insertion+path_automatic_reversal+path_automatic_reorder+'</div>';
		tmp = "<tr id='"+where+"_list_table"+counter+"' data-row_id='"+path['id']+"' class='with_data'>"+path_show_more+path_name+path_time+path_delete+"</tr>";
		tmp_div = '<tr class=""><td class="edit-disabled" colspan=4><div class="lists hiddens"><div class="pull-left ul_list_container"><ul class="sortable_'+where+' shops_list"></ul></div><div class="pull-right insert_new_shop_container"><div class="text-center"></div><div class="input-group"><input type="text" class="form-control autocomplete_input" placeholder="Search"></input><span class="input-group-btn"><button class="btn btn-default add_shop_to_list_from_'+where+'" type="button"><span class="glyphicon glyphicon-plus" aria-hidden="true"></span></button></span></div></div><br>'+path_buttons+'</td></tr>';
		if(!has_order) {
			$("#"+where+"_listTable").append(tmp);
			$("#"+where+"_listTable").append(tmp_div);
		} else {
			var tmp_index = new_order[path['id']]*2;
			var tmp_div_index = tmp_index+1;
			order.splice(tmp_index, 0, tmp);
			order.splice(tmp_div_index, 0, '<tr class="">'+html_content[path['id']]+'</tr>');
		}
		counter++;


	});

	if(has_order) {
		$.each(order, function(i) {
			$("#"+where+"_listTable").append(order[i]);
		});
	}
	//update the table
	$("#"+where+"_listTable").editableTableWidget();

	autocomplete = [];
	$.each(autocomplete_id, function(index, element) {
		autocomplete.push(index);
	});
	$( ".autocomplete_input" ).autocomplete({
		source: autocomplete
	});

}


function
collect_modify_path_data(ul, where, reorder) {

	var to_save = false;
	if(where == "paths")
		to_save = true;
	var tr = ul.closest('tr').prev();
	var id = tr.attr('data-row_id');
	var new_values = {};
	var shops = ul.children('li');
	var shops_id = [];
	$.each(shops, function(index, element) {
		shops_id.push(autocomplete_id[$(this).text()]);
	});

	new_values["param"] = "shops";
	new_values["value"] = shops_id;
	new_values["id"] = id;
	if(reorder)
		new_values["to_order"] = true;
	$.when(modify_path(new_values, to_save, false)).done(function(){
		if(reorder)
			add_ul_list(tr, where);
	});


}


function
get_shops(what) {
	data = { "request": "shops_names",
		"what": "all"};
	data = JSON.stringify(data);
	shops = [];
	$.ajax({
		type: "POST",
		dataType: "json",
		processData: false,
		contentType: 'application/json; charset=utf-8',
		url: "/get_shops",
		data: data,
		success: function (data, state) {
			autocomplete_id = {};
			$.each(data, function(index, element) {
				shops.push(element);
				//build autocomplete_id

				tmp_string = element['city']+", "+element['name'];
				autocomplete_id[tmp_string] = element['id'];
			});

			loaded_shops = shops;
			if(what == "add_shops_list") {
				add_shops_list(shops);
			}


		},
		error: function (request, state) {
			alert("E' evvenuto un errore in signal:\n" + state);
		}
	});

}


function
add_shops_list(shops) {
	$("#shops_listTable").empty();
	shops.forEach(function(shop) {
		shop_city='<td >' + shop['city']+ '</td>';
		shop_name='<td >' + shop['name']+ '</td>';
		shop_distance='<td >' + shop['dist']+ '</td>';
		shop_lat='<td>' + shop['lat']+ '</td>';
		shop_long='<td>' + shop['lng']+ '</td>';
		shop_delete = '<td class="edit-disabled confirm_shop_deletion"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></td>';
		tmp= "<tr id='shops_list_table' data-row_id='"+shop['id']+"' >"+shop_city+ shop_name+shop_distance+shop_lat+shop_long+shop_delete+"</tr>";
		$("#shops_listTable").append(tmp);

	});

	//update shops table
	$('#shops_list_table').editableTableWidget();
	$("#shops_list_table").stupidtable();


}


function
add_new_path() {
	var day = DAY;
	var name = $("#new_path_name").val();
	var time = $("#new_path_time").val();
	data = { "day" : day,
		"name" : name,
		"time": time,
		"to_save": true,
		"to_add": true
	};

	data = JSON.stringify(data);

	$.ajax({
		type: "POST",
		dataType: "json",
		processData: false,
		contentType: 'application/json; charset=utf-8',
		url: "/modify_paths",
		data: data,
		success: function (data, state) {

			get_paths("add_paths_list", "paths");

		},
		error: function (request, state) {
			alert("An error occurred:\n" + state);
		}
	});


}

function
modify_path(new_values, to_save, update) {
	var day = DAY;

	data = { "new_param" : new_values["param"],
		"new_value" : new_values["value"],
		"id" : new_values["id"],
		"to_save" : to_save,
		"day" : day

	};
	if ("to_delete" in new_values) {
		data["to_delete"] = true;
	}
	if ("to_order" in new_values) {
		data["to_order"] = true;
	}



	data = JSON.stringify(data);


	paths = [];
	return $.ajax({
		type: "POST",
		dataType: "json",
		processData: false,
		contentType: 'application/json; charset=utf-8',
		url: "/modify_paths",
		data: data,
		success: function (data, state) {
			//alert("Inserzione andata a buon fine");
			$.each(data, function(index, element) {
				paths.push(element);

			});
			if(data['result'] !== "Request refused") {

				loaded_paths = paths;
				if(update)
					add_paths_list(paths, "paths", null, null);
			} else {
				alert(data['result']);
			}

		},
		error: function (request, state) {
			alert("An error occurred:\n" + state);
		}



	});

}

function
add_new_shop() {

	var new_city = $("#new_shop_city").val();
	var new_name = $("#new_shop_name").val();

	data = { "new_city" : new_city,
		"new_name" : new_name,
		"to_add" : true
	};

	data = JSON.stringify(data);

	$.ajax({
		type: "POST",
		dataType: "json",
		processData: false,
		contentType: 'application/json; charset=utf-8',
		url: "/modify_shops",
		data: data,
		success: function (data, state) {

			get_shops("add_shops_list");
		},
		error: function (request, state) {
			alert("An error occurred:\n" + state);
		}
	});

}


function
modify_shop(new_values, update) {

	data = { "new_param" : new_values["param"],
		"new_value" : new_values["value"],
		"id" : new_values["id"]
	};

	if ("to_delete" in new_values) {
		data["to_delete"] = true;
	}


	data = JSON.stringify(data);

	$.ajax({
		type: "POST",
		dataType: "json",
		processData: false,
		contentType: 'application/json; charset=utf-8',
		url: "/modify_shops",
		data: data,
		success: function (data, state) {
			//alert("Inserzione andata a buon fine");
			if(update)
				get_shops("add_shops_list");
			else
				get_shops(null);

		},
		error: function (request, state) {
			alert("An error occurred:\n" + state);
		}
	});

}


function
show_day(what, from) {
	if(what === false) {
		$('#day_panel').hide();
		day_panel = false;
	} else {
		if(day_panel === false) {
			day_panel = true;
			show_option_panel(false, false, false);
			$('#day_panel').fadeIn(700);
		}
		get_paths("add_paths_list", "days", null);

	}

}

function
add_ul_list(prev_tr, where) {

	var id = prev_tr.attr('data-row_id');
	//var ul = tr.next().children().first();
	var tr = prev_tr.next();
	//tr.next().children('div').first().empty();
	var ul = tr.find('ul.shops_list').first();
	ul.empty();
	$.each(loaded_paths, function(index, element) {
		if(element['id'] == id) {
			$.each(element["shops"], function(index1, element1) {
				//				alert(element1["city"]);
				var li ='<li class="ui-state-default"><img class="arrow_img" src="images/arrow.png">'+element1['city']+", "+element1['name']+'<span class="glyphicon glyphicon-remove pull-right remove_shop_from_'+where+'" aria-hidden="true"></span></li>';
				ul.append(li);
			});
		}
	});

	ul.fadeIn(700);
}

function
collect_days_data(what) {
	var paths = [];
	var table = $("#days_listTable");
	var trs = table.children('tr.with_data');
	var td = null;
	$.each(trs, function() {
		var new_obj = {};
		if(!($(this).hasClass('already_showed')))
			add_ul_list($(this), "days");
		td = $(this).children('.print').first();
		new_obj["name"] = td.text();
		var time = td.next().children().children('input').val();
		new_obj["time"] = time;

		ul = $(this).next().children().find('div.ul_list_container').children('ul.shops_list').first();
		new_obj["shops"] = [];
		$.each(ul.children('li'), function() {
			var new_shop = {};
			var str = $(this).text().split(',');
			new_shop["city"] = str[0];
			new_shop["name"] = str[1];
			new_obj["shops"].push(new_shop);
		});

		paths.push(new_obj);
	});


	if(what == 'print') {
		data = { "paths" : paths
		};

		data = JSON.stringify(data);

		return $.ajax({
			type: "POST",
			dataType: "json",
			processData: false,
			contentType: 'application/json; charset=utf-8',
			url: "/make_print",
			data: data,
			success: function (data, state) {

			},
			error: function (request, state) {
				alert("An error occurred:\n" + state);
			},
		});
	} else {
		return paths;
	}
}


