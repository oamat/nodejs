# nodejs
Several nodejs projects developed with different frameworks like loopback or cloud like firebase.

-----------------------------------------------
# How can I download a folder of this git repo

If you are willing to use git to do this, you can do a sparse checkout.  First of all you are going to start by creating an empty git repo locally, and then add the repository we want as a remote. This allows us to easily just checkout the folder we want :

- mkdir folderName
- cd folderName
- git init
- git remote add origin -f repoUrl
 
After that, we want to add the directory to 

- .git/info/sparse-checkout        
   (this is essentially the opposite of the gitignore file).

Then we can do :

- git pull origin master   
 (and it should download only the folder you want).

 
Obviously, this requires you to use git, but it shouldn't bee too difficult to automate if it's something you are doing often.
