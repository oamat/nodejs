var assert = require('assert');
const fs = require('fs');
const { exit } = require('process');
const csv = require('@fast-csv/parse');

var BEsRows = 0;
var CAsRows = 0;
var DBsRows = 0;
var PRQsRows = 0;
var PalancasBankiaRows = 0;
var SEsRows = 0;
var SIsRows = 0;
var SNsRows = 0;
var TXsRows = 0;
var XMLAPPsRows = 0;

describe("TEST IDEINS - CHECK LINES OUTPUT FILES", function () {

    before("CRSearcher batch tests using CHAI module: ", async function () {
        BEsRows = await loadCSV_ROWS("./results/outputs/BEsOutputFileIDEINS_SI1.csv");
        CAsRows = await loadCSV_ROWS("./results/outputs/CAsOutputFileIDEINS_SI1.csv");
        DBsRows = await loadCSV_ROWS("./results/outputs/DB.OutputFileIDEINS_BE.csv");
        PalancasBankiaRows = await loadCSV_ROWS("./results/outputs/PalancasOutputFileIDEINS_SI1.csv");
        PRQsRows = await loadCSV_ROWS("./results/outputs/PRQsOutputFileIDEINS_SE.csv");
        SEsRows = await loadCSV_ROWS("./results/outputs/SEsOutputFileIDEINS_SN.csv");
        SIsRows = await loadCSV_ROWS("./results/outputs/TransferenciasInmediatasOutputFileIDEINS_SN1.csv");
        SNsRows = await loadCSV_ROWS("./results/outputs/SNsOutputFileIDEINS_ADS.csv");
        TXsRows = await loadCSV_ROWS("./results/outputs/TLE-TX.OutputFileIDEINS_ADS.csv");
        XMLAPPsRows = await loadCSV_ROWS("./results/outputs/XMLAPPsOutputFileIDEINS_BE.csv");
    });


    it("IDEINS Check BEs Output Lines File. (Orig-red, New-green)", async function () {
        let rows = await loadCSV_ROWS("./results/inputs/BEs/BEsOutputFileIDEINS_SI1.csv");
        assert.equal(rows,BEsRows);

    });

    it("IDEINS Check CAs Output Lines File. (Orig-red, New-green)", async function () {
        let rows = await loadCSV_ROWS("./results/inputs/CAs/CAsOutputFileIDEINS_SI1.csv");
        assert.equal(rows, CAsRows);
    });

    it("IDEINS Check DBs Output Lines File. (Orig-red, New-green)", async function () {
        let rows = await loadCSV_ROWS("./results/inputs/DBs/DB.OutputFileIDEINS_BE.csv");
        assert.equal(rows, DBsRows);
    });

    it("IDEINS Check Palancas Bankia Output Lines File. (Orig-red, New-green)", async function () {
        let rows = await loadCSV_ROWS("./results/inputs/PalancasBankia/PalancasOutputFileIDEINS_SI1.csv");
        assert.equal(rows, PalancasBankiaRows,);
    });


    it("IDEINS Check PRQs Output Lines File. (Orig-red, New-green)", async function () {
        let rows = await loadCSV_ROWS("./results/inputs/PRQs/PRQsOutputFileIDEINS_SE.csv");
        assert.equal(rows, PRQsRows );
    });

    it("IDEINS Check SEs Output Lines File. (Orig-red, New-green)", async function () {
        let rows = await loadCSV_ROWS("./results/inputs/SEs/SEsOutputFileIDEINS_SN.csv");
        assert.equal(rows, SEsRows);
    });

    it("IDEINS Check SIs Output Lines File. (Orig-red, New-green)", async function () {
        let rows = await loadCSV_ROWS("./results/inputs/SIs/TransferenciasInmediatasOutputFileIDEINS_SN1.csv");
        assert.equal(rows, SIsRows);
    });

    it("IDEINS Check SNs Output Lines File. (Orig-red, New-green)", async function () {
        let rows = await loadCSV_ROWS("./results/inputs/SNs/SNsOutputFileIDEINS_ADS.csv");
        assert.equal(rows, SNsRows);
    });


    it("IDEINS Check TXs Output Lines File. (Orig-red, New-green)", async function () {
        let rows = await loadCSV_ROWS("./results/inputs/TXs/TLE-TX.OutputFileIDEINS_ADS.csv");
        assert.equal(rows, TXsRows);
    });


    it("IDEINS Check XMLAPPs Output Lines File. (Orig-red, New-green)", async function () {
        let rows = await loadCSV_ROWS("./results/inputs/XMLAPPs/XMLAPPsOutputFileIDEINS_BE.csv");
        assert.equal(rows, XMLAPPsRows);
    });
});


/* ******************************
 * UTIL FUNCTIONS
 ********************************/

//loadCSV function, generic CSV Loader.
const loadCSV_ROWS = async function (filename) {
    return new Promise((resolve, reject) => {
        fs.createReadStream(filename)
            .pipe(csv.parse({ delimiter: ';' }))
            .on('error', error => { console.error(error); reject(error); exit(1); })
            .on('data', row => {
                //console.log(`ROW=${JSON.stringify(row)}`)
            }).on('end', rowCount => {
                //console.log('\x1b[36m', `Parsed ${rowCount} rows from ${params.doc}`);                
                resolve(rowCount);
            });
    });
}
