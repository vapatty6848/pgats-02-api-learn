//  Importa as bibliotecas necessárias para testar
const request = require('supertest');
const { expect } = require('chai');

// Início dos testes de transferência via GraphQL
describe('Transferencia GraphQL', () => {
    describe('POST /graphql ', () => {
// Antes de cada teste, faz login para obter o token de autenticação
        beforeEach(async () => {
             // Faz a mutation de login e pega o token
            const respostaLogin = await request('http://localhost:4000')
                .post('/graphql')
                .send({
                    "query": "mutation LoginUser($password: String!, $username: String!) { loginUser(password: $password username: $username) {user {favorecidos saldo username}token}}",
                    "variables": {
                        "username": "julio",
                        "password": "123456"
                    }
                });
         // Salva o token para usar nos próximos testes
            token = respostaLogin.body.data.loginUser.token;
        });
        // Testa se a transferência funciona quando tudo está certo
        it(' Quando  é uma Transferencia de sucesso', async () => {
            const resposta = await request('http://localhost:4000')
                .post('/graphql')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    "query": "mutation CreateTransfer($from: String!, $to: String!, $value: Float!) { createTransfer(from: $from, to: $to, value: $value) { from to value } }",
                    "variables": {
                        "from": "julio",
                        "to": "priscila",
                        "value": 100
                    }
                });

            expect(resposta.status).to.equal(200);
            expect(resposta.body.data.createTransfer.value).to.equal(100)
        });
       // Testa se aparece erro quando não tem saldo suficiente
        it('Quando a Transferencia não tem  saldo disponivel ', async () => {
            const resposta = await request('http://localhost:4000')
                .post('/graphql')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    "query": "mutation CreateTransfer($from: String!, $to: String!, $value: Float!) { createTransfer(from: $from, to: $to, value: $value) { from to value } }",
                    "variables": {
                        "from": "julio",
                        "to": "priscila",
                        "value": 20000
                    }
                });
            expect(resposta.status).to.equal(200);
            expect(resposta.body.errors[0]).to.have.property('message', 'Saldo insuficiente')
        });
         // Testa se aparece erro quando o token de autenticação está inválido
        it('Quando a Transferencia  está como  Token de autenticação inválido', async () => {
            const token= '    '
            const resposta = await request('http://localhost:4000')
                .post('/graphql')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    "query": "mutation CreateTransfer($from: String!, $to: String!, $value: Float!) { createTransfer(from: $from, to: $to, value: $value) { from to value } }",
                    "variables": {
                        "from": "julio",
                        "to": "priscila",
                        "value": 100
                    }
                });
            expect(resposta.status).to.equal(200);
            expect(resposta.body.errors[0]).to.have.property('message', 'Autenticação obrigatória')
        });




    });
});
