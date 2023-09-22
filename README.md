# rast2js

Conversor de Rinha AST para Javascript

Este utilitário transforma a AST [da linguagem Rinha](https://github.com/aripiprazole/rinha-de-compiler/blob/main/SPECS.md) em 
uma AST no formato [ESTree/Esprima](https://link-url-here.org) e então utiliza [Escodegen](https://github.com/estools/escodegen) para gerar o 
código Javascript correspondente.   

Instruções:

```bash
npm run start --mute=false --file=/var/rinha/source.rinha.json
```


Executar via Docker (O exemplo considera que a AST está no host em /var/rinha/source.rinha.json)

```bash
docker build -t rinha . && docker run -v /var/rinha:/input rinha 
```






