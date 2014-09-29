module.exports  = function(grunt){

	/*
	COLLECT DATA
	*/

	var pkg = grunt.file.readJSON('package.json');
	
	/* banner sizes for production */
	var sizeobj = grunt.file.readJSON('sizes.json');

	var frameworks=[
		'TweenLite.js',
		'CSSPlugin.js'
	]	
	
	/* sizes as array */

	var sizes=[];
	for(var a in sizeobj){
		var dimensions = sizeobj[a].split('x');
		sizes.push({
			s:sizeobj[a]+'-'+a, 
			n:a,
			w:parseInt(dimensions[0]),
			h:parseInt(dimensions[1])
		});
	}


	/* 
	Build factories
	*/

	function collect (src, dest){
		return 	{
			expand: true,
			flatten: true,
			filter: 'isFile', 
			src:src,
			dest: dest+'/'
		}
	}

	function copyFiles(version, destination){

		var products = [];

		/* Libraries */

		for(var f=0;f<frameworks.length;f++){
			products.push({
				src:'<%= paths.libs %>/'+frameworks[f],
				dest: destination+'/'+frameworks[f]
			})
		}

		/* ASSETS */

		// common assets

		products.push(
			collect (
				'<%= paths.assts %>/common/**/*', 
				destination
				));

		// version assets - assets in the same tree structure with same name overwrite common version

		products.push(
			collect (
				'<%= paths.assts %>/'+version+'/**/*', 
				destination
				));

		// html

		products.push(
			collect (
				'<%= paths.html %>/*', 
				destination
				));
																				

		return products;
	}

	function concatJSFiles (version){
		var versionjs = '<%= paths.srcjs %>' + '/' + version + '/**/*.js';
		var destination = '<%= paths.dest %>'  + '/' + version ;						
		return [{
			src: [versionjs, '<%= paths.srcjs %>/common/**/*.js', '!<%= paths.srcjs %>/common/app.js', '<%= paths.srcjs %>/common/app.js' ],
			dest: destination+'/app.js'
		}]
	}	

	/*****************
	INIT CONFIG
	*****************/

	grunt.initConfig({

		pkg:pkg,
		sizes:sizes,

		// this needs to be set at runtime or somehow prompted 
		masterbuild:sizeobj.mpu,

		/* collect file paths */
		paths:{
			dest:'dist',
			mstr:'dist/master',			
			srcjs:'dev/js',
			srcscss:'dev/scss',
			html:'dev/html',
			libs:'bower_components/**',
			assts: 'assets'			
		},

		/*****************
		tasks
		*****************/

		concat:{

		    options: {
		      separator: ';',
		    },	

			master:{
				files: (function(){
					var version = '<%= masterbuild %>' ;
					return concatJSFiles(version);					
				})()
		},

			distribution:{			
				files: (function(){
					var products = [];				
					for(var s=0;s<sizes.length;s++){
						var version = sizes[s].s ;
						products = products.concat(concatJSFiles(version));
					}
					return products;					
				})()
			}			
		},

		copy:{

			/* copy frameworks to master */
			libs:{
				files: (function(){
					var _libs = [];				
					for(var s=0;s<frameworks.length;s++){
						_libs.push({
							src:'<%= paths.libs %>/'+frameworks[s],
							dest:'<%= paths.mstr %>/'+frameworks[s]
						})
					}
					return _libs;					
				})()
			},

			master:{

				/* build copy task based on production sizes (sizes.json) */
				files: ( function(){

						var version = '<%= masterbuild %>' ;
						var destination = '<%= paths.dest %>' + '/' + version ;

						// frameworks files should probably be concatenated 

						return copyFiles(version, destination);
				})()
			},			

			distribution:{

				/* build copy task based on production sizes (sizes.json) */
				files: ( function(){
					var products = [];				
					for(var s=0; s<sizes.length; s++){

						var version = sizes[s].s ;
						var destination = '<%= paths.dest %>' + '/' + version ;

						products = products.concat(copyFiles(version, destination));
																									
					}				
					return products;

				})()
			}

		},

		sass:{

			options:{
				compass:true,
				loadPath:['<%= paths.srcscss %>/common']
			},

			master:{
				files:{
					'<%= paths.dest %>/<%= masterbuild %>/styles.css' :
					'<%= paths.srcscss %>/<%= masterbuild %>/styles.scss'
					}
			},

			/*  */
			distribution:{
				files:( function(){
					var products = [];
					for(var s=0;s<sizes.length;s++){
						products.push({
							src:'<%= paths.srcscss %>/'+sizes[s].s+'/styles.scss',
							dest: '<%= paths.dest %>/'+sizes[s].s+'/styles.css'
						})
					}
					return products;
				})()
			}
		},

		svgo:{
			all:{
				// allow dynamic file targeting (??)
		  //       expand: true,
		  //       // set relative root folder but dont include in name of destination path
		  //       cwd:'assets/',			
				// src:['*.svg'],
				// dest:'asset-opt/'
			}			
		}	

	});

	/*****************
	LOAD NPM TASKS
	*****************/

	grunt.loadNpmTasks("grunt-contrib-concat");
	grunt.loadNpmTasks("grunt-contrib-uglify");
	grunt.loadNpmTasks("grunt-contrib-copy");
	grunt.loadNpmTasks("grunt-contrib-sass");
	grunt.loadNpmTasks("grunt-contrib-watch");

	grunt.loadNpmTasks("grunt-svgo");		

	/*******************
	INTERNAL TASKS
	********************/

	grunt.task.registerTask('makefolders', 'setup essential files and folders.', function() {

		// recursive function for building folder trees
		
		function populate (path, sets){
			if(!sets.length) return; 
			var set=sets.shift();
			set.forEach(function(el,i,arr){
				var fullpath = path+'/'+el;
				grunt.file.mkdir(fullpath);
				populate(fullpath, sets.slice());
			})
		}

		var path = grunt.template.process('<%= paths.assts %>');
		//var dists = ['common','versions'];
		var assets = ['images','fonts','svg'];
		//populate(path, [ dists, assets ]); // didn't create sizes folders

		var _sizes = (function(){
					var _libs = [];				
					for(var s=0;s<sizes.length;s++){
						_libs.push(sizes[s].s)
					}
					return _libs;					
				})()



		//populate(path, [ ['common'], assets ]);
		//populate(path, [ ['versions'], _sizes, assets ]);			


		_sizes.push('common');

		populate(path, [ _sizes, assets ]);	

		path = grunt.template.process('<%= paths.srcjs %>');
		populate(path, [ _sizes ]);

		/* html */
		path = grunt.template.process('<%= paths.html %>');
		populate(path, [ _sizes ]);
	});	

	/* 

	write base scss and js files - this will be better achieved with proper templating

	*/

	grunt.task.registerTask('writebase', 'write base files.', function() {
		
		/*
		SCSS
		*/

		var scsspath = grunt.template.process('<%= paths.srcscss %>');		
		
		function init(w, h){
			var init = '' ;
				init+= '@import "settings"; \n' ;
				init+= '$sizex:'+w+'px; \n' ;
				init+= '$sizey:'+h+'px; \n' ;
				init+= '@import "core"; \n' ;
				return init;			
		}

		for(var s=0;s<sizes.length;s++){
				grunt.file.write( 
					scsspath+'/'+sizes[s].s+'/styles.scss' , 
					init(sizes[s].w, sizes[s].h) 
					);
		}

		grunt.file.write(scsspath+'/common/_settings.scss', '' );		
		grunt.file.write(scsspath+'/common/_core.scss', '' );

		
		/*
		JS
		*/

		var jspath = grunt.template.process('<%= paths.srcjs %>'+'/common');
		grunt.file.write(jspath+'/app.js', '' );
		
		/*
		HTML
		*/

		//grunt.file.mkdir(grunt.template.process('<%= paths.html %>'));
		grunt.file.write( grunt.template.process('<%= paths.html %>/index.html'), '' );
	
	});	

	
	/*******************
	PROJECT TASKS
	********************/


	/*
	setup - run after project.json is configured 
	*/

	grunt.registerTask('setup', ['makefolders', 'writebase']);

	/*
	make master - master is defined in project.json 	
	*/

	grunt.registerTask('makemaster', ['concat:master', 'copy:master', 'sass:master']);
	
	/*
	make any - temporarily change master
	*/

	grunt.registerTask('make', 'Make a new post dir.', function(build) {
	  if (build != null) {
	  	grunt.config.set('masterbuild', build.toString());
	    grunt.task.run('makemaster');
	  }
	});	
	
	/*
	make all
	*/

	grunt.registerTask('distribution', ['concat:distribution','copy:distribution','sass:distribution']);		



}