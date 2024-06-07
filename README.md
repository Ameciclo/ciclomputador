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
Sendo a chave "resume", o principal elemento de consumo de outros serviços.

### Dev:

- [x] [Setup](https://github.com/Ameciclo/ideciclo-processador-GPX/commit/ede0b673153867981d2ff6cf0382ccdfed23629b)
- [x] [Parametrização dos dados coletados no .gpx ](https://github.com/Ameciclo/ideciclo-processador-GPX/pull/1)
- [ ] [Issue de alinhamento referências](https://github.com/Ameciclo/ideciclo-processador-GPX/issues/3)
- [ ] Tratamento de "Errors" ou "Warnings" nos dados parametrizados.










  
