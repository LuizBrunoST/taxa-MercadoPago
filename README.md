# Calculadora de Taxa do Mercado Pago

Este é um simples aplicativo web para calcular a taxa que o Mercado Pago cobra em transações e o saldo final após a dedução da taxa. Além disso, o aplicativo também calcula quanto você pode cobrar do cliente para compensar a taxa.

## Demonstração

Veja a aplicação em ação [DEMO](link-para-a-demo).

![screencapture-localhost-taxa-MercadoPago-2024-02-08-23_40_31](https://github.com/LuizBrunoST/taxa-MercadoPago/assets/64446877/c9359077-f1cf-4306-931a-093d7f701ee7)


## Como Usar

1. Abra o arquivo `index.html` em um navegador da web.
2. Insira o valor da transação e a taxa percentual do Mercado Pago.
3. Clique no botão "Calcular".
4. Os resultados serão exibidos abaixo do formulário, mostrando a taxa a ser paga, o saldo final após a dedução da taxa e o valor total que o cliente deve pagar.

## Exemplo de Uso

```javascript
var valorTransacao = 100; // Valor da transação em reais
var taxaPercentual = 4.99; // Taxa percentual do Mercado Pago

var taxaAPagar = calcularTaxa(valorTransacao, taxaPercentual);
var totalApagarCompleto = valorTransacao - taxaAPagar;
var totalAPagarCliente = valorTransacao + taxaAPagar;

console.log("Taxa a ser paga: R$ " + taxaAPagar.toFixed(2));
console.log("Saldo final: R$ " + totalApagarCompleto.toFixed(2));
console.log("Quanto pode cobrar: R$ " + totalAPagarCliente.toFixed(2));
```

## Contribuição


Contribuições são bem-vindas! Se você encontrar algum problema ou tiver alguma sugestão de melhoria, por favor, abra uma issue ou envie um pull request.

## Licença

Este projeto está licenciado sob a Licença MIT.
