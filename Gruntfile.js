module.exports  = function(grunt){

	var pkg = grunt.file.readJSON('package.json');
	
	/* banner sizes for production */
	var sizeobj = grunt.file.readJSON('sizes.json');
	
	/* sizes as array */
	var sizes=[];
	for(var a in sizeobj){
		var dimensions = sizeobj[a].split('x');
		sizes.push({
			s:sizeobj[a], 
			n:a,
			w:parseInt(dimensions[0]),
			h:parseInt(dimensions[1])
			 });
	}

	var frameworks=[
		'TweenLite.js'
	]

	grunt.initConfig({
		pkg:pkg,
		sizes:sizes,

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

		concat:{
		    options: {
		      separator: ';',
		    },				
			master:{			
				/* Classlike functions */
				src: [ '<%= paths.srcjs %>/**/*.js', '!<%= paths.srcjs %>/app.js', '<%= paths.srcjs %>/app.js' ],
				dest:'<%= paths.mstr %>/app.js'
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
						var products = [];

						var destination = '<%= paths.mstr %>';

						// frameworks files should probably be concatenated 

						for(var f=0;f<frameworks.length;f++){
							products.push({
								src:'<%= paths.libs %>/'+frameworks[f],
								dest: destination+'/'+frameworks[f]
							})
						}

						// common assets

						products.push({
							expand: true,
							flatten: true,
							filter: 'isFile', 
							src:'<%= paths.assts %>/common/**/*',
							dest: destination+'/'
						})

						// version assets

						// products.push({
						// 	expand: true,
						// 	flatten: true,
						// 	filter: 'isFile', 
						// 	src:'<%= paths.assts %>/versions/'+sizes[s].s+'/**/*',
						// 	dest: destination+'/'
						// })

						// html

						products.push({
							expand: true,
							flatten: true,
							filter: 'isFile', 							
							src:'<%= paths.html %>/*',
							dest: destination+'/'
						})

						return products;
				})()
			},			

			distribution:{

				/* build copy task based on production sizes (sizes.json) */
				files: ( function(){
					var products = [];				
					for(var s=0;s<sizes.length;s++){
						var destination = '<%= paths.dest %>/'+sizes[s].s

						// js files

						products.push({
							src:'<%= paths.mstr %>/app.js',
							dest: destination+'/app.js'
						})

						// frameworks files - should probably be concatenated 

						for(var f=0;f<frameworks.length;f++){
							products.push({
								src:'<%= paths.libs %>/'+frameworks[f],
								dest: destination+'/'+frameworks[f]
							})
						}

						// common assets

						products.push({
							expand: true,
							flatten: true,
							filter: 'isFile', 
							src:'<%= paths.assts %>/common/**/*',
							dest: destination+'/'
						})

						// version assets

						products.push({
							expand: true,
							flatten: true,
							filter: 'isFile', 
							src:'<%= paths.assts %>/versions/'+sizes[s].s+'/**/*',
							dest: destination+'/'
						})

						// html

						products.push({
							expand: true,
							flatten: true,
							filter: 'isFile', 							
							src:'<%= paths.html %>/*',
							dest: destination+'/'
						})																										
					}				
					return products;
				})()
			}

		},

		sass:{

			options:{
				compass:true
			},

			master:{
				files:{
					'<%= paths.dest %>/master/styles.css':'<%= paths.srcscss %>/master/styles.scss'
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

	/* 
	*/

	grunt.loadNpmTasks("grunt-contrib-concat");
	grunt.loadNpmTasks("grunt-contrib-uglify");
	grunt.loadNpmTasks("grunt-contrib-copy");
	grunt.loadNpmTasks("grunt-contrib-sass");
	grunt.loadNpmTasks("grunt-contrib-watch");

	grunt.loadNpmTasks("grunt-svgo");		

	/* 
	*/

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

		populate(path, [ ['common'], assets ]);
		populate(path, [ ['versions'], _sizes, assets ]);			

		//grunt.file.write(filepath, contents [, options]);
	});	

	/* 

	write base scss and js files - this will be better achieved with proper templating

	*/
	
	grunt.task.registerTask('writebase', 'write base files.', function() {

		var scsspath = grunt.template.process('<%= paths.srcscss %>');
		var jspath = grunt.template.process('<%= paths.srcjs %>');		
		
		function init(w, h){
			var init = '' ;
				init+= '@import "settings"; \n' ;
				init+= '$sizex:'+w+'px; \n' ;
				init+= '$sizey:'+h+'px; \n' ;
				init+= '@import "core"; \n' ;
				return init;			
		}

		for(var s=0;s<sizes.length;s++){
				grunt.file.write(scsspath+'/'+sizes[s].s+'/styles.scss', init(sizes[s].w, sizes[s].h) );
		}

		grunt.file.write(scsspath+'/master/styles.scss', init(300, 250)  );

		grunt.file.write(scsspath+'/_common/_settings.scss', '' );		
		grunt.file.write(scsspath+'/_common/_core.scss', '' );

		grunt.file.write(jspath+'/app.js', '' );
	
	});	

	grunt.registerTask('setup', ['makefolders', 'writebase']);	
	grunt.registerTask('makemaster', ['concat:master', 'copy:master', 'sass:master']);	
	grunt.registerTask('distribution', ['concat:master','copy:distribution','sass:distribution']);		

	grunt.task.registerTask('log', 'Log stuff.', function() {
		var path = grunt.template.process('<%= paths.srcjs %>/app.js');
		var content =  grunt.file.read( path );
		grunt.log.write( grunt.template.process( content ) );
	  	//grunt.log.writeln(this.target + ': ' + ( this.data instanceof Object && !(this.data instanceof Array)));
	});	
}