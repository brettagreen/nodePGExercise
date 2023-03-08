const db = require('../db');
const express = require("express");
const router = new express.Router();

const ExpressError = require("../expressError");

router.get("/", async function(req, res, next) {
    try {
        const results = await db.query('SELECT * FROM invoices');
        return res.json({invoices: results.rows});
    
    } catch (err) {
        return next(err);
    }
});

router.get('/:id', async function(req, res, next) {
    try {
        const id = req.params.id;
        const results = await db.query('SELECT * FROM invoices WHERE id=$1', [id])
        if (results.rows.length === 0) {
            throw new ExpressError(`can"t find invoice with that id: ${id}`, 404);
        } else {
            const comp_code = results.rows[0].comp_code;
            const moreResults = await db.query('SELECT * FROM companies WHERE code=$1', [comp_code]);
            return res.json({invoice: results.rows[0], company: moreResults.rows[0]});
        }

    } catch (err) {
        return next(err);
    }
})

router.post('/', async function(req, res, next) {
    try {
        const { comp_code, amt } = req.body;
        const results = await db.query('INSERT INTO invoices (comp_code, amt) VALUES ($1, $2) RETURNING id, comp_code, amt, paid, add_date, paid_date',
            [comp_code, amt]);
        return res.status(201).json({invoice: results.rows[0]});
    } catch (err) {
        return next(err);
    }
});

router.put('/:id', async function(req, res, next) {
    try {
        const id = req.params.id;
        const { amt, paid } = req.body;
        let paidDate;

        let results = await db.query('SELECT paid FROM invoices WHERE id=$1', [id]);

        if (results.rows.length === 0) {
            throw new ExpressError(`unable to locate an invoice by that id!: ${id}`, 404);
        }
        
        let currPaid = results.rows[0].paid;
        
        if (paid) {
            if (!currPaid) {
                paidDate = new Date().toISOString().slice(0, 10);
            }
        } else {
            if (currPaid) {
                paidDate = null;
            }
        }

        if (paidDate || paidDate === null) {
            results = await db.query('UPDATE invoices SET amt=$1, paid=$2, paid_date=$3 WHERE id=$4 RETURNING id, comp_code, amt, paid, add_date, paid_date', 
                [amt, paid, paidDate, id]);
        } else {
            results = await db.query('UPDATE invoices SET amt=$1, paid=$2 WHERE id=$3 RETURNING id, comp_code, amt, paid, add_date, paid_date', 
                [amt, paid, id]);
        }

        return res.json({invoice: results.rows[0]});
    } catch (err) {
        return next(err);
    }
});

router.delete('/:id', async function(req, res, next) {
    try {
        const id = req.params.id;
        const results = await db.query('DELETE FROM invoices WHERE id=$1 RETURNING id', [id]);

        if (results.rows.length === 0) {
            throw new ExpressError(`that company code - ${id} - cannot be found`, 404);
        }

        return res.json({status: "deleted"});
    } catch (err) {
        return next(err);
    }
});

router.get('/companies/:code', async function(req, res, next) {
    try {
        const code = req.params.code;
        const compResults = await db.query('SELECT * FROM companies WHERE code=$1', [code]);
        if (compResults.rows.length === 0) {
            throw new ExpressError(`that company code - ${code} - cannot be found`, 404);
        }
        const invoiceResults = await db.query('SELECT * FROM invoices WHERE comp_code=$1', [compResults.rows[0].code]);
        return res.json({company: compResults.rows[0], invoices: invoiceResults.rows});

    } catch (err) {
        return next(err);
    }
});

module.exports = router;