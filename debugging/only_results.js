const fs = require('fs');

// Carrega o arquivo data.json
fs.readFile('data.json', 'utf8', (err, data) => {
    if (err) {
        console.error('Erro ao ler o arquivo:', err);
        return;
    }

    // Converte o conteúdo do arquivo JSON em um array de objetos
    const jsonData = JSON.parse(data);

    // Mapeia para um novo array contendo apenas os objetos "result"
    const resultsArray = jsonData.map(item => item.result);

    // Converte o array de volta para JSON
    const resultsJson = JSON.stringify(resultsArray, null, 2);

    // Salva o novo JSON em um arquivo
    fs.writeFile('results.json', resultsJson, 'utf8', (err) => {
        if (err) {
            console.error('Erro ao escrever o arquivo:', err);
            return;
        }
        console.log('Arquivo results.json foi salvo com sucesso!');
    });
});
