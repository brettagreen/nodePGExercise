const db = require('../db');
const express = require("express");
const compRouter = new express.Router();

const ExpressError = require("../expressError");

compRouter.get("/", async function(req, res, next) {
    try {
        const results = await db.query('SELECT code, name FROM companies');
        return res.json({companies: results.rows});
    
    } catch (err) {
        return next(err);
    }
});

compRouter.get('/:code', async function(req, res, next) {
    try {
        const { code } = req.params;
        const results = await db.query(`SELECT * FROM companies WHERE code=$1`, [code]);
        if (results.rows.length === 0) {
            throw new ExpressError(`that company code - ${code} - cannot be found`, 404);
        }
        return res.json({company: results.rows[0]})
    } catch(err) {
        return next(err);
    }
});

compRouter.post('/', async function(req, res, next) {
    try {
        const { code, name, description } = req.body;
        const results = await db.query('INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING code, name, description',
     [code, name, description]);
     return res.status(201).json({company: results.rows[0]});
    } catch (err) {
        return next(err);
    }
});

compRouter.put('/:code', async function(req, res, next) {
    try {
        const code = req.params.code;
        const { name, description } = req.body;
        const results = await db.query('UPDATE companies SET name=$1, description=$2 WHERE code=$3 RETURNING code, name, description',
            [name, description, code]);

        if (results.rows.length === 0) {
            throw new ExpressError(`that company code - ${code} - cannot be found`, 404);
        }

        return res.json({company: results.rows[0]})
    } catch (err) {
        return next(err);
    }
});

compRouter.delete('/:code', async function(req, res, next) {
    try {
        const code = req.params.code;
        const results = await db.query('DELETE FROM companies WHERE code=$1', [code]);
        
        if (results.rows.length === 0) {
            throw new ExpressError(`that company code - ${code} - cannot be found`, 404);
        }

        return res.json({status: "deleted"});
    } catch (err) {
        return next(err);
    }
});

module.exports = compRouter;
