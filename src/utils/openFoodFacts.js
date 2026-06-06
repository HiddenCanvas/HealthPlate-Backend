const BASE_URL = 'https://world.openfoodfacts.org';

async function getByBarcode(barcode) {
  const res = await fetch(`${BASE_URL}/api/v0/product/${barcode}.json`);
  const json = await res.json();
  if (json.status !== 1) return null;
  return mapProduct(json.product);
}

async function searchByName(query) {
  const params = new URLSearchParams({ search_terms: query, json: 1, page_size: 20 });
  const res = await fetch(`${BASE_URL}/cgi/search.pl?${params}`);
  const json = await res.json();
  return (json.products || []).map(mapProduct);
}

function mapProduct(p) {
  const n = p.nutriments || {};
  return {
    barcode_code: p.code || null,
    product_name: p.product_name || p.product_name_en || 'Unknown',
    brand_name: p.brands || null,
    serving_size_g: parseFloat(p.serving_size) || 100,
    calories_kcal: parseFloat(n['energy-kcal_100g']) || 0,
    sugar_g: parseFloat(n['sugars_100g']) || 0,
    carbohydrate_g: parseFloat(n['carbohydrates_100g']) || 0,
    protein_g: parseFloat(n['proteins_100g']) || 0,
    fat_g: parseFloat(n['fat_100g']) || 0
  };
}

module.exports = { getByBarcode, searchByName };
