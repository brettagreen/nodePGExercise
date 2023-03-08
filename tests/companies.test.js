process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../app');
const createTestData = require('../testData');
const db = require('../db');

beforeAll(createTestData);

afterAll(async function() {
    await db.end();
    process.env.NODE_ENV = 'dev';
});

describe('GET /', function() {
    test('return a list of all companies', async function() {
        const res = await request(app).get('/companies');
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ "companies": [
            {code: "dell", name: "Dell computers"},
            {code: "ibm", name: "IBM"},
            {code: "jenny", name: "Jenny-O Turkey"}
        ]});
    });
});

describe('GET /:compCode', function() {
    test('get company info', async function() {
        const res = await request(app).get('/companies/dell');
        expect(res.body).toEqual({
            company: {
                code: "dell",
                name: "Dell computers", 
                description: "donchya wish",
                industryAffiliations: ['Information Technology', 'Quantum Computing']
            }
        });
    });

    test('return 404 code for company that doesn\'t exist', async function() {
        const res = await request(app).get('/companies/coca-cola');
        expect(res.status).toEqual(404);
    });
});

describe('POST /', function() {
    test('add a company', async function() {
        const res = await request(app).post('/companies').send({name: 'Toys R Us', description: 'toys for good girls and boys'});

        expect(res.status).toEqual(201);

        expect(res.body).toEqual({
            company: {
                code: 'Toys-R-Us',
                name: 'Toys R Us',
                description: 'toys for good girls and boys'
            }
        });
    });
});

describe('PUT /:code', function() {
    test('update company info', async function() {
        const res = await request(app).put('/companies/Toys-R-Us').send({ name: "No-Fun Toys emporium", description: "tears guaranteed" });

        expect(res.body).toEqual({
            company: {
                code: 'Toys-R-Us',
                name: 'No-Fun Toys emporium',
                description: 'tears guaranteed'
            }
        });
    });

    test('should return 404', async function() {
        const res = await request(app).put('/companies/app').send({});
        expect(res.status).toEqual(404);
    });
});

describe('DELETE /:code', function() {
    test('delete company', async function() {
        const res = await request(app).delete('/companies/ibm');

        expect(res.body).toEqual({status: 'deleted'});
    });

    test('should return 404', async function() {
        const res = await request(app).delete('/companies/ibm');

        expect(res.status).toEqual(404);
    });
});
