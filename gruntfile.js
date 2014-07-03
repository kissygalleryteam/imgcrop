module.exports = function (grunt) {
    grunt.initConfig({
        pkg:grunt.file.readJSON('abc.json'),
        banner:'/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' + '<%= grunt.template.today("yyyy-mm-dd h:MM:ss TT") %>\n' + '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' + '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' + ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',
        kmc:{
            options:{
                packages:[
                    {
                        name:'<%= pkg.name %>',
                        path:'../'
                    }
                ],
                map:[
                    ["<%= pkg.name %>/", "gallery/<%= pkg.name %>/"]
                ]
            },
            main:{
                files:[
                    {
                        src:"<%= pkg.version %>/index.js",
                        dest:"<%= pkg.version %>/build/index.js"
                    }
                ]
            }
        },
        uglify:{
            options:{
                banner:'<%= banner %>'
            },
            base:{
                files:{
                    '<%= pkg.version %>/build/index-min.js':['<%= pkg.version %>/build/index.js']
                }
            }
        },
        copy:{
            options:{
                banner:'<%= banner %>'
            },
            main:{
                files:[
                    {
                        expand:true,
                        cwd:'<%= pkg.version %>/',
                        src:['*.css'],
                        dest:'<%= pkg.version %>/build/'
                    }
                ]
            }
        },
        cssmin:{
            minify:{
                expand:true,
                cwd:'<%= pkg.version %>/build/',
                src:['*.css', '!*-min.css'],
                dest:'<%= pkg.version %>/build/',
                ext:'-min.css'
            }
        }
    });
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-kmc');
    return grunt.registerTask('default', ['kmc', 'uglify', 'copy', 'cssmin']);
};