# Instalação e Execução do Script
⚠️ versão node 22.1.0

Para executar esse script de processamento de dados GPX você precisa lançar os seguintes comandos, após clonar o repositório:

`npm install`
`npm run dev`

## Passo a Passo de Uso

1 - Adicione os arquivos GPX de avaliação na pasta src/gpx-files (ou rode com os que já estao lá para teste)

2 - `npm run dev`

3 - 💡 uma pasta em 'src' chamada chamada 'result' vai conter um arquivo 'data.json' com os dados de cada arquivo gpx processados. 


### Entendendo mais sobre o JSON gerado:
  a estrutura basica do JSON resultado é a seguinte:

um array de objetos [{},{},{}...]
onde cada objeto representa um acumulado de dados de cada GPX

ex.:

```
[
  {
    resume: {},
    metadata: {},
    ... acumulado de dados brutos
  },
  ...
]
```
Basicamente a chave resume sintetiza tudo que interessa de dados de cada gpx.
