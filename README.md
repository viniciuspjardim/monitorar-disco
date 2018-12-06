# Monitorar Disco
Monitora o espaço em disco dos servidores de cálculo do sistema de RH Ergon.
Caso o espaço em disco seja menor do que o valor informado no arquivo `config.json`
o programa ranqueia as pastas de execução por ordem de importância e remove as
menos importantes até atingir o espaço mínimo.

O log da execução do programa é gravado na pasta de instalação no arquivo
`log.txt`.

## Arquivo `config.json`

```json
{
    "unidade": "C",
    "pastaExecucao": "C:/folha/execucao/Emp_01_XYZ/",
    "espacoMinimo": 25,
    "importanciaMaxima": 94
}
```
* O campo `espacoMinimo` é em GB;
* A importância é calculada com a formula
`100 - <número de dias da pasta de execução> - <penalidades>`;
* Ver penalidades no código;
* Pastas de execução com valor maior que `importanciaMaxima` não serão excluídas.

## Como Configurar
O computador precisa ter instalado o .NET 3.5. Para instalar este recurso no
Windows Server faça o seguinte:
1. Abra o `Gerenciador de Servidores` e vá em `Recursos` > `Adicionar Recursos`;
2. Selecione `Recursos do .NET Framework 3.5.1` e clique em `Próximo >` depois em
`Instalar`.

Baixe e instale também o Node.js, que executará o script.

A última versão de Monitorar Disco está disponível [em seu repositório no GitHub](https://github.com/viniciuspjardim/monitorar-disco/releases).
Baixe e extraia o arquivo zip em uma pasta que será considerada a pasta de
instalação.

Para executar Monitorar Disco manualmente, abra o terminal na pasta de instalação
e execute o comando
```
node monitorarDisco.js
```

É possível automatizar o processo configurando o Agendador de Tarefas do Windows
para executar o script de forma periódica (todo dia, por exemplo).