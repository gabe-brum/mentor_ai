# Mentor AI - o guia para devs juniores

Projeto desenvolvido para a Imersão AI Alura + Google Gemini

## Como rodar o projeto

Basta fazer o clone do projeto e em seu terminal rodar o seguinte comando
`yarn && yarn dev` ou `npm install && npm run dev`

## Criação da API key

Para que o projeto rode corretamente, é necessário que você insira sua chave de API para poder utilizar os poderes do Gemini. Como essa chave é um valor sensível e esse projeto é apenas uma idealização e prototipação, deixei para que cada um insira a sua.
Para criar a sua chave você pode acessar o guia feito pela Aluna em https://www.youtube.com/watch?v=5TNzbqMM_2k

### Uso da API key no projeto

Tendo copiado a sua chave, basta acessar seu App.jsx e no local onde é feito a inicialização do GoogleGenerativeAI, coloque a dentro das aspas:
![Local de inserção da API key](image.png)
