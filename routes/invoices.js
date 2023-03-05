const db = require('../db');
const express = require("express");
const invoiceRouter = new express.Router();

const ExpressError = require("../expressError");

invoiceRouter.get("/", async function(req, res, next) {
    try {
        const results = await db.query('SELECT * FROM invoices');
        return res.status(201).json({invoices: results.rows});
    
    } catch (err) {
        return next(err);
    }
});

invoiceRouter.get('/:id', async function(req, res, next) {
    try {
        const id = req.params.id;
        const results = await db.query('SELECT * FROM invoices WHERE id=$1', [id])
        if (results.rows.length === 0) {
            throw new ExpressError(`can"t find invoice with that id: ${id}`);
        }
        const comp_code = results.rows[0].comp_code;
        const moreResults = await db.query('SELECT * FROM companies WHERE code=$1', [comp_code]);
        return res.status(201).json({invoice: results.rows[0], company: moreResults.rows[0]});
    } catch (err) {
        return next(err);
    }
})

invoiceRouter.post('/', async function(req, res, next) {
    try {
        const { comp_code, amt } = req.body;
        const results = await db.query('INSERT INTO invoices (comp_code, amt) VALUES ($1, $2) RETURNING id, comp_code, amt, paid, add_date, paid_date',
            [comp_code, amt]);
        return res.status(201).json({invoice: results.rows[0]});
    } catch (err) {
        return next(err);
    }
});

invoiceRouter.put('/:id', async function(req, res, next) {
    try {
        const id = req.params.id;
        const amt = req.body.amt;
        const results = await db.query('UPDATE invoices SET amt=$1 WHERE id=$2 RETURNING id, comp_code, amt, paid, add_date, paid_date', 
            [amt, id]);
        if (results.rows.length === 0) {
            throw new ExpressError(`unable to locate an invoice by that id!: ${id}`);
        }
        return res.status(201).json({invoice: results.rows[0]});
    } catch (err) {
        return next(err);
    }
});

invoiceRouter.delete('/:id', async function(req, res, next) {
    try {
        const id = req.params.id;
        const results = await db.query('DELETE FROM invoices WHERE id=$1 RETURNING id', [id]);
        if (results.rows.length === 0) {
            throw new ExpressError(`that company code - ${id} - cannot be found`, 404);
        }

        return res.status(201).json({status: "deleted"});
    } catch (err) {
        return next(err);
    }
});

invoiceRouter.get('/companies/:code', async function(req, res, next) {
    try {
        const code = req.params.code;
        const compResults = await db.query('SELECT * FROM companies WHERE code=$1', [code]);
        if (compResults.rows.length === 0) {
            throw new ExpressError(`that company code - ${code} - cannot be found`, 404);
        }
        const invoiceResults = await db.query('SELECT * FROM invoices WHERE comp_code=$1', [compResults.rows[0].code]);
        return res.status(201).json({company: compResults.rows[0], invoices: invoiceResults.rows});

    } catch (err) {
        return next(err);
    }
});

module.exports = invoiceRouter;