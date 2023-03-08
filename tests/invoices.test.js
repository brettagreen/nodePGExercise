// Tell Node that we're in test "mode"
process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../app');
const createTestData  = require('../testData');
const db = require('../db');

beforeAll(createTestData);

afterAll(async function() {
    await db.end();
    process.env.NODE_ENV = 'dev';
});

describe('GET /', function() {
    test('return a list of all invoices', async function() {
        const res = await request(app).get('/invoices');
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ "invoices": [
            {id: 1, comp_code: "dell", amt: 100, paid: false, add_date: expect.any(String), paid_date: null},
            {id: 2, comp_code: "jenny", amt: 200, paid: true, add_date: expect.any(String), paid_date: expect.any(String)},
            {id: 3, comp_code: "ibm", amt: 300, paid: false, add_date: expect.any(String), paid_date: null}
        ]});
    });
});

describe('GET /:id', function() {
    test('return the invoice and find out whom it is for', async function() {
        const res = await request(app).get('/invoices/1');
        console.log(res.body);
        expect(res.body).toEqual({
            invoice: {
                id: 1,
                comp_code: 'dell',
                amt: 100,
                paid: false,
                add_date: expect.any(String),
                paid_date: null,
            }, company: {
                    code: 'dell',
                    name: 'Dell computers',
                    description: 'donchya wish'
                }
            });
    });

    test('It should return 404', async function() {
        const res = await request(app).get('/invoices/59');
        expect(res.status).toEqual(404);
    });
});

describe('POST /', function() {
    test('create an invoice', async function() {
        const res = await request(app).post('/invoices').send({ comp_code: 'jenny', amt: 777 });

        expect(res.status).toEqual(201);
        
        expect(res.body).toEqual({
            invoice: {
                id: 4,
                comp_code: 'jenny',
                amt: 777,
                paid: false,
                add_date: expect.any(String),
                paid_date: null
            }
        });
    });
});

describe('PUT /:id', function() {
    test('update an invoice and pay it', async function() {
        let res = await request(app).put('/invoices/1').send({ amt: 250, paid: true });

        expect(res.body).toEqual({
            invoice: {
                id: 1,
                comp_code: 'dell',
                paid: true,
                amt: 250,
                add_date: expect.any(String),
                paid_date: expect.any(String)
            }
        });
    });

    test('update an invoice and unpay it', async function() {
        let res = await request(app).put('/invoices/2').send({ amt: 250, paid: false });

        expect(res.body).toEqual({
            invoice: {
                id: 2,
                comp_code: 'jenny',
                paid: false,
                amt: 250,
                add_date: expect.any(String),
                paid_date: null
            }
        });
    });

    test('return 404', async function() {
        const res = await request(app).put('/invoices/100').send({});

        expect(res.status).toEqual(404)
    });
});

describe('DELETE /:id', function() {
    test('delete an invoice', async function() {
        const res = await request(app).delete('/invoices/1');

        expect(res.body).toEqual({ status: 'deleted' });
    });

    test('return 404', async function() {
        const res = await request(app).delete('/invoices/1');

        expect(res.status).toEqual(404);
    });
});
