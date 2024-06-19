# ciclomputer
Projeto de código aberto que trata e disponibiliza os dados coletados pela equipe avaliadora de campo através da [ferramenta de auditoria cicloviária do IDECICLO](https://github.com/Ameciclo/auditoria-cicloviaria).  

## Instalação e Execução do Script
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

1 - Adicione os arquivos GPX de avaliação na pasta src/gpx-files (ou rode com os que já estao lá para teste)

2 - `npm run dev`

3 - 💡 uma pasta em `src` chamada chamada `result` vai conter um arquivo `data.json` com os dados de cada arquivo gpx processados. 


### Entendendo mais sobre o JSON gerado:
  a estrutura basica do JSON resultado é a seguinte:

um array de objetos [{},{},{}...]
onde cada objeto representa um acumulado de dados de cada GPX

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
- "metadata" - dados basicos informativos sobre o conteudo analizado
- "acumulado de dados brutos" - sao todas as categorias e botoes contabilizados no gpx analizado, necessario para construir o elemento "resume"


