#Server API code generation

Server API code generation can simplify your build process by generating server codes for any API. You only need the Swagger YAML definition (defined with the OpenAPI specification). So you can focus better on your API’s implementation and adoption.


 Install, only first time
```bash

    # mkdir <your_repo>
    # cd <your_repo>
    # git config core.sparseCheckout true
    # git clone https://github.com/oamat/nodejs.git ./apiGenerator/APIGen
    # cd .\apiGenerator\APIGen\    
    # ./install.ps1
 
```

### Executing API Interfaces, and implementations

Edit & config ./config.json
    Edit & config ./config/config.json
    Edit & config ./config/swagger.yaml

Generate all implementation codes : 
```bash
    # node .\app.js
```

Codes will be generate to .\output\api\ folder


### Remote validation Swagger

```bash
    - Nodejs Code Validation or Generated on https://editor.swagger.io/ 
```

### Running the server
Go to .\output\api and run:

```bash
    # npm start
```

or 

```bash
    # swagger project start
    
    # swagger project edit  (edit swagger)
      
    # swagger project start -m  (mock objects)
```

### To view the Swagger UI interface:

```
open http://localhost:8080/docs   (IMPOTANT: Change Scheme HTTP for local testing)
```


### Code source folders

Codes will be generate to .\output\api\ folder with scafolding :
```bash
api/mocks : for testing API. TO DO
api/routers  : Not exist because Swagger do automatically! : validate params (400 Bad Request) and  chooses which controller (and which method on that controller:operationId) handles the request. Finally return response with 'res.send'.
api/controllers : save params in object, Call to services and return the result to router. 
api/service : bussiness logic, for example in PUT operations (update) check if id exist, in POST operations (create) check that object is not repeated
api/repositories : save the objects to persistence: memory, db, fs,...
api/models : Not exist because Swagger do automatically! The persistence object definition (is it necessary??)
api/helpers : util & helper methods
api/configs : API configs (JSON) if it's necessary
```


### Generating Auto Swagger (It's not necessary)

```bash

    # git clone https://github.com/swagger-api/swagger-codegen
    # cd swagger-codegen
    # mvn clean package
    # java -jar ./swagger-codegen/modules/swagger-codegen-cli/target/swagger-codegen-cli.jar generate -i E:/dev/nodejs/nodejs/apiGenerator/APIGen/config/swagger.yaml -l nodejs-server -o E:/dev/nodejs/nodejs/apiGenerator/APIGen/api_generated/swagger
```
