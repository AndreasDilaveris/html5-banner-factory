module.exports  = function(grunt){

	var pkg = grunt.file.readJSON('package.json');
	
	/* banner sizes for production */
	var sizeobj = grunt.file.readJSON('sizes.json');
	
	/* sizes as array */
	var sizes=[];
	for(var a in sizeobj){
		sizes.push({
			s:sizeobj[a], 
			n:a });
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
			assts: 'assets2'			
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
		}	

	});

	/* */

	grunt.loadNpmTasks("grunt-contrib-concat");
	grunt.loadNpmTasks("grunt-contrib-uglify");
	grunt.loadNpmTasks("grunt-contrib-copy");
	grunt.loadNpmTasks("grunt-contrib-sass");
	grunt.loadNpmTasks("grunt-contrib-watch");	

	grunt.task.registerTask('setup', 'setup essential files and folders.', function() {

		// recursive function for building folder trees
		
		function populate (path, sets){
			if(!sets.length) return; var set=sets.shift();
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

	});	

	grunt.registerTask('makemaster', ['concat:master', 'copy:master', 'sass:master']);	
	grunt.registerTask('distribution', ['concat:master','copy:distribution','sass:distribution']);		

	grunt.task.registerTask('log', 'Log stuff.', function() {
		var path = grunt.template.process('<%= paths.srcjs %>/app.js');
		var content =  grunt.file.read( path );
		grunt.log.write( grunt.template.process( content ) );
	  	//grunt.log.writeln(this.target + ': ' + ( this.data instanceof Object && !(this.data instanceof Array)));
	});	
}