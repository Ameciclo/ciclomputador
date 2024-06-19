# ciclomputer
Projeto de código aberto que trata e disponibiliza os dados coletados pela equipe avaliadora de campo através da [ferramenta de auditoria cicloviária do IDECICLO](https://github.com/Ameciclo/auditoria-cicloviaria).  

## Execução do Script
⚠️ versão node 14+

clone o repositório

`git clone https://github.com/Ameciclo/ciclomputer.git`

entre na pasta 

`cd ciclomputer`

instale as dependências

`npm install`

rode o script

`npm run dev`

## Passo a Passo de Uso

1 - Substitua os arquivos GPX de avaliação na pasta `src/gpx-files` (ou rode com os arquivos gpx já presentes)

2 - rode o comando de execução do script
`npm run dev`

3 - 💡 uma pasta em `src` chamada `result` vai conter um arquivo `data.json` com os dados de cada arquivo gpx processados. 


### Entendendo mais sobre o JSON gerado:
  a estrutura basica do JSON resultado é a seguinte:

- um array de objetos [{},{},{}...]
- cada objeto desse array representa um acumulado de dados de cada GPX

ex.:

```
[
  {
    result: {},
    metadata: {},
    ... acumulado de dados brutos
  },
  ...
]
```
- "result" - dados finais para consumo
- "metadata" - dados básicos informativos sobre o conteúdo analizado
- "acumulado de dados brutos" - são todas as categorias e botões contabilizados no gpx analizado, necessário para construir o elemento "resume"


