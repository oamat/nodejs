# Nodejs Projects

Several nodejs projects developed with different frameworks like loopback or cloud like firebase.


*You can find other readme with instructions and descriptions in any folder (project).*

-----------------------------------------------
# How can I download a folder of this git repo

If you are willing to use git to do this, you can do a sparse checkout.  First of all you are going to start by creating an empty git repo locally, and then add the repository we want as a remote. This allows us to easily just checkout the folder we want :

```bash

    # mkdir <your_repo>
    # cd <your_repo>
    # git config core.sparseCheckout true
    # git clone https://github.com/oamat/nodejs.git <path>        
           e.g. : git clone https://github.com/oamat/nodejs.git ./apiGenerator
           
```
 
Obviously, this requires you to use git, but it shouldn't bee too difficult to automate if it's something you are doing often.
