# Taxa Clara · Simulador Mercado Pago

Calculadora independente de taxas, feita com HTML, CSS e JavaScript nativo, sem dependências de execução ou etapa de build.

## Executar

Abra `index.html` no navegador ou sirva a pasta com um servidor HTTP estático. Para copiar o resumo pela Clipboard API, use HTTPS ou localhost e permita acesso à área de transferência.

## Funcionalidades

- Temas claro e escuro: segue inicialmente o sistema e salva a escolha localmente.
- Simulação do valor líquido de uma venda ou do valor necessário para receber um líquido desejado.
- Taxa percentual e tarifa fixa editáveis; suporte a `150,00`, `1.234,56` e `150.00`.
- Comparação de quatro taxas ilustrativas, seleção rápida e atualização dos resultados ao digitar.
- Histórico das cinco últimas simulações confirmadas, com reutilização e limpeza.
- Cópia do resumo e controles acessíveis por teclado.

## Cálculos

Valores são convertidos para centavos. A taxa percentual é arredondada para o centavo mais próximo sobre o valor cobrado, depois somada à tarifa fixa. O modo de valor líquido encontra a menor cobrança em centavos que cobre o líquido desejado sob essa regra.

Exemplo: venda de R$ 100,00 com taxa de 4,99% e sem tarifa fixa rende R$ 95,01. Para receber R$ 100,00, o simulador sugere R$ 105,25, considerando o arredondamento da taxa para R$ 5,25.

São aceitos valores positivos de até R$ 1 bilhão, tarifa fixa de zero a R$ 1 bilhão e taxa de 0% a menos de 100%, com até duas casas decimais. Um ponto isolado é interpretado como separador decimal; para milhares, use `1.234,00` ou `1234`.

## Dados e limites

As taxas são exemplos editáveis, não tarifas oficiais atuais. Confira os custos e arredondamentos aplicados à sua conta. Não há vínculo com o Mercado Pago. O cálculo não considera outros impostos, parcelamento ou custos não preenchidos.

O histórico e a preferência de tema ficam no `localStorage` do navegador; a calculadora continua funcionando se o armazenamento estiver indisponível. Anúncios externos, jQuery e W3.css foram removidos. As fontes do Google Fonts são opcionais, com fontes locais de reserva.

## Verificação

Execute `node tests/calculator.test.cjs` para verificar conversão de entradas, taxas e os cenários de cobrança mínima.
