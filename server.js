const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
app.use(express.json());
const filePath = path.join(__dirname, 'products.json');
function readProducts() {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify([]));
    }
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data || '[]');
  } catch (err) {
    console.error('Error reading file:', err);
    return [];
  }
}
function writeProducts(products) {
  fs.writeFileSync(filePath, JSON.stringify(products, null, 2));
}
app.get('/products', (req, res) => {
  const products = readProducts();
  res.json(products);
});
app.get('/products/instock', (req, res) => {
  const products = readProducts().filter(p => p.inStock);
  res.json(products);
});
app.post('/products', (req, res) => {
  const { name, price, inStock } = req.body;

  if (!name || typeof price !== 'number' || typeof inStock !== 'boolean') {
    return res.status(400).json({ error: 'Invalid product data' });
  }

  const products = readProducts();
  const newId = products.length > 0 ? products[products.length - 1].id + 1 : 1;
  const newProduct = { id: newId, name, price, inStock };

  products.push(newProduct);
  writeProducts(products);

  res.status(201).json(newProduct);
});
app.put('/products/:id', (req, res) => {
  const { id } = req.params;
  const { name, price, inStock } = req.body;
  const products = readProducts();

  const index = products.findIndex(p => p.id === parseInt(id));
  if (index === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }
  if (name !== undefined) products[index].name = name;
  if (price !== undefined) products[index].price = price;
  if (inStock !== undefined) products[index].inStock = inStock;

  writeProducts(products);
  res.json(products[index]);
});
app.delete('/products/:id', (req, res) => {
  const { id } = req.params;
  let products = readProducts();

  const index = products.findIndex(p => p.id === parseInt(id));
  if (index === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }

  products = products.filter(p => p.id !== parseInt(id));
  writeProducts(products);
  res.json({ message: 'Product deleted successfully' });
});
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
