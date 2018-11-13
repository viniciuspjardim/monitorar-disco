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
O computador precisa ter instalado o .NET 3.5. Para instalar este recurso no
Windows Server faça o seguinte:
1. Abra o `Gerenciador de Servidores` e vá em `Recursos` > `Adicionar Recursos`;
2. Selecione `Recursos do .NET Framework 3.5.1` e clique em `Próximo >` depois em
`Instalar`.

Baixe e instale também o Node.js, que executará o script.

Para executar Monitorar Disco manualmente, abra o terminal na pasta de instalação
e execute o comando
```
node monitorarDisco.js
```

Para executar automaticamente todo dia, configure o Agendador de
Tarefas do Windows para executar o script.