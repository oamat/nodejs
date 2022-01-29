var assert = require('assert');
const fs = require('fs');
const { exit } = require('process');
const csv = require('@fast-csv/parse');

/* 
describe("TEST IDEINS OUTPUT FILES", function () {

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

}
 */


    /* ******************************
 * TEST ALL RESULTS
 ********************************/

describe("TEST IDEINS - CHECK SIZE FILES BATCH OUTPUT FILES (all components) ", function () {

    it("Check BEs Output Size (Orig-red, New-green)", async function () {
        assert.equal(getFilesizeInBytes("./results/inputs/BEs/BEsOutputFileIDEINS_SI1.csv"), getFilesizeInBytes("./results/outputs/BEsOutputFileIDEINS_SI1.csv"));
    });

    it("Check CAs Output Size (Orig-red, New-green)", async function () {
        assert.equal(getFilesizeInBytes("./results/inputs/CAs/CAsOutputFileIDEINS_SI1.csv"), getFilesizeInBytes("./results/outputs/CAsOutputFileIDEINS_SI1.csv"));
    });

    it("Check DBs Output Size (Orig-red, New-green)", async function () {
        assert.equal(getFilesizeInBytes("./results/inputs/DBs/DB.OutputFileIDEINS_BE.csv"), getFilesizeInBytes("./results/outputs/DB.OutputFileIDEINS_BE.csv"));
    });

    it("Check Palancas Bankia Output Size (Orig-red, New-green)", async function () {
        assert.equal(getFilesizeInBytes("./results/inputs/PalancasBankia/PalancasOutputFileIDEINS_SI1.csv"), getFilesizeInBytes("./results/outputs/PalancasOutputFileIDEINS_SI1.csv"));
    });


    it("Check PRQs Output Size (Orig-red, New-green)", async function () {
        assert.equal(getFilesizeInBytes("./results/inputs/PRQs/PRQsOutputFileIDEINS_SE.csv"), getFilesizeInBytes("./results/outputs/PRQsOutputFileIDEINS_SE.csv"));
    });

    it("Check SEs Output Size (Orig-red, New-green)", async function () {
        assert.equal(getFilesizeInBytes("./results/inputs/SEs/SEsOutputFileIDEINS_SN.csv"), getFilesizeInBytes("./results/outputs/SEsOutputFileIDEINS_SN.csv"));
    });

    it("Check SIs Output Size (Orig-red, New-green)", async function () {
        assert.equal(getFilesizeInBytes("./results/inputs/SIs/TransferenciasInmediatasOutputFileIDEINS_SN1.csv"), getFilesizeInBytes("./results/outputs/TransferenciasInmediatasOutputFileIDEINS_SN1.csv"));
    });

    it("Check SNs Output Size (Orig-red, New-green)", async function () {
        assert.equal(getFilesizeInBytes("./results/inputs/SNs/SNsOutputFileIDEINS_ADS.csv"), getFilesizeInBytes("./results/outputs/SNsOutputFileIDEINS_ADS.csv"));
    });


    it("Check TXs Output Size (Orig-red, New-green)", async function () {
        assert.equal(getFilesizeInBytes("./results/inputs/TXs/TLE-TX.OutputFileIDEINS_ADS.csv"), getFilesizeInBytes("./results/outputs/TLE-TX.OutputFileIDEINS_ADS.csv"));
    });


    it("Check XMLAPPs Output Size (Orig-red, New-green)", async function () {
        assert.equal(getFilesizeInBytes("./results/inputs/XMLAPPs/XMLAPPsOutputFileIDEINS_BE.csv"), getFilesizeInBytes("./results/outputs/XMLAPPsOutputFileIDEINS_BE.csv"));
    });
});

/* ******************************
 * UTIL FUNCTIONS
 ********************************/

function getFilesizeInBytes(filename) {
    var stats = fs.statSync(filename);
    var fileSizeInBytes = stats.size;
    return fileSizeInBytes;
}


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
