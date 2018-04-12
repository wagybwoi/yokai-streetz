var camera, scene, raycaster, renderer, fog = {nearStart: 30-5, farStart: 35+5, nearEnd: 10-5, farEnd: 20+5, multiplier: 1, startColor: {r: 0.22745098039215686, g: 0.13333333333333333, b: 0.7686274509803922}, endColor: {r: 0.65, g: 0, b: 0}}, g_length_in_buildings = 40, g_building_width = 5,
	analyser, fft = 0, fftMultiplier = 0.10, fftMax = 255, clock = new THREE.Clock(), sound, composer, renderPass, rgbShift,
	ground, sky, skyStartColor = {r: 0.09803921568627451, g: 0.0784313725490196, b: 0.30980392156862746}, skyEndColor = {r: 0.35, g: 0, b: 0}, buildings = [], moonlight, skylight, city,
	eye = {top: undefined, bottom: undefined}, japaneseText = [], loading = {models: false, scene: false, audio: false, yokai: false, element: document.getElementById("loading"), title_1: document.getElementById("title_1"), title_2: document.getElementById("title_2")}, loaded = false, cameraControl;

var yokai = {
	loader: undefined,
	textures: [],
	instances: []
}

function init() {
	scene = new THREE.Scene();
	scene.background = new THREE.Color( "#000000" );
	scene.fog = new THREE.Fog( new THREE.Color("#3a22c4"), 35, 45 );

	renderer = new THREE.WebGLRenderer( { canvas: document.getElementById("three") } );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );

	camera = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 0.1, 100 );
	camera.position.set(0, 1, 0);
	scene.add( camera );
	cameraControl = new cameraController(camera);

	window.addEventListener( 'resize', onWindowResize, false );
	window.addEventListener( 'touchstart', function(event) {
		event.preventDefault();
		glitch();
	}, false );
	window.addEventListener( 'mousedown', glitch, false );

	var colorCorrection = new THREE.ShaderPass(THREE.ColorCorrectionShader);
	colorCorrection.enabled = false;
	rgbShift = new THREE.ShaderPass(THREE.RGBShiftShader);

	renderPass = new THREE.RenderPass( scene, camera );
	composer = new THREE.EffectComposer(renderer);
	composer.addPass(renderPass);
	composer.addPass(rgbShift);
	rgbShift.renderToScreen = true;
	rgbShift.uniforms.amount.value = 0.004;
	rgbShift.uniforms.angle.value = Math.PI*0.7;

	InitModels();
	InitAudio();
	InitYokai();
}

init();

function InitModels() {
	var loader = new THREE.ObjectLoader();
	loader.load(
		"letters.json",
		function ( obj ) {
			for(var i = 0; i < obj.children.length; i++) {
				var textSize;
				switch(i) {
					// HORIZONTAL
				    case 2:
				    case 8:
				        textSize = {x: 1, y: 0.5};
				        break;
				    // VERTICAL
				    case 0:
				    case 4:
				        textSize = {x: 0.5, y: 1};
				        break;
				    // DOUBLE
				    case 1:
				    case 3:
				    case 6:
				    case 7:
				        textSize = {x: 1, y: 0.75};
				        break;
				    // SUPER THIN VERTICAL
				    case 5:
				        textSize = {x: 0.2, y: 1};
				        break;
				    default:
				        textSize = {x: 1, y: 1};
				}
				japaneseText.push( {geo: obj.children[i].geometry, size: textSize} );
			}
			loading.models = true;
			updateLoading();
			InitScene();
		},
		function ( xhr ) {},
		function ( err ) {
			console.error( 'An error happened' );
		}
	);
}

function InitAudio() {
	var listener = new THREE.AudioListener();
	camera.add( listener );

	sound = new THREE.Audio( listener );

	var audioLoader = new THREE.AudioLoader();
	audioLoader.load( 'yokaistreetz.mp3', function( buffer ) {
		sound.setBuffer( buffer );
		sound.setLoop( true );
		sound.setVolume( 0.5 );

		loading.audio = true;
		updateLoading();
	});
	
	analyser = new THREE.AudioAnalyser( sound, 2048 );
}

function InitScene() {
	var ground_geometry = new THREE.PlaneGeometry( 500, 500 );
	var ground_material = new THREE.MeshBasicMaterial( {color: "#2b2165", side: THREE.BackSide} );
	ground = new THREE.Mesh( ground_geometry, ground_material );
	ground.rotation.set(Math.PI/2, 0, 0);
	scene.add( ground );

	var sky_geometry = new THREE.BoxGeometry( 100, 20, 100 );
	var sky_material = new THREE.MeshBasicMaterial( {color: "#19144f", side: THREE.BackSide} );
	sky = new THREE.Mesh( sky_geometry, sky_material );
	sky.scale.y = 2.5;
	scene.add( sky );

	moonlight = new THREE.AmbientLight( "#0c0c0c" );
	moonlight.intensity = 5;
	scene.add( moonlight );

	skylight = new THREE.PointLight( 0xffffff, 0.5, 100 );
	scene.add( skylight );

	city = new City(g_building_width, g_length_in_buildings);
	scene.add(city.object);
	city.object.rotation.set(0, Math.PI, 0);
	city.object.position.z = 0;

	loading.scene = true;
	updateLoading();
}

function InitYokai() {
	yokai.loader = new THREE.TextureLoader();
	var yokaiTypeCount = 2;
	var yokaiTotalCount = 18;

	// Umbrella
	var umbrellaSize = 1;
	for(var i = 0; i < yokaiTypeCount; i++) {
		yokai.loader.load( 'images/umbrella.png', function(texture) {
			yokai.textures.push({tex: texture, size: umbrellaSize});
			if(yokai.textures.length == yokaiTotalCount) GenerateYokai();
		});
	}

	// Hitotsume
	var hitotsumeSize = 1.2;
	for(var i = 0; i < yokaiTypeCount; i++) {
		yokai.loader.load( 'images/hitotsume.png', function(texture) {
			yokai.textures.push({tex: texture, size: hitotsumeSize});
			if(yokai.textures.length == yokaiTotalCount) GenerateYokai();
		});
	}

	// Kudan
	var kudanSize = 1.2;
	for(var i = 0; i < yokaiTypeCount; i++) {
		yokai.loader.load( 'images/kudan.png', function(texture) {
			yokai.textures.push({tex: texture, size: kudanSize});
			if(yokai.textures.length == yokaiTotalCount) GenerateYokai();
		});
	}
	
	// Teke Teke
	var teketekeSize = 1.1;
	for(var i = 0; i < yokaiTypeCount; i++) {
		yokai.loader.load( 'images/teketeke.png', function(texture) {
			yokai.textures.push({tex: texture, size: teketekeSize});
			if(yokai.textures.length == yokaiTotalCount) GenerateYokai();
		});
	}

	// Ubagabi
	var ubagabiSize = 1.3;
	for(var i = 0; i < yokaiTypeCount; i++) {
		yokai.loader.load( 'images/ubagabi.png', function(texture) {
			yokai.textures.push({tex: texture, size: ubagabiSize});
			if(yokai.textures.length == yokaiTotalCount) GenerateYokai();
		});
	}

	// Kappa
	var kappaSize = 0.6;
	for(var i = 0; i < yokaiTypeCount; i++) {
		yokai.loader.load( 'images/kappa.png', function(texture) {
			yokai.textures.push({tex: texture, size: kappaSize});
			if(yokai.textures.length == yokaiTotalCount) GenerateYokai();
		});
	}

	// Hyakume
	var hyakumeSize = 2;
	for(var i = 0; i < yokaiTypeCount; i++) {
		yokai.loader.load( 'images/hyakume.png', function(texture) {
			yokai.textures.push({tex: texture, size: hyakumeSize});
			if(yokai.textures.length == yokaiTotalCount) GenerateYokai();
		});
	}

	// Monk
	var monkSize = 1.3;
	for(var i = 0; i < yokaiTypeCount; i++) {
		yokai.loader.load( 'images/monk.png', function(texture) {
			yokai.textures.push({tex: texture, size: monkSize});
			if(yokai.textures.length == yokaiTotalCount) GenerateYokai();
		});
	}

	// Otoroshi
	var otoroshiSize = 1.4;
	for(var i = 0; i < yokaiTypeCount; i++) {
		yokai.loader.load( 'images/otoroshi.png', function(texture) {
			yokai.textures.push({tex: texture, size: otoroshiSize});
			if(yokai.textures.length == yokaiTotalCount) GenerateYokai();
		});
	}
}

function GenerateYokai() {
	for(var i = 0; i < yokai.textures.length; i++) {
		var newYokai = new Yokai( yokai.textures[i].tex, yokai.textures[i].size );
		scene.add(newYokai.object);
		// newYokai.setDisable();
		newYokai.startWalking();
		yokai.instances.push(newYokai);
	}

	loading.yokai = true;
	updateLoading();
}

function cameraController(cameraObject) {
    this.cam = cameraObject;

    this.progress = {
        lastSwitch: 0,
        timeToNext: 0,  
    };

    this.cameraControls = [
        this.birdsEye = {
            init: function(cameraReference) {
                cameraReference.position.set(0, 8, -fog.farEnd - Math.random()*50);
                cameraReference.lookAt(cameraReference.position.x, cameraReference.position.y - 1, cameraReference.position.z);
            },
            update: function(cameraReference, delta) {
                cameraReference.position.set(cameraReference.position.x, cameraReference.position.y, cameraReference.position.z - 2.0*delta);
            }
        },

        this.perpendicular = {
            init: function(cameraReference) {
                cameraReference.position.set(1.5, 1.5, -fog.farEnd - Math.random()*50);
                cameraReference.lookAt(cameraReference.position.x - 1, 1.75, cameraReference.position.z);
            },
            update: function(cameraReference, delta) {
                cameraReference.position.set(cameraReference.position.x, cameraReference.position.y, cameraReference.position.z - 2.0*delta);
            }
        },

        this.lookinUp = {
            init: function(cameraReference) {
                cameraReference.position.set(0, 1, -fog.farEnd - Math.random()*50);
                cameraReference.lookAt(cameraReference.position.x - 1, cameraReference.position.y + 2, cameraReference.position.z - 1);
            },
            update: function(cameraReference, delta) {
                cameraReference.position.set(cameraReference.position.x, cameraReference.position.y, cameraReference.position.z - 2.0*delta);
            }
        },

        this.lookinDown = {
            init: function(cameraReference) {
                cameraReference.position.set(-1, 1.5, -fog.farEnd - Math.random()*50);
                cameraReference.lookAt(cameraReference.position.x + 1, cameraReference.position.y - 1, cameraReference.position.z - 2);
            },
            update: function(cameraReference, delta) {
                cameraReference.position.set(cameraReference.position.x, cameraReference.position.y, cameraReference.position.z - 2.0*delta);
            }
        },

    ];

    this.cameraControlsIndex = Math.floor(Math.random()*this.cameraControls.length);

    this.switchCamera = function() {
        var newIndex;
        while(newIndex == undefined || newIndex == this.cameraControlsIndex) {
        	newIndex = Math.floor(Math.random()*this.cameraControls.length);
        }
        this.cameraControlsIndex = newIndex;
        this.cameraControls[this.cameraControlsIndex].init(this.cam);

        this.progress.lastSwitch = clock.elapsedTime;
        this.progress.timeToNext = Math.random()*6+4;
    };

    this.update = function(delta) {
    	if(clock.elapsedTime > this.progress.lastSwitch + this.progress.timeToNext) {
    		this.switchCamera();
        	placeYokai();
    	} else {
	        this.cameraControls[this.cameraControlsIndex].update(this.cam, delta);
    	}
    };
}

function render( time ) {
	var delta = clock.getDelta();

	if(loaded) {
		updateObjects( delta );

	    cameraControl.update(delta);
		TWEEN.update();

		rgbShift.uniforms.amount.value = rgbShift.uniforms.amount.value + 0.05*(0.004 - rgbShift.uniforms.amount.value);
		rgbShift.uniforms.angle.value = rgbShift.uniforms.angle.value + 0.025*(Math.PI*0.7 - rgbShift.uniforms.angle.value);
		composer.render();

		if(!sound.isPlaying) sound.play();
	}

	requestAnimationFrame(render);
}

function updateObjects( delta ) {
	// Update basic scene objects
	ground.position.set(camera.position.x, 0, camera.position.z);
	sky.position.set(camera.position.x, 0, camera.position.z);
	skylight.position.set(camera.position.x, 15, camera.position.z);

	var freq = analyser.getFrequencyData()[fft];

	// Update sky color
	sky.material.color = {
		r: skyStartColor.r+(freq/fftMax)*(skyEndColor.r-skyStartColor.r),
		g: skyStartColor.g+(freq/fftMax)*(skyEndColor.g-skyStartColor.g),
		b: skyStartColor.b+(freq/fftMax)*(skyEndColor.b-skyStartColor.b)
	};

	// Update fog
	scene.fog.near = (fog.nearStart+(freq/fftMax)*(fog.nearEnd-fog.nearStart))*fog.multiplier;
	scene.fog.far = (fog.farStart+(freq/fftMax)*(fog.farEnd-fog.farStart))*fog.multiplier;
	scene.fog.color = {
		r: fog.startColor.r+(freq/fftMax)*(fog.endColor.r-fog.startColor.r),
		g: fog.startColor.g+(freq/fftMax)*(fog.endColor.g-fog.startColor.g),
		b: fog.startColor.b+(freq/fftMax)*(fog.endColor.b-fog.startColor.b)
	};

	// Update city size
	var lerp_a = city.object.scale.y;
	var lerp_b = 1.0+(freq/fftMax)*(1.5-1.0);
	city.object.scale.y = lerp_a + 0.1*(lerp_b - lerp_a);

	// Update Yokai
	for(var i = 0; i < yokai.instances.length; i++) {
		yokai.instances[i].update( delta, camera );
	}
}

function glitch() {
	setTimeout(function() {
		rgbShift.uniforms.amount.value = 0.03;
		rgbShift.uniforms.angle.value = Math.random()*(Math.PI*2);
		setTimeout(function() {
			rgbShift.uniforms.amount.value = 0.03;
			rgbShift.uniforms.angle.value = Math.random()*(Math.PI*2);
			setTimeout(function() {
				rgbShift.uniforms.amount.value = 0.03;
				rgbShift.uniforms.angle.value = Math.random()*(Math.PI*2);
			}, 50);
		}, 50);
	}, 50);
}

function placeYokai() {
	shuffleArray(yokai.instances);
	for(var i = 0; i < yokai.instances.length; i++) {
		yokai.instances[i].place( Math.random()*4-2, 0, camera.position.z - (2*i) + 5 );
	}
}

function shuffleArray(a) {
	for (let i = a.length - 1; i > 0; i--) {
	    const j = Math.floor(Math.random() * (i + 1));
	    [a[i], a[j]] = [a[j], a[i]];
	}
	return a;
}

function updateLoading() {
	if(loading.models == true && loading.scene == true && loading.audio == true && loading.yokai == true) initiate();
}

function initiate() {
	loading.element.style.display = "none";
	loading.title_1.style.opacity = loading.title_2.style.opacity = 1;
	setTimeout(function() {
		document.getElementById("container").style.backgroundColor = "rgba(0, 0, 0, 0)";
		setTimeout(function() {
			document.getElementById("container").style.opacity = 0;
		}, 5000);
	}, 5000);
	loaded = true;
	requestAnimationFrame(render);
}

window.addEventListener('resize', onWindowResize);
function onWindowResize() {
	if(camera && renderer) {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize( window.innerWidth, window.innerHeight );
		composer.setSize( window.innerWidth, window.innerHeight );
	}
}
