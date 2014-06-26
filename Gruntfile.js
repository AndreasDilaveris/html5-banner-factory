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

	grunt.initConfig({
		pkg:pkg,
		sizes:sizes,

		/* collect file paths */
		paths:{
			dest:'<%= pkg.dest_paths.core %>',
			srcjs:'<%= pkg.src_paths.js %>',
			srcscss:'<%= pkg.src_paths.scss %>'
		},

		copy:{

			master:{
				files:{
					'<%= paths.dest %>/master/js/app.js':'<%= paths.srcjs %>/app.js'
				}
			},

			distribution:{
				/* build copy task based on production sizes (sizes.json) */
				files: ( function(){
					var products = [];				
					for(var s=0;s<sizes.length;s++){
						products.push({
							src:'<%= paths.srcjs %>/app.js', 
							dest:'<%= paths.dest %>/'+sizes[s].s+'/js/app.js'
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
							src:'<%= paths.srcscss %>/'+sizes[s].s+'.scss',
							dest: '<%= paths.dest %>/'+sizes[s].s+'/css/style.css'
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