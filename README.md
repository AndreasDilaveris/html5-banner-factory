html5-banner-factory
======================

Html5 banner project setup for building suite of banners across different size formats

Goal:
Seperate responsibilities where necessary while keeping common code centralized.
Create methods for setting up project structure


sizes.json - 
list of deliverable sizes.  used by Gruntfile for task configuration

Gruntfile.js - 
provides a set of methods to output suite of banners, setup up project etc

Usage
======================

1. edit sizes.json
-------------------
sizes.json needs to be edited to reflect the project deliverables.  This needs to be done prior to project setup.  Folder structures in the assets and dev folders will reflect the contents of the file.  

for instance a sizes.json file containing:

{ v1:300x250,
v2:300x250,
v1:728x90,
v2:728x90 }

will result in a folder structure consisting of four deliverables 300x250-v1, 300x250-v2, 728x90-v1 etc..

2. run grunt setup
------------------
setup will create all the necessary folders and populate them with required base files such ass a common app.js file, _core.scss , settings.scss , individual .scss files etc.
