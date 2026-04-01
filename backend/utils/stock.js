function run(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function onRun(err) {
      if (err) {
        reject(err);
        return;
      }

      resolve(this);
    });
  });
}

function get(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(row);
    });
  });
}

function all(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(rows);
    });
  });
}

async function getProductStock(db, productId) {
  return get(
    db,
    `SELECT id, name, stock_quantity, is_active
     FROM products
     WHERE id = ?`,
    [productId]
  );
}

async function validateProductStock(db, productId, quantity) {
  const product = await getProductStock(db, productId);

  if (!product || !product.is_active) {
    const error = new Error('Product not found');
    error.statusCode = 404;
    throw error;
  }

  const availableStock = Number(product.stock_quantity || 0);
  if (availableStock < quantity) {
    const error = new Error(`Only ${availableStock} left in stock`);
    error.statusCode = 400;
    throw error;
  }

  return product;
}

async function deductStockForItems(db, items) {
  await run(db, 'BEGIN IMMEDIATE TRANSACTION');

  try {
    for (const item of items) {
      const product = await get(
        db,
        `SELECT id, name, stock_quantity
         FROM products
         WHERE id = ?`,
        [item.product_id]
      );

      if (!product) {
        const error = new Error('Product not found');
        error.statusCode = 404;
        throw error;
      }

      const availableStock = Number(product.stock_quantity || 0);
      if (availableStock < item.quantity) {
        const error = new Error(`Only ${availableStock} left for ${product.name}`);
        error.statusCode = 400;
        throw error;
      }
    }

    for (const item of items) {
      await run(
        db,
        `UPDATE products
         SET stock_quantity = stock_quantity - ?
         WHERE id = ?`,
        [item.quantity, item.product_id]
      );
    }

    await run(db, 'COMMIT');
  } catch (error) {
    await run(db, 'ROLLBACK').catch(() => {});
    throw error;
  }
}

module.exports = {
  all,
  deductStockForItems,
  get,
  getProductStock,
  run,
  validateProductStock,
};
