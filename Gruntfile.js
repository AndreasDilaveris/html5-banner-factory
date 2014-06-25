module.exports  = function(grunt){

	var pkg = grunt.file.readJSON('package.json');
	/* banner sizes for production */
	var sizeobj = grunt.file.readJSON('sizes.json');
	
	var sizes=[];
	for(var a in sizeobj){
		sizes.push(sizeobj[a]);
	}

	grunt.initConfig({
		pkg:grunt.file.readJSON('package.json'),
		sizes:sizes,
		/* collect file paths */
		paths:{
			dest:'<%= pkg.dest_paths.core %>',
			srcjs:'<%= pkg.src_paths.js %>',
			srcscss:'<%= pkg.src_paths.scss %>'
		},

		copy:{

			distribution:{
				files:{
					'<%= paths.dest %>/master/js/app.js':'<%= paths.srcjs %>/app.js'
				}
			},

			distribution:{
				/* build copy task based on production sizes (sizes.json) */
				files: ( function(){
					var products = [];
					products.push({
						src:'<%= paths.srcjs %>/app.js', 
						dest:'<%= paths.dest %>/master/js/app.js'
					})					
					for(var s=0;s<sizes.length;s++){
						products.push({
							src:'<%= paths.srcjs %>/app.js', 
							dest:'<%= paths.dest %>/'+sizes[s]+'/js/app.js'
						})
					}
					return products;
				})()
			}

		},

		sass:{
			distribution:{

				options:{
					compass:true
				},

				files:( function(){
					var products = [];
					for(var s=0;s<sizes.length;s++){
						products.push({
							src:'<%= paths.srcscss %>/'+sizes[s]+'.scss',
							dest: '<%= paths.dest %>/'+sizes[s]+'/css/style.css'
						})
					}
					return products;
				})()
			}
		},		

	});

	/* */

	grunt.loadNpmTasks("grunt-contrib-concat");
	grunt.loadNpmTasks("grunt-contrib-uglify");
	grunt.loadNpmTasks("grunt-contrib-copy");
	grunt.loadNpmTasks("grunt-contrib-sass");
	grunt.loadNpmTasks("grunt-contrib-watch");	

	grunt.registerTask('distribution', ['copy:distribution','sass:distribution']);			
}