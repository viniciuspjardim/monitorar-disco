# Monitorar Disco
Monitora o espaço em disco dos servidores de cálculo do sistema de RH Ergon.
Caso o espaço em disco seja menor do que o valor informado no arquivo `config.json`
o programa ranqueia as pastas de execução por ordem de importância e remove as
menos importantes até atingir o espaço mínimo.

## Arquivo `config.json`

```json
{
    "unidade": "C",
    "pastaExecucao": "C:/folha/execucao/Emp_01_XYZ/",
    "espacoMinimo": 25
}
```
O campo `espacoMinimo` é em GB.

## Como Configurar
Instalar o Node.js e configurar o Agendador de Tarefas do Windows para executar
o script todo dia.