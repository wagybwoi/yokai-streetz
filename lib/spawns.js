
/********************************************************
  ____  _    _ _____ _      _____ _____ _   _  _____  _____ 
 |  _ \| |  | |_   _| |    |  __ \_   _| \ | |/ ____|/ ____|
 | |_) | |  | | | | | |    | |  | || | |  \| | |  __| (___  
 |  _ <| |  | | | | | |    | |  | || | | . ` | | |_ |\___ \ 
 | |_) | |__| |_| |_| |____| |__| || |_| |\  | |__| |____) |
 |____/ \____/|_____|______|_____/_____|_| \_|\_____|_____/ 
                                                           
********************************************************/

// BUILDING
function Building(width, height, position, materials) {
	this.object = new THREE.Group();
	this.exists = false;
	this.animating = false;
	this.segments = [];
	this.width = width;
	this.height = height;
	this.floorHeight = 2;
	this.columns = Math.floor(Math.random()*2+2);
	this.mesh_groups = {
		structure: [],
		screens_on: [],
		screens_off: [],
		frames: [],
		signs: [[], [], [], [], []],
		fabrics: [[], []],
		wires: []
	};
	this.final_meshes = {};

	var buildingObject_geometry = new THREE.BoxGeometry( width, height, width );
	var buildingObject_material = new THREE.MeshStandardMaterial({color: "#ffffff"});
	var buildingObject = new THREE.Mesh( buildingObject_geometry, buildingObject_material );
	buildingObject.position.set(0, height/2, 0);
	this.mesh_groups.structure.push(buildingObject);

	var sign_colors = ["#0add97", "#00f8ea", "#f1ff39", "#ec2cd2", "#be00ea"];
	var secondary_material = new THREE.MeshBasicMaterial( { color: sign_colors[ Math.floor(Math.random()*sign_colors.length) ], side: THREE.DoubleSide } );

	this.generateDoor = function (door_width, door_height) {
		// Door group
		var door = new THREE.Group();
		var door_complete_geometry = new THREE.Geometry();

		// Door main
		var door_geometry = new THREE.PlaneGeometry( door_width, door_height );
		var door_main = new THREE.Mesh( door_geometry, materials.door_material );

		// Door frames
		var cross_thickness = 0.05;

		var door_vertical_cross_geometry = new THREE.PlaneGeometry( cross_thickness, door_height );
		var vertical_cross_count = 2;
		for(var i = 0; i <= vertical_cross_count; i++) {
			var door_vertical_cross = new THREE.Mesh( door_vertical_cross_geometry, materials.frames );
			door_vertical_cross.position.set(door_width/2 - (door_width/vertical_cross_count)*i, 0, 0);
			door_vertical_cross.updateMatrix();
			door_complete_geometry.merge(door_vertical_cross.geometry, door_vertical_cross.matrix);
		}

		var door_horizontal_cross_geometry = new THREE.PlaneGeometry( door_width, cross_thickness );
		var horizontal_cross_count = Math.floor(Math.random()*3+3);
		for(var i = 0; i <= horizontal_cross_count; i++) {
			var door_horizontal_cross = new THREE.Mesh( door_horizontal_cross_geometry, materials.frames );
			door_horizontal_cross.position.set(0, door_height/2 - (door_height/horizontal_cross_count)*i, 0);
			door_horizontal_cross.updateMatrix();
			door_complete_geometry.merge(door_horizontal_cross.geometry, door_horizontal_cross.matrix);
		}

		var door_crosses_main = new THREE.Mesh(door_complete_geometry, materials.frames);

		var flap_count = Math.floor(Math.random()*3+4);
		var flap_door_width = door_width*1.1;
		var flap_width = flap_door_width/flap_count;
		var flaps_complete_geometry = new THREE.Geometry();
		var flap_material_index = Math.floor(Math.random()*this.mesh_groups.fabrics.length);
		for(var i = -flap_count/2; i < flap_count/2; i++) {
			var new_flap_geometry = new THREE.PlaneGeometry( flap_width, 0.6 );
			var new_flap = new THREE.Mesh( new_flap_geometry, materials.fabrics[flap_material_index] );
		    new_flap.geometry.vertices[0].y = new_flap.geometry.vertices[1].y = 0.05/2;
		    new_flap.geometry.vertices[0].x = new_flap.geometry.vertices[0].x*1.15;
		    new_flap.geometry.vertices[1].x = new_flap.geometry.vertices[1].x*1.15;
		    new_flap.geometry.vertices[2].x = new_flap.geometry.vertices[2].x*(i != flap_count/2-1 ? 0.8 : 1.15);
		    new_flap.geometry.vertices[3].x = new_flap.geometry.vertices[3].x*(i != -flap_count/2 ? 0.8 : 1.15);
		    new_flap.geometry.verticesNeedUpdate = true;
			new_flap.position.set((-flap_width)*i-flap_width/2, 0, 0);
			new_flap.rotation.set(-(Math.PI/180)*6, 0, 0);
			new_flap.updateMatrix();
			flaps_complete_geometry.merge(new_flap.geometry, new_flap.matrix);
		}
		var flaps_main = new THREE.Mesh(flaps_complete_geometry, materials.fabrics[flap_material_index]);

		this.mesh_groups.screens_on.push(door_main);
		this.mesh_groups.frames.push(door_crosses_main);
		this.mesh_groups.fabrics[flap_material_index].push(flaps_main);

		door_main.position.set(0, door_height/2, this.width/2 + 0.01);
		door_crosses_main.position.set(0, door_height/2, this.width/2 + 0.02);
		flaps_main.position.set(0, door_height, this.width/2 + 0.03);
	}

	this.generateLantern = function (offset_from_center) {
		// LANTERN BALL
		var distanceFromWall = 0.1;
		var lantern_ball_radius = 0.2 + (Math.random()/10);
		var fabric_material_index = Math.floor(Math.random()*this.mesh_groups.fabrics.length);
		var lantern_ball_geometry = new THREE.SphereGeometry( lantern_ball_radius );
		var lantern_ball = new THREE.Mesh( lantern_ball_geometry, materials.fabrics[fabric_material_index] );
		this.mesh_groups.fabrics[fabric_material_index].push(lantern_ball);
		lantern_ball.position.set(offset_from_center, this.floorHeight*0.75, this.width/2 + lantern_ball_radius + distanceFromWall);
		lantern_ball.scale.set(1, 0.8, 1);

		// LANTERN ENDS
		var lantern_ends_radius = lantern_ball_radius*0.5;
		var lantern_ends_height = 0.05;

		var lantern_top_geometry = new THREE.CylinderGeometry( lantern_ends_radius, lantern_ends_radius, lantern_ends_height );
		var lantern_top = new THREE.Mesh( lantern_top_geometry, materials.frames );
		this.mesh_groups.frames.push(lantern_top);
		lantern_top.position.set(offset_from_center, this.floorHeight*0.75 + lantern_ball_radius*0.8, this.width/2 + lantern_ball_radius + distanceFromWall);

		var lantern_bottom_geometry = new THREE.CylinderGeometry( lantern_ends_radius, lantern_ends_radius, lantern_ends_height );
		var lantern_bottom = new THREE.Mesh( lantern_top_geometry, materials.frames );
		this.mesh_groups.frames.push(lantern_bottom);
		lantern_bottom.position.set(offset_from_center, this.floorHeight*0.75 - lantern_ball_radius*0.8, this.width/2 + lantern_ball_radius + distanceFromWall);
	
		// LANTERN STICK
		// var lantern_stick_geometry = new THREE.PlaneGeometry( lantern_ball_radius + distanceFromWall, 0.05 );
		var lantern_stick_geometry = new THREE.BoxGeometry( lantern_ball_radius + distanceFromWall, 0.05, 0.1 );
		var lantern_stick = new THREE.Mesh( lantern_stick_geometry, materials.frames );
		this.mesh_groups.structure.push(lantern_stick);
		lantern_stick.position.set(offset_from_center, this.floorHeight*0.75 + lantern_ball_radius*0.8 + lantern_ends_height + 0.02, this.width/2 + (lantern_ball_radius + distanceFromWall)/2);
		lantern_stick.rotation.set(0, Math.PI/2, 0);
	}

	this.generateWindow = function (wndw_width, wndw_height, current_floor, wndw_index) {
		// Window group
		var wndw = new THREE.Group();
		var wndw_complete_cross_geometry = new THREE.Geometry();

		// Window main
		var wndw_geometry = new THREE.PlaneGeometry( wndw_width, wndw_height );
		var wndw_main = new THREE.Mesh( wndw_geometry, materials.screens_on );
		wndw.add(wndw_main);

		// Window crosses
		var cross_thickness = /*door_width/10*/0.05;

		var wndw_vertical_cross_geometry = new THREE.PlaneGeometry( cross_thickness, wndw_height );

		var vertical_cross_count = 2;
		for(var i = 0; i <= vertical_cross_count; i++) {
			var wndw_vertical_cross = new THREE.Mesh( wndw_vertical_cross_geometry, materials.cross_material );
			// wndw.add(wndw_vertical_cross);
			wndw_vertical_cross.position.set(wndw_width/2 - (wndw_width/vertical_cross_count)*i, 0, 0);
			wndw_vertical_cross.updateMatrix();
			wndw_complete_cross_geometry.merge(wndw_vertical_cross.geometry, wndw_vertical_cross.matrix);
		}

		var wndw_horizontal_cross_geometry = new THREE.PlaneGeometry( wndw_width, cross_thickness );

		var horizontal_cross_count = 2;
		for(var i = 0; i <= horizontal_cross_count; i++) {
			var wndw_horizontal_cross = new THREE.Mesh( wndw_horizontal_cross_geometry, materials.cross_material );
			wndw_horizontal_cross.position.set(0, wndw_height/2 - (wndw_height/horizontal_cross_count)*i, 0);
			wndw_horizontal_cross.updateMatrix();
			wndw_complete_cross_geometry.merge(wndw_horizontal_cross.geometry, wndw_horizontal_cross.matrix);
		}

		var wndw_crosses = new THREE.Mesh(wndw_complete_cross_geometry, materials.cross_material);
		wndw_crosses.position.set(0, 0, 0.01);
		wndw.add(wndw_crosses);

		this.mesh_groups.screens_on.push(wndw_main);
		this.mesh_groups.frames.push(wndw_crosses);

		wndw_main.position.set(this.width/2 - ((this.width/this.columns)*wndw_index) - (this.width/this.columns)/2, (this.floorHeight*current_floor) + this.floorHeight*0.5, this.width/2 + 0.01);
		wndw_crosses.position.set(this.width/2 - ((this.width/this.columns)*wndw_index) - (this.width/this.columns)/2, (this.floorHeight*current_floor) + this.floorHeight*0.5, this.width/2 + 0.02);
	}

	this.generateTV = function (tv_width, tv_height, current_floor) {
		// Window main
		var tv_screen_geometry = new THREE.PlaneGeometry( tv_width, tv_height );
		var tv_screen_main_1_material_index = Math.floor(Math.random()*this.mesh_groups.signs.length);
		var tv_screen_main_1 = new THREE.Mesh( tv_screen_geometry, materials.door_material );
		var tv_screen_main_2_material_index;
		while(tv_screen_main_2_material_index == undefined || tv_screen_main_2_material_index == tv_screen_main_1_material_index) {
			tv_screen_main_2_material_index = Math.floor(Math.random()*this.mesh_groups.signs.length);
		}
		var tv_screen_main_2 = new THREE.Mesh( tv_screen_geometry, materials.door_material );

		this.mesh_groups.signs[tv_screen_main_1_material_index].push(tv_screen_main_1);
		this.mesh_groups.signs[tv_screen_main_2_material_index].push(tv_screen_main_2);

		tv_screen_main_1.position.set(0.01, (this.floorHeight*current_floor) + this.floorHeight*0.5, this.width/2 + 0.25);
		tv_screen_main_1.rotation.set(Math.PI/15, 0, 0);
		tv_screen_main_2.position.set(0, (this.floorHeight*current_floor) + this.floorHeight*0.5, this.width/2 + 0.25);
		tv_screen_main_2.rotation.set(Math.PI/15, 0, 0);
	}

	this.generateBalcony = function (balcony_width, balcony_height, balcony_depth, current_floor) {
		// Balcony group
		var balcony = new THREE.Group();

		var balcony_complete_bars_geometry = new THREE.Geometry();

		// Balcony main
		var balcony_geometry = new THREE.PlaneGeometry( balcony_width, balcony_depth );
		var balcony_material = new THREE.MeshStandardMaterial( {color: "#ffffff"} );
		var balcony_main = new THREE.Mesh( balcony_geometry, balcony_material );
		balcony_main.position.set( 0, -balcony_height/2, 0 );
		balcony_main.rotation.set( Math.PI/2, 0, 0 );
		balcony.add(balcony_main);

		var balcony_geometry_2 = new THREE.PlaneGeometry( balcony_width, 0.2 );
		var balcony_main_2 = new THREE.Mesh( balcony_geometry_2, balcony_material );
		balcony_main_2.position.set( 0, balcony_height/2, balcony_depth/2 - 0.1 );
		balcony_main_2.rotation.set( Math.PI/2, 0, 0 );
		balcony.add(balcony_main_2);
		
		// Balcony bars
		var balcony_bar_geometry = new THREE.PlaneGeometry( 0.1, balcony_height );
		var balcony_bar_material = new THREE.MeshStandardMaterial();
		var bar_count = 10;
		for(var i = 0; i < bar_count; i++) {
			var balcony_bar = new THREE.Mesh( balcony_bar_geometry, balcony_bar_material );
			balcony_bar.position.set( (balcony_width-0.3)/2 - ((balcony_width-0.3)/(bar_count-1))*i, balcony_height/4, balcony_depth/2 - 0.1);
			balcony_bar.updateMatrix();
			balcony_complete_bars_geometry.merge(balcony_bar.geometry, balcony_bar.matrix);
		}

		var balcony_complete_bars = new THREE.Mesh(balcony_complete_bars_geometry, materials.frames);
		balcony_complete_bars.position.set(0, -balcony_height/4, 0);
		balcony.add(balcony_complete_bars);

		this.mesh_groups.structure.push(balcony_main);
		this.mesh_groups.structure.push(balcony_main_2);
		this.mesh_groups.frames.push(balcony_complete_bars);

		balcony_main.position.set(balcony_main.position.x + 0, balcony_main.position.y + this.floorHeight*current_floor + this.floorHeight*0.3, balcony_main.position.z + this.width/2 + balcony_depth/2);
		balcony_main_2.position.set(balcony_main_2.position.x + 0, balcony_main_2.position.y + this.floorHeight*current_floor + this.floorHeight*0.3, balcony_main_2.position.z + this.width/2 + balcony_depth/2);
		balcony_complete_bars.position.set(balcony_complete_bars.position.x + 0, balcony_complete_bars.position.y + this.floorHeight*current_floor + this.floorHeight*0.3, balcony_complete_bars.position.z + this.width/2 + balcony_depth/2);
	}

	this.generateSign = function (sign_width, sign_height, sign_bar_width, sign_bar_height, sign_border_width, current_floor, textGeo) {
		// Sign group
		var sign = new THREE.Group();

		var sign_complete_bars_geometry = new THREE.Geometry();

		// Sign main
		var sign_geometry = new THREE.PlaneGeometry( sign_width, sign_height );
		var sign_material = new THREE.MeshBasicMaterial( { color: secondary_material, side: THREE.DoubleSide } );
		var sign_main = new THREE.Mesh( sign_geometry, sign_material );
		sign_main.rotation.set( 0, Math.PI/2, 0 );
		sign.add(sign_main);

		// Sign text 1
		var randomTextIndex = Math.floor(Math.random()*japaneseText.length);
		var sign_text_front = new THREE.Mesh( textGeo, materials.screens_on );
		sign_text_front.rotation.set(Math.PI, position.x < 0 ? Math.PI/2 : -Math.PI/2, 0);
		sign_text_front.scale.setScalar(3);

		// Sign text 2
		var sign_text_back = new THREE.Mesh( textGeo, materials.screens_on );
		sign_text_back.rotation.set(Math.PI, position.x < 0 ? Math.PI/2 : -Math.PI/2, 0);
		sign_text_back.scale.setScalar(3);

		// Sign bars
		var sign_bar_geometry = new THREE.PlaneGeometry( sign_bar_width, sign_bar_height );

		var sign_bar_1 = new THREE.Mesh( sign_bar_geometry, materials.frames );
		sign_bar_1.position.set( 0, (sign_height/2)*0.5, -sign_width/2 - sign_bar_width/2 );
		sign_bar_1.rotation.set( 0, Math.PI/2, 0 );
		sign_bar_1.updateMatrix();
		sign_complete_bars_geometry.merge( sign_bar_1.geometry, sign_bar_1.matrix );

		var sign_bar_2 = new THREE.Mesh( sign_bar_geometry, materials.frames );
		sign_bar_2.position.set( 0, -(sign_height/2)*0.5, -sign_width/2 - sign_bar_width/2 );
		sign_bar_2.rotation.set( 0, Math.PI/2, 0 );
		sign_bar_2.updateMatrix();
		sign_complete_bars_geometry.merge( sign_bar_2.geometry, sign_bar_2.matrix );

		// Sign border bars
		var sign_border_complete_geometry = new THREE.Geometry();

		var sign_border_bar_1_geometry = new THREE.PlaneGeometry( sign_width+sign_border_width, sign_border_width );
		var sign_border_bar_1 = new THREE.Mesh( sign_border_bar_1_geometry, materials.frames );
		sign_border_bar_1.position.set( 0, sign_height/2, 0 );
		sign_border_bar_1.rotation.set( 0, Math.PI/2, 0 );
		sign_border_bar_1.updateMatrix();
		// sign_complete_bars_geometry.merge( sign_border_bar_1.geometry, sign_border_bar_1.matrix );
		sign_border_complete_geometry.merge( sign_border_bar_1.geometry, sign_border_bar_1.matrix );

		var sign_border_bar_2_geometry = new THREE.PlaneGeometry( sign_border_width, sign_height+sign_border_width );
		var sign_border_bar_2 = new THREE.Mesh( sign_border_bar_2_geometry, materials.frames );
		sign_border_bar_2.position.set( 0, 0, -sign_width/2 );
		sign_border_bar_2.rotation.set( 0, Math.PI/2, 0 );
		sign_border_bar_2.updateMatrix();
		// sign_complete_bars_geometry.merge( sign_border_bar_2.geometry, sign_border_bar_2.matrix );
		sign_border_complete_geometry.merge( sign_border_bar_2.geometry, sign_border_bar_2.matrix );

		var sign_border_bar_3_geometry = new THREE.PlaneGeometry( sign_width+sign_border_width, sign_border_width );
		var sign_border_bar_3 = new THREE.Mesh( sign_border_bar_3_geometry, materials.frames );
		sign_border_bar_3.position.set( 0, -sign_height/2, 0 );
		sign_border_bar_3.rotation.set( 0, Math.PI/2, 0 );
		sign_border_bar_3.updateMatrix();
		// sign_complete_bars_geometry.merge( sign_border_bar_3.geometry, sign_border_bar_3.matrix );
		sign_border_complete_geometry.merge( sign_border_bar_3.geometry, sign_border_bar_3.matrix );

		var sign_border_bar_4_geometry = new THREE.PlaneGeometry( sign_border_width, sign_height+sign_border_width );
		var sign_border_bar_4 = new THREE.Mesh( sign_border_bar_4_geometry, materials.frames );
		sign_border_bar_4.position.set( 0, 0, sign_width/2 );
		sign_border_bar_4.rotation.set( 0, Math.PI/2, 0 );
		sign_border_bar_4.updateMatrix();
		// sign_complete_bars_geometry.merge( sign_border_bar_4.geometry, sign_border_bar_4.matrix );
		sign_border_complete_geometry.merge( sign_border_bar_4.geometry, sign_border_bar_4.matrix );

		var sign_border_complete_front = new THREE.Mesh( sign_border_complete_geometry, materials.frames );
		sign_border_complete_front.position.set(0.01, 0, 0);
		sign_border_complete_front.updateMatrix();
		sign_complete_bars_geometry.merge( sign_border_complete_front.geometry, sign_border_complete_front.matrix );
		var sign_border_complete_back = new THREE.Mesh( sign_border_complete_geometry, materials.frames );
		sign_border_complete_back.position.set(-0.01, 0, 0);
		sign_border_complete_back.updateMatrix();
		sign_complete_bars_geometry.merge( sign_border_complete_back.geometry, sign_border_complete_back.matrix );

		// Sign final generation
		var sign_complete_bars = new THREE.Mesh(sign_complete_bars_geometry, materials.frames);
		sign.add(sign_complete_bars);

		this.mesh_groups.signs[Math.floor(Math.random()*this.mesh_groups.signs.length)].push(sign_main);
		this.mesh_groups.frames.push(sign_complete_bars);
		this.mesh_groups.wires.push(sign_text_front);
		this.mesh_groups.wires.push(sign_text_back);

		var sign_offset = (Math.random()-0.5);
		sign_main.position.set((-this.width/2)*0.95, this.floorHeight*current_floor + this.floorHeight*0.5 + sign_offset, this.width/2 + sign_width/2 + sign_bar_width);
		sign_text_front.position.set((-this.width/2)*0.95 + 0.03, this.floorHeight*current_floor + this.floorHeight*0.5 + sign_offset, this.width/2 + sign_width/2 + sign_bar_width);
		sign_text_back.position.set((-this.width/2)*0.95 - 0.03, this.floorHeight*current_floor + this.floorHeight*0.5 + sign_offset, this.width/2 + sign_width/2 + sign_bar_width);
		sign_complete_bars.position.set((-this.width/2)*0.95, this.floorHeight*current_floor + this.floorHeight*0.5 + sign_offset, this.width/2 + sign_width/2 + sign_bar_width);
	}

	this.generateFirstFloor = function () {
		var door_dimensions = {width: this.width*0.2, height: this.floorHeight*0.8};
		var door = this.generateDoor(door_dimensions.width, door_dimensions.height);

		if(Math.random() > 0.5) this.generateLantern( this.width*0.25 );
		if(Math.random() > 0.5) this.generateLantern( -this.width*0.25 );
	}

	this.generateFloor = function (floor) {
		// Generating a row of windows
		var building_width = this.width;
		var building_height = this.height;

		var random_floor_generation = Math.random();
		if(random_floor_generation >= 0.1) {
			// WINDOW GENERATION
			var wndw_dimensions = {width: building_width*0.2, height: building_width*0.2};
			for(var i = 0; i < this.columns; i++) {
				var wndw = this.generateWindow(wndw_dimensions.width, wndw_dimensions.height, floor, i);
			}

			// BALCONY GENERATION
			if(Math.random() < 0.5) {
				var balcony_dimensions = {width: building_width*0.9, height: this.floorHeight*0.3, depth: this.floorHeight*0.4};
				var balcony = this.generateBalcony(balcony_dimensions.width, balcony_dimensions.height, balcony_dimensions.depth, floor);
			}
		} else {
			// Z-FIGHTING TV GENERATION
			var tv_dimensions = {width: building_width*0.7, height: this.floorHeight*0.8};
			var tv = this.generateTV(tv_dimensions.width, tv_dimensions.height, floor);
		}

		// SIGN GENERATION
		if(Math.random() < 0.8) {
			var randomSignText = Math.floor(Math.random()*japaneseText.length);
			var sign_dimensions = {width: japaneseText[randomSignText].size.x, height: japaneseText[randomSignText].size.y, bar_width: Math.random()/2+0.1, bar_height: 0.1, border_width: 0.04};
			var sign = this.generateSign(sign_dimensions.width, sign_dimensions.height, sign_dimensions.bar_width, sign_dimensions.bar_height, sign_dimensions.border_width, floor, japaneseText[randomSignText].geo);
		}
	}

	this.combine = function() {
		var structure_geometry = new THREE.Geometry();
		var screens_on_geometry = new THREE.Geometry();
		var frames_geometry = new THREE.Geometry();
		var signs_geometry = [new THREE.Geometry(), new THREE.Geometry(), new THREE.Geometry(), new THREE.Geometry(), new THREE.Geometry()];
		var fabrics_geometry = [new THREE.Geometry(), new THREE.Geometry(), new THREE.Geometry(), new THREE.Geometry()];
		var wires_geometry = new THREE.Geometry();

		// STRUCTURE GEO
		for(var i = 0; i < this.mesh_groups.structure.length; i++) {
			this.mesh_groups.structure[i].updateMatrix();
			structure_geometry.merge(this.mesh_groups.structure[i].geometry, this.mesh_groups.structure[i].matrix);
		}
		var structure_complete = new THREE.Mesh(structure_geometry, materials.structures);
		this.final_meshes.structures = structure_complete;
		structure_complete.position.set(position.x, 0, position.z);
		structure_complete.rotation.set(0, (position.x < 0 ? Math.PI/2 : -Math.PI/2), 0);

		// SCREEN GEO
		for(var i = 0; i < this.mesh_groups.screens_on.length; i++) {
			this.mesh_groups.screens_on[i].updateMatrix();
			screens_on_geometry.merge(this.mesh_groups.screens_on[i].geometry, this.mesh_groups.screens_on[i].matrix);
		}
		var screens_on_complete = new THREE.Mesh(screens_on_geometry, materials.screens_on);
		this.final_meshes.screens_on = screens_on_complete;
		screens_on_complete.position.set(position.x, 0, position.z);
		screens_on_complete.rotation.set(0, (position.x < 0 ? Math.PI/2 : -Math.PI/2), 0);

		// FRAME GEO
		for(var i = 0; i < this.mesh_groups.frames.length; i++) {
			this.mesh_groups.frames[i].updateMatrix();
			frames_geometry.merge(this.mesh_groups.frames[i].geometry, this.mesh_groups.frames[i].matrix);
		}
		var frames_complete = new THREE.Mesh(frames_geometry, materials.frames);
		this.final_meshes.frames = frames_complete;
		frames_complete.position.set(position.x, 0, position.z);
		frames_complete.rotation.set(0, (position.x < 0 ? Math.PI/2 : -Math.PI/2), 0);

		// SIGNS GEO
		this.final_meshes.signs = [];
		for(var i = 0; i < this.mesh_groups.signs.length; i++) {
			for(var j = 0; j < this.mesh_groups.signs[i].length; j++) {
				this.mesh_groups.signs[i][j].updateMatrix();
				signs_geometry[i].merge(this.mesh_groups.signs[i][j].geometry, this.mesh_groups.signs[i][j].matrix);
			}
			var signs_complete = new THREE.Mesh(signs_geometry[i], materials.signs[i]);
			this.final_meshes.signs[i] = signs_complete;
			signs_complete.position.set(position.x, 0, position.z);
			signs_complete.rotation.set(0, (position.x < 0 ? Math.PI/2 : -Math.PI/2), 0);
		}

		// FABRICS GEO
		this.final_meshes.fabrics = [];
		for(var i = 0; i < this.mesh_groups.fabrics.length; i++) {
			for(var j = 0; j < this.mesh_groups.fabrics[i].length; j++) {
				this.mesh_groups.fabrics[i][j].updateMatrix();
				fabrics_geometry[i].merge(this.mesh_groups.fabrics[i][j].geometry, this.mesh_groups.fabrics[i][j].matrix);
			}
			var fabrics_complete = new THREE.Mesh(fabrics_geometry[i], materials.fabrics[i]);
			this.final_meshes.fabrics[i] = fabrics_complete;
			fabrics_complete.position.set(position.x, 0, position.z);
			fabrics_complete.rotation.set(0, (position.x < 0 ? Math.PI/2 : -Math.PI/2), 0);
		}

		// WIRES GEO
		for(var i = 0; i < this.mesh_groups.wires.length; i++) {
			this.mesh_groups.wires[i].updateMatrix();
			wires_geometry.merge(this.mesh_groups.wires[i].geometry, this.mesh_groups.wires[i].matrix);
		}
		var wires_complete = new THREE.Mesh(wires_geometry, materials.wires);
		this.final_meshes.wires = wires_complete;
		wires_complete.position.set(position.x, 0, position.z);
		wires_complete.rotation.set(0, (position.x < 0 ? Math.PI/2 : -Math.PI/2), 0);
	}

	for(var floor = 0; floor < this.height/this.floorHeight; floor++) {
		if(floor == 0) {
			this.generateFirstFloor();
		} else if(floor == this.height/this.floorHeight - 1) {
			// this.generateTopFloor();
			this.generateFloor(floor);
		} else {
			this.generateFloor(floor);
		}
	}

	this.combine();
}






/********************************************************
   _____ _____ _________     __   _____ ______ _   _ 
  / ____|_   _|__   __\ \   / /  / ____|  ____| \ | |
 | |      | |    | |   \ \_/ /  | |  __| |__  |  \| |
 | |      | |    | |    \   /   | | |_ |  __| | . ` |
 | |____ _| |_   | |     | |    | |__| | |____| |\  |
  \_____|_____|  |_|     |_|     \_____|______|_| \_|

********************************************************/







function City( building_width, length_in_buildings ) {
	this.building_width = building_width;
	this.length_in_buildings = length_in_buildings;
	this.object = new THREE.Group();
	this.materials = {
		structures: [
			new THREE.MeshStandardMaterial( {color: "#005de5", roughness: 1, metalness: 0.1, side: THREE.DoubleSide, flatShading: true} ),
			new THREE.MeshStandardMaterial( {color: "#0045be", roughness: 1, metalness: 0.1, side: THREE.DoubleSide, flatShading: true} ),
			new THREE.MeshStandardMaterial( {color: "#293882", roughness: 1, metalness: 0.1, side: THREE.DoubleSide, flatShading: true} ),
			new THREE.MeshStandardMaterial( {color: "#5a2f93", roughness: 1, metalness: 0.1, side: THREE.DoubleSide, flatShading: true} ),
			new THREE.MeshStandardMaterial( {color: "#431c7f", roughness: 1, metalness: 0.1, side: THREE.DoubleSide, flatShading: true} )
		],
		signs: [
			new THREE.MeshBasicMaterial( {color: "#21ffb5", side: THREE.DoubleSide} ),
			new THREE.MeshBasicMaterial( {color: "#21fff5", side: THREE.DoubleSide} ),
			new THREE.MeshBasicMaterial( {color: "#f6ff3b", side: THREE.DoubleSide} ),
			new THREE.MeshBasicMaterial( {color: "#fc2ce3", side: THREE.DoubleSide} ),
			new THREE.MeshBasicMaterial( {color: "#cd00ff", side: THREE.DoubleSide} )
		],
		fabrics: [
			new THREE.MeshBasicMaterial( {color: "#d35430", side: THREE.DoubleSide} ),
			new THREE.MeshBasicMaterial( {color: "#a92021", side: THREE.DoubleSide} )
		],
		screens_on: new THREE.MeshBasicMaterial( {color: new THREE.Color("#feffca")} ),
		screens_off: new THREE.MeshBasicMaterial( {color: new THREE.Color("#0f0d32")} ),
		frames: new THREE.MeshBasicMaterial( {color: new THREE.Color("#66024c"), side: THREE.DoubleSide} ),
		wires: new THREE.MeshBasicMaterial( {color: "#000000", side: THREE.DoubleSide} ),
		ground_bits: new THREE.MeshBasicMaterial( {color: "#322675"} )
	};
	this.mesh_groups = {
		structures: [ [], [], [], [], [] ],
		signs: [ [], [], [], [], [] ],
		fabrics: [ [], [] ],
		screens_on: [],
		screens_off: [],
		frames: [],
		wires: [],
		ground_bits: []
	};
	this.geometries = {
		structures: [new THREE.Geometry(), new THREE.Geometry(), new THREE.Geometry(), new THREE.Geometry(), new THREE.Geometry()],
		signs: [new THREE.Geometry(), new THREE.Geometry(), new THREE.Geometry(), new THREE.Geometry(), new THREE.Geometry()],
		fabrics: [new THREE.Geometry(), new THREE.Geometry()],
		screens_on: new THREE.Geometry(),
		screens_off: new THREE.Geometry(),
		frames: new THREE.Geometry(),
		wires: new THREE.Geometry(),
		ground_bits: new THREE.Geometry()
	};
	this.buildingData = [];

	// CREATE BUILDINGS
	this.generateBuildings = function() {
		for(var i = 0; i < length_in_buildings*2; i++) {
			var structure_index = Math.floor(Math.random()*this.materials.structures.length);
			var sign_index = Math.floor(Math.random()*this.materials.signs.length);
			var new_building_materials = {
				structures: this.materials.structures[structure_index],
				signs: this.materials.signs,
				fabrics: this.materials.fabrics,
				screens_on: this.materials.screen_on,
				screens_off: this.materials.screen_off,
				frames: this.materials.frames,
				wires: this.materials.wires
			};
			var new_building_height = Math.floor((Math.random()*4))*2+4;
			var new_building_side = i%2 == 0 ? "left" : "right";
			var new_building_position = new THREE.Vector3(
				(4.5 + (Math.random()-0.5)/3) * (new_building_side=="left" ? -1 : 1),
				0,
				(building_width/2)*(new_building_side=="left" ? i : i-1) + (building_width/2)
			);
			var new_building = new Building( building_width, new_building_height, new_building_position, new_building_materials);

			// PASS BUILDING FINAL MESHES TO CITY'S MESH GROUPS
			this.mesh_groups.structures[structure_index].push(new_building.final_meshes.structures);
			for(var s = 0; s < this.mesh_groups.signs.length; s++) {
				this.mesh_groups.signs[s].push(new_building.final_meshes.signs[s]);
			}
			for(var f = 0; f < this.mesh_groups.fabrics.length; f++) {
				this.mesh_groups.fabrics[f].push(new_building.final_meshes.fabrics[f]);
			}
			this.mesh_groups.screens_on.push(new_building.final_meshes.screens_on);
			this.mesh_groups.frames.push(new_building.final_meshes.frames);
			this.mesh_groups.wires.push(new_building.final_meshes.wires);

			// KEEP TRACK OF BUILDING DATA
			this.buildingData.push({
				position: new_building_position,
				width: new_building.width,
				height: new_building_height,
				floorHeight: new_building.floorHeight,
				side: new_building_side
			});
		}
	}

	// CREATE WIRES ALL OVER CITY
	this.generateWires = function() {
		var complete_wire_geometry = new THREE.Geometry();
		for(var wire_gen_iterator = 0; wire_gen_iterator < 1; wire_gen_iterator++) {
			for(var i = 0; i < this.buildingData.length; i++) {
				var buildingData1 = this.buildingData[i];
				var buildingData2 = undefined;

				if(buildingData1.position.x < 0) {
					buildingData2 = this.buildingData[i + 1];
				} else {
					buildingData2 = this.buildingData[i - 1];
				}

				// while( buildingData2 == undefined || buildingData2 == buildingData1 || ((buildingData2.position.x < 0 && buildingData1.position.x < 0) || (buildingData2.position.x > 0 && buildingData1.position.x > 0)) ) {
				// 	var randomBuildingInAreaIndex = i + Math.floor(Math.random()*4-2);
				// 	if(this.buildingData[randomBuildingInAreaIndex] != undefined) buildingData2 = this.buildingData[randomBuildingInAreaIndex];
				// }

				var shorterBuilding = buildingData1.height <= buildingData2.height ? buildingData1 : buildingData2;
				var tallerBuilding = shorterBuilding == buildingData1 ? buildingData2 : buildingData1;

				var z_offset =   Math.random()*shorterBuilding.width-(shorterBuilding.width/2);
				var startPos = new THREE.Vector3(shorterBuilding.position.x + (shorterBuilding.position.x < 0 ? shorterBuilding.width/2 : -shorterBuilding.width/2), shorterBuilding.floorHeight*Math.floor(Math.random()*(shorterBuilding.height/shorterBuilding.floorHeight))+(shorterBuilding.floorHeight), shorterBuilding.position.z + z_offset);
				var endHeight = undefined;
				// while( endHeight == undefined || endHeight > tallerBuilding.height || endHeight == 0) {
					endHeight = startPos.y/* + Math.round(Math.random()*2-1) * shorterBuilding.floorHeight*/;
				// }
				var endPos = new THREE.Vector3( tallerBuilding.position.x + (tallerBuilding.position.x < 0 ? tallerBuilding.width/2 : -tallerBuilding.width/2), endHeight, tallerBuilding.position.z + z_offset);

				// if((startPos.y == shorterBuilding.floorHeight) && (endPos.y == shorterBuilding.floorHeight)) continue;

				var wire_curve = new THREE.LineCurve( startPos, endPos );
				var wire_geometry = new THREE.TubeGeometry( wire_curve, 5, 0.015, 3, false );
				var wire_mesh = new THREE.Mesh( wire_geometry, this.materials.wires );
				complete_wire_geometry.merge(wire_mesh.geometry, wire_mesh.matrix);

				// GENERATE PAPERS ALONG WIRES
				var paper_dimensions = {width: 0.1, height: 0.2};
				// var paper_angle = Math.acos(new THREE.Vector2(endPos.x-startPos.x, endPos.z-startPos.z).normalize().dot(new THREE.Vector2(1, 0)));
				// var paper_angle = Math.atan2(startPos.y-endPos.y, startPos.x-endPos.x)
				// var paper_angle = Math.atan2(endPos.z, endPos.x) - Math.atan2(startPos.z, startPos.x);
				// if (paper_angle < 0) paper_angle += (2*Math.PI);
				// console.log(paper_angle);

				var paper_count = (startPos.distanceTo(endPos)/paper_dimensions.width)/3;
				var paper_geometry = new THREE.PlaneGeometry( paper_dimensions.width, paper_dimensions.height );
				for(var p = 1; p < paper_count-1; p++) {
					var randomPaperColorIndex = Math.floor(Math.random()*this.materials.fabrics.length);
					var paper_mesh = new THREE.Mesh( paper_geometry, this.materials.fabrics[randomPaperColorIndex] );
					var paper_mesh_position = new THREE.Vector3( startPos.x+((endPos.x-startPos.x)/paper_count)*p, startPos.y+((endPos.y-startPos.y)/paper_count)*p-paper_dimensions.height/2, startPos.z+((endPos.z-startPos.z)/paper_count)*p );
					paper_mesh.position.set(paper_mesh_position.x, paper_mesh_position.y, paper_mesh_position.z);
					// paper_mesh.rotation.set(0, paper_angle, 0);
					paper_mesh.updateMatrix();
					this.mesh_groups.fabrics[randomPaperColorIndex].push(paper_mesh);
				}
			}
		}
		var final_wires = new THREE.Mesh( complete_wire_geometry, this.materials.wires );
		// this.object.add(final_wires);
		this.mesh_groups.wires.push(final_wires);
	}

	// CREATE STARS ALL OVER CITY
	this.generateStars = function() {
		var complete_stars_geometry = new THREE.Geometry();
		for(var i = 0; i < this.building_width * this.length_in_buildings; i += 0.3) {
			var star_geo = new THREE.SphereGeometry( 0.05, 4, 2 );
			var star = new THREE.Mesh( star_geo, this.materials.screens_on );
			star.position.set( Math.random()*30-15, 20 + (Math.random()*10-5), i + (Math.random()*10-5) );
			star.updateMatrix();
			complete_stars_geometry.merge(star.geometry, star.matrix);
		}
		var final_stars = new THREE.Mesh( complete_stars_geometry, this.materials.screens_on );
		scene.add(final_stars);
		final_stars.rotation.y = Math.PI;
	}

	// GENERATE GROUND ELEMENTS FOR TEXTURE
	this.generateGroundBits = function() {
		var distance = length_in_buildings*building_width;
		var complete_ground_bits_geometry = new THREE.Geometry();
		var ground_bit_count_per_chunk = 50;

		for(var i = 0; i < distance; i+=building_width) {
			for(var j = 0; j < ground_bit_count_per_chunk; j++) {
				var ground_bit_geometry = new THREE.PlaneGeometry( Math.random()*1+0.5, Math.random()*1+0.5 );		
				var ground_bit = new THREE.Mesh( ground_bit_geometry, this.materials.ground_bits );
				ground_bit.position.set(Math.random()*5-5/2, 0.01, i+(Math.random()*5-5/2));
				ground_bit.rotation.set(-Math.PI/2, 0, /*(Math.random()*360)*(Math.PI/180)*/0);
				ground_bit.updateMatrix();
				complete_ground_bits_geometry.merge(ground_bit.geometry, ground_bit.matrix);
			}
		}

		var final_ground_bits = new THREE.Mesh( complete_ground_bits_geometry, this.materials.ground_bits );
		this.object.add(final_ground_bits);
	}

	// GENERATE BOXES ON THE SIDES
	this.generateBoxes = function() {
		for(var i = 0; i < this.buildingData.length; i++) {
			if(Math.random() > 0.7) {
				var pilePosition = new THREE.Vector3( this.buildingData[i].position.x + (this.buildingData[i].width/2 + 0.5)*(this.buildingData[i].side == "left" ? 1 : -1), this.buildingData[i].position.y, this.buildingData[i].position.z + ((this.buildingData[i].width/2)*0.8)*(Math.random() > 0.5 ? 1 : -1) );

				var box_geo = new THREE.Geometry();
				var box_dimensions = {width: 0.4, height: 0.3, depth: 0.6};
				var box_stick_width = 0.04;

				var box_base_geo = new THREE.PlaneGeometry( box_dimensions.width, box_dimensions.depth );
				var box_base = new THREE.Mesh(box_base_geo, this.materials.frames);
				box_base.rotation.set(Math.PI/2, 0, 0);
				box_base.updateMatrix();
				box_geo.merge(box_base.geometry, box_base.matrix);

				var box_stick_geo = new THREE.BoxGeometry( box_stick_width, box_dimensions.height, box_stick_width );
				var box_stick = new THREE.Mesh(box_stick_geo, this.materials.frames);
				box_stick.position.set(box_dimensions.width/2 - box_stick_width/2, box_dimensions.height/2, box_dimensions.depth/2 - box_stick_width/2);
				box_stick.updateMatrix();
				box_geo.merge(box_stick.geometry, box_stick.matrix);

				var box_stick = new THREE.Mesh(box_stick_geo, this.materials.frames);
				box_stick.position.set(-box_dimensions.width/2 + box_stick_width/2, box_dimensions.height/2, box_dimensions.depth/2 - box_stick_width/2);
				box_stick.updateMatrix();
				box_geo.merge(box_stick.geometry, box_stick.matrix);

				var box_stick = new THREE.Mesh(box_stick_geo, this.materials.frames);
				box_stick.position.set(box_dimensions.width/2 - box_stick_width/2, box_dimensions.height/2, -box_dimensions.depth/2 + box_stick_width/2);
				box_stick.updateMatrix();
				box_geo.merge(box_stick.geometry, box_stick.matrix);

				var box_stick = new THREE.Mesh(box_stick_geo, this.materials.frames);
				box_stick.position.set(-box_dimensions.width/2 + box_stick_width/2, box_dimensions.height/2, -box_dimensions.depth/2 + box_stick_width/2);
				box_stick.updateMatrix();
				box_geo.merge(box_stick.geometry, box_stick.matrix);

				for(var j = 0; j < 3; j++) {
					var box_bar_geo = new THREE.PlaneGeometry( box_dimensions.width, box_dimensions.height/4 );

					var box_bar = new THREE.Mesh(box_bar_geo, this.materials.frames);
					box_bar.position.set(0, (box_dimensions.height/3)*j + box_stick_width/2, box_dimensions.depth/2);
					box_bar.updateMatrix();
					box_geo.merge(box_bar.geometry, box_bar.matrix);

					var box_bar = new THREE.Mesh(box_bar_geo, this.materials.frames);
					box_bar.position.set(0, (box_dimensions.height/3)*j + box_stick_width/2, -box_dimensions.depth/2);
					box_bar.updateMatrix();
					box_geo.merge(box_bar.geometry, box_bar.matrix);

					var box_bar_geo = new THREE.PlaneGeometry( box_dimensions.depth, box_dimensions.height/4 );

					var box_bar = new THREE.Mesh(box_bar_geo, this.materials.frames);
					box_bar.position.set(box_dimensions.width/2, (box_dimensions.height/3)*j + box_stick_width/2, 0);
					box_bar.rotation.set(0, Math.PI/2, 0);
					box_bar.updateMatrix();
					box_geo.merge(box_bar.geometry, box_bar.matrix);

					var box_bar = new THREE.Mesh(box_bar_geo, this.materials.frames);
					box_bar.position.set(-box_dimensions.width/2, (box_dimensions.height/3)*j + box_stick_width/2, 0);
					box_bar.rotation.set(0, Math.PI/2, 0);
					box_bar.updateMatrix();
					box_geo.merge(box_bar.geometry, box_bar.matrix);
				}

				var box = new THREE.Mesh(box_geo, this.materials.frames);
				box.position.set(pilePosition.x + (Math.random()-0.5)*0.5, pilePosition.y + 0.05, pilePosition.z - box_dimensions.width*0.55);
				box.rotation.set(0, (Math.random()*45)*(Math.PI/180), 0);
				this.mesh_groups.frames.push(box);

				var box = new THREE.Mesh(box_geo, this.materials.frames);
				box.position.set(pilePosition.x + (Math.random()-0.5)*0.5, pilePosition.y + 0.05, pilePosition.z + box_dimensions.width*0.55);
				box.rotation.set(0, (Math.random()*45)*(Math.PI/180), 0);
				this.mesh_groups.frames.push(box);

				var box = new THREE.Mesh(box_geo, this.materials.frames);
				box.position.set(pilePosition.x, pilePosition.y + box_dimensions.height + 0.05, pilePosition.z);
				box.rotation.set(0, (Math.random()*45)*(Math.PI/180), 0);
				this.mesh_groups.frames.push(box);
			}
		}
	}

	// COMBINE ALL MESHES INTO SUPERGEOMETRY
	this.combine = function() {
		// STRUCTURE SUPERGEO
		for(var i = 0; i < this.mesh_groups.structures.length; i++) {
			for(var j = 0; j < this.mesh_groups.structures[i].length; j++) {
				this.mesh_groups.structures[i][j].updateMatrix();
				this.geometries.structures[i].merge(this.mesh_groups.structures[i][j].geometry, this.mesh_groups.structures[i][j].matrix);
			}
		}

		// SIGNS SUPERGEO
		for(var i = 0; i < this.mesh_groups.signs.length; i++) {
			for(var j = 0; j < this.mesh_groups.signs[i].length; j++) {
				this.mesh_groups.signs[i][j].updateMatrix();
				this.geometries.signs[i].merge(this.mesh_groups.signs[i][j].geometry, this.mesh_groups.signs[i][j].matrix);
			}
		}

		// FABRICS SUPERGEO
		for(var i = 0; i < this.mesh_groups.fabrics.length; i++) {
			for(var j = 0; j < this.mesh_groups.fabrics[i].length; j++) {
				this.mesh_groups.fabrics[i][j].updateMatrix();
				this.geometries.fabrics[i].merge(this.mesh_groups.fabrics[i][j].geometry, this.mesh_groups.fabrics[i][j].matrix);
			}
		}

		// SCREEN ON SUPERGEO
		for(var i = 0; i < this.mesh_groups.screens_on.length; i++) {
			this.mesh_groups.screens_on[i].updateMatrix();
			this.geometries.screens_on.merge(this.mesh_groups.screens_on[i].geometry, this.mesh_groups.screens_on[i].matrix);
		}

		// FRAMES SUPERGEO
		for(var i = 0; i < this.mesh_groups.frames.length; i++) {
			this.mesh_groups.frames[i].updateMatrix();
			this.geometries.frames.merge(this.mesh_groups.frames[i].geometry, this.mesh_groups.frames[i].matrix);
		}

		// WIRES SUPERGEO
		for(var i = 0; i < this.mesh_groups.wires.length; i++) {
			this.mesh_groups.wires[i].updateMatrix();
			this.geometries.wires.merge(this.mesh_groups.wires[i].geometry, this.mesh_groups.wires[i].matrix);
		}
	}

	// CREATE MESH BASED ON FINAL MERGED SUPERGEOMETRY
	this.createMeshes = function() {
		// STRUCTURES MESH
		for(var i = 0; i < this.geometries.structures.length; i++) {
			var final_structure = new THREE.Mesh(this.geometries.structures[i], this.materials.structures[i]);
			this.object.add(final_structure);
		}

		// SIGNS MESH
		for(var i = 0; i < this.geometries.signs.length; i++) {
			var final_signs = new THREE.Mesh(this.geometries.signs[i], this.materials.signs[i]);
			this.object.add(final_signs);
		}

		// FABRICS MESH
		for(var i = 0; i < this.geometries.fabrics.length; i++) {
			var final_fabrics = new THREE.Mesh(this.geometries.fabrics[i], this.materials.fabrics[i]);
			this.object.add(final_fabrics);
		}

		// SCREENS ON MESH
		var final_screens = new THREE.Mesh(this.geometries.screens_on, this.materials.screens_on);
		this.object.add(final_screens);

		// FRAMES MESH
		var final_frames = new THREE.Mesh(this.geometries.frames, this.materials.frames);
		this.object.add(final_frames);

		// WIRES MESH
		var final_wires = new THREE.Mesh(this.geometries.wires, this.materials.wires);
		this.object.add(final_wires);
	}

	// BUILDING GENERATION
	this.generateBuildings();

	// ENVIRONMENT GENERATION
	this.generateWires();
	this.generateStars();
	this.generateGroundBits();
	// this.generateBoxes();

	// FINAL COMBINING AND MESH CREATION
	this.combine();
	this.createMeshes();
}

function Yokai( texture, planeSize ) {
	this.enabled = true;

	var yokaiGroup = new THREE.Group();
	var yokai_Geometry = new THREE.PlaneGeometry( planeSize, planeSize );

	this.animations = {
		forwardLeft: new TextureAnimator( texture, 2, 2, 4, 250, 0, 1 ),
		backLeft: new TextureAnimator( texture, 2, 2, 4, 250, 2, 3 )
	};
	this.animation = this.animations.backLeft;
	var yokai_Material = new THREE.MeshBasicMaterial( { map: texture, transparent: true, opacity: 1, side: THREE.DoubleSide, alphaTest: 0.5 } );

	var yokaiPlaneObject = new THREE.Mesh(yokai_Geometry, yokai_Material);
	yokaiGroup.add(yokaiPlaneObject);
	yokaiPlaneObject.position.y = planeSize/2;
	this.object = yokaiGroup;

	this.setEnable = function() {
		this.enabled = this.object.visible = true;
	}

	this.setDisable = function() {
		this.enabled = this.object.visible = false;
	}

	this.walk = {
		status: false,
		direction: new THREE.Vector3(0, 0, 0),
		timeWalked: 0,
		timeToWalk: 0
	}

	this.newWalkDirection = function() {
		return new THREE.Vector3( Math.random() - 0.5, 0, Math.random() - 0.5 ).normalize().multiplyScalar(0.5);
	}

	this.stopWalking = function() {
		this.walk.status = false;
	}

	this.startWalking = function() {
		this.walk.status = true;
		this.walk.direction = this.newWalkDirection();
		this.walk.timeWalked = 0;
		this.walk.timeToWalk = ((Math.random()*10000)+1000)/1000; //seconds
	}

	this.place = function(x, y, z) {
		this.object.position.set( x, y, z );
	}

	this.update = function( delta, target ) {
		if(this.enabled) {
			// Switch directions if boundaries hit
			if((this.object.position.x > 1 && this.walk.direction.x > 0) || (this.object.position.x < -1 && this.walk.direction.x < 0)) this.walk.direction.x = -this.walk.direction.x;

			// Update walk
			if(this.walk.status) {
				this.walk.timeWalked += delta;
				if(this.walk.timeWalked >= this.walk.timeToWalk) {
					this.object.position.set(this.object.position.x + this.walk.direction.x*(this.walk.timeWalked - this.walk.timeToWalk), this.object.position.y, this.object.position.z + this.walk.direction.z*(this.walk.timeWalked - this.walk.timeToWalk));
					this.stopWalking();
					var that = this;
					setTimeout(function() {
						that.startWalking();
					}, Math.random()*2000);
				} else {
					this.object.position.set(this.object.position.x + this.walk.direction.x*delta, this.object.position.y, this.object.position.z + this.walk.direction.z*delta);
				}
			}

			// Update billboarding
			this.object.lookAt( target.position.x, this.object.position.y, target.position.z );

			// Update animation state
			var cameraToObject = new THREE.Vector2( this.object.position.x - target.position.x, this.object.position.z - target.position.z ).normalize();
			var walkDirection = new THREE.Vector2( this.walk.direction.x, this.walk.direction.z );
			var dot = cameraToObject.dot(walkDirection);
			var cross = (cameraToObject.x*walkDirection.y) - (cameraToObject.y*walkDirection.x);
			var side = Math.atan2(cross, dot);
			if(dot > 0) {
				this.animation = this.animations.forwardLeft;
			} else {
				this.animation = this.animations.backLeft;
			}
			this.object.scale.x = side >= 0 ? -1 : 1;
			this.animation.update( delta*1000 );
		}
	}
}

function TextureAnimator(texture, tilesHoriz, tilesVert, numTiles, tileDispDuration, start, end) {	
	// note: texture passed by reference, will be updated by the update function.

	this.tilesHorizontal = tilesHoriz;
	this.tilesVertical = tilesVert;
	// how many images does this spritesheet contain?
	//  usually equals tilesHoriz * tilesVert, but not necessarily,
	//  if there at blank tiles at the bottom of the spritesheet. 
	this.numberOfTiles = numTiles;
	texture.wrapS = texture.wrapT = THREE.RepeatWrapping; 
	texture.repeat.set( 1 / this.tilesHorizontal, 1 / this.tilesVertical );

	// how long should each image be displayed?
	this.tileDisplayDuration = tileDispDuration;

	// how long has the current image been displayed?
	this.currentDisplayTime = 0;

	// which image is currently being displayed?
	this.currentTile = 0;

	this.update = function( milliSec )
	{
		this.currentDisplayTime += milliSec;
		while (this.currentDisplayTime > this.tileDisplayDuration)
		{
			this.currentDisplayTime -= this.tileDisplayDuration;
			this.currentTile++;
			if (this.currentTile == this.numberOfTiles || this.currentTile > end)
				this.currentTile = start;

			var currentColumn = this.currentTile % this.tilesHorizontal;
			texture.offset.x = currentColumn / this.tilesHorizontal;
			var currentRow = Math.floor( this.currentTile / this.tilesHorizontal );
			texture.offset.y = currentRow / this.tilesVertical;
		}
	};
}