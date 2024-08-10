const fs = require('fs');
const xml2js = require('xml2js');
const csv = require('csv-parser');
const path = require('path');

const csvFilePath = 'files-to-merge.csv';
const gpxDir = 'gpx-originals';  // Diretório onde os arquivos GPX estão localizados
const gpxMergedDir = '../src/gpx-files';  // Diretório para salvar os arquivos GPX processados

// Criar a pasta gpx-merged se não existir
if (!fs.existsSync(gpxMergedDir)) {
    fs.mkdirSync(gpxMergedDir);
}

// Função para ler o arquivo CSV
const readCSV = (filePath) => {
    return new Promise((resolve, reject) => {
        const results = [];
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', () => resolve(results))
            .on('error', (err) => reject(err));
    });
};

// Função para copiar arquivo GPX mantendo os waypoints
const copyGpxFile = (inputFile, outputFile) => {
    fs.readFile(inputFile, (err, data) => {
        if (err) throw err;
        const parser = new xml2js.Parser();
        const builder = new xml2js.Builder();
        
        parser.parseString(data, (err, result) => {
            if (err) throw err;
            const outputData = {
                gpx: {
                    metadata: result.gpx.metadata || {},
                    wpt: result.gpx.wpt || []
                }
            };
            const xml = builder.buildObject(outputData);
            fs.writeFile(outputFile, xml, (err) => {
                if (err) throw err;
                console.log(`Copied ${inputFile} to ${outputFile}`);
            });
        });
    });
};

// Função para mesclar arquivos GPX
const mergeGpxFiles = (file1, file2, outputFile) => {
    const parser = new xml2js.Parser();
    const builder = new xml2js.Builder();

    fs.readFile(file1, (err, data1) => {
        if (err) throw err;
        parser.parseString(data1, (err, gpx1) => {
            if (err) throw err;

            fs.readFile(file2, (err, data2) => {
                if (err) throw err;
                parser.parseString(data2, (err, gpx2) => {
                    if (err) throw err;

                    // Merge metadata (assuming file1 has the metadata)
                    const mergedGpx = {
                        gpx: {
                            metadata: gpx1.gpx.metadata || gpx2.gpx.metadata,
                            wpt: [...(gpx1.gpx.wpt || []), ...(gpx2.gpx.wpt || [])]
                        }
                    };

                    const xml = builder.buildObject(mergedGpx);
                    fs.writeFile(outputFile, xml, (err) => {
                        if (err) throw err;
                        console.log(`Merged ${file1} and ${file2} into ${outputFile}`);
                    });
                });
            });
        });
    });
};

// Função principal para processar os arquivos
const processFiles = async () => {
    try {
        const csvData = await readCSV(csvFilePath);

        for (const row of csvData) {
            const { fileName, fileToMerge } = row;
            const inputFile1Path = path.join(gpxDir, fileName);
            const outputFilePath = path.join(gpxMergedDir, fileName);

            if (!fileToMerge) {
                // Se não houver arquivo para mesclar, copiar apenas os waypoints
                console.log(`Copying ${fileName}`);
                copyGpxFile(inputFile1Path, outputFilePath);
            } else {
                // Mesclar os arquivos
                const inputFile2Path = path.join(gpxDir, fileToMerge);
                console.log(`Merging ${fileName} with ${fileToMerge}`);
                mergeGpxFiles(inputFile1Path, inputFile2Path, outputFilePath);
            }
        }
    } catch (error) {
        console.error('Error processing files:', error);
    }
};

processFiles();
