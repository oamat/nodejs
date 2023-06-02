const redis = require('redis');
const redisearch = require('redis-redisearch');
const fs = require('fs');
const csv = require('@fast-csv/parse');
const { writeToPath } = require('@fast-csv/format');
const path = require('path');


//CONST to USE: THE CONFIG. (TODO: extract config in a file)
const toLoad = {
  CSV1: {
    doc: 'IDE01168.CSV',
    id: 0,
    columns: [1, 3, 4, 5, 6, 8, 18, 22, 23, 35, 47, 56, 57, 59, 70, 73, 75, 78, 81, 82, 83, 84, 85],
    names: ['aplicacion', 'tipo', 'subtipo', 'descripcion', 'visibilidad', 'descripcion2',
      'centro', 'ambito', 'usuarios', 'siglas', 'framework', 'empresa', 'departamento',
      'tipo_distribucion', 'tipo_aplicacion', 'horario', 'codigo', 'proveedor', 'area_funcional',
      'subarea1', 'subarea2', 'arquitectura']
  }
};

const PATH = './csv/';

const client = redis.createClient({ host: '127.0.0.1', port: '6379' });

client.on("error", function (error) {  //little test
  console.error(error);
});

client.set("TEST", "test");

//client.ft_create("myIdx ON HASH PREFIX 1 doc: SCHEMA escenario TEXT sistema TEXT aplicacion TEXT tipo TEXT componente TEXT area TEXT familia TEXT descripcion TEXT");


//client.hset('doc:10', 'escenario', "esceneraio_test");

const redisUrl = '127.0.0.1:6379';
const indexIDX = 'myIdx';

console.log(`Configuration Index: ${indexIDX} - redisUrl: ${redisUrl}`);

redisearch(redis);


const load = async () => {
  //console.log(toLoad.CSV1.columns.length + ' = ' + toLoad.CSV1.names.length);
  await loadCSV(toLoad.CSV1);

}

const init = (search_text) => {
  _search(search_text, options, (err, result) => {
    if (err) console.log(err);
    else {
      //console.log(result); 
      console.log(result.meta);
      console.table(result.arrayOfDocs);
    }

  });
}

const _search = function (queryString, options, callback) {

  let offset = 0; // default values
  let limit = 10; // default value


  // prepare the "native" FT.SEARCH call
  // FT.SEARCH IDX_NAME queryString  [options]
  const searchParams = [
    indexIDX,    // name of the index
    queryString,  // query string
  ];

  // if limit add the parameters
  if (options.offset || options.limit) {
    offset = options.offset || 0;
    limit = options.limit || 10
    searchParams.push('LIMIT');
    searchParams.push(offset);
    searchParams.push(limit);
  }
  // if sortby add the parameters  
  if (options.sortBy) {
    searchParams.push('SORTBY');
    searchParams.push(options.sortBy);
    searchParams.push((options.ascending) ? 'ASC' : 'DESC');
  }

  //console.log(searchParams);

  client.ft_search(
    searchParams,
    function (err, searchResult) {
      //console.log(searchResult);
      if (err) console.log(err);
      else {

        const totalNumberOfDocs = searchResult[0]; //length
        let arrayOfDocs = [];
        // create JSON document from n/v pairs (id, fields): 'doc:1',[field1:value1, field2:value2]
        for (let i = 1; i <= searchResult.length - 1; i++) {
          //console.log(searchResult[i])
          const doc = {
            id: searchResult[i] //e.g.  doc:1
          }
          i = i + 1;
          const fields = searchResult[i];
          //const json = {};
          //console.log(fields);
          for (let j = 0; j < fields.length; j++) {
            const idxKey = j;
            const idxValue = j + 1;
            doc[fields[idxKey]] = fields[idxValue];
            j = idxValue; //j + 1;
          }
          //console.log(json);
          arrayOfDocs.push(doc);

        }


        const result = {
          meta: {
            totalResults: totalNumberOfDocs,
            offset,
            limit,
            queryString,
          },
          arrayOfDocs
        }

        callback(err, result);
      }
    }
  );

}


const options = {
  offset: 0,
  limit: 10,
}



//loadCSV function, generic CSV Loader.
const loadCSV = async (params) => {
  return new Promise((resolve, reject) => {
    fs.createReadStream(PATH + params.doc)
      .pipe(csv.parse({ delimiter: ';' }))
      .on('error', error => { console.error(error); reject(error); })
      .on('data', async row => {
        let id = 'doc:' + row[params.id];
        if (id) {
          console.log(id + " : " + row[params.columns[0]]);
          client.hset(id, 'aplicacion', row[params.columns[0]]);
          for (let i = 0; i < params.names.length; i++) {
            //console.log(params.names[i] + " : " + row[params.columns[i]]);
            client.hset(id, params.names[i], row[params.columns[i]]);
          }
          /* 
           client.hset(id, 'tipo', row[params.columns[1]]);
           client.hset(id, 'subtipo', row[params.columns[2]]);
           client.hset(id, 'descripcion', row[params.columns[3]]);
           client.hset(id, 'visibilidad', row[params.columns[4]]);
           client.hset(id, 'descripcion2', row[params.columns[5]]);
           client.hset(id, 'centro', row[params.columns[6]]);
           client.hset(id, 'ambito', row[params.columns[7]]);
           client.hset(id, 'usuarios', row[params.columns[8]]);
           client.hset(id, 'siglas', row[params.columns[9]]);
           client.hset(id, 'framework', row[params.columns[10]]);
           client.hset(id, 'empresa', row[params.columns[11]]);
           client.hset(id, 'departamento', row[params.columns[12]]);
           client.hset(id, 'tipo_distribucion', row[params.columns[13]]);
           client.hset(id, 'tipo_aplicacion', row[params.columns[14]]);
           client.hset(id, 'horario', row[params.columns[15]]);
           client.hset(id, 'codigo', row[params.columns[17]]);
           client.hset(id, 'proveedor', row[params.columns[18]]);
           client.hset(id, 'area_funcional', row[params.columns[19]]);
           client.hset(id, 'subarea_funcional1', row[params.columns[20]]);
           client.hset(id, 'subarea_funcional2', row[params.columns[21]]);
           client.hset(id, 'subarea_funcional3', row[params.columns[22]]);
           client.hset(id, 'arquitectura', row[params.columns[23]]);
           */

        }
        //console.log(`ROW=${JSON.stringify(row)}`)
      }).on('end', rowCount => {
        console.log('\x1b[36m', `Parsed ${rowCount} rows from ${params.doc}`);
        resolve(true);
      });
  });
}

//load();
init('*crson*');