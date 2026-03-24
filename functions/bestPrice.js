export function bestPrice(products) {
  if (!Array.isArray(products)) return [];

  const parsePrice = (price) => {
    if (!price) return Infinity;

    const digitsOnly = price.replace(/[^\d]/g, "").trim();

    // Si no hay dígitos después de filtrar, retorna Infinity
    if (!digitsOnly) return Infinity;

    return Number(digitsOnly);
  };

  // Filtramos productos con precio válido
  const validProducts = products.filter(
    (product) => parsePrice(product.precio) !== Infinity,
  );

  validProducts.sort((a, b) => {
    return parsePrice(a.precio) - parsePrice(b.precio);
  });

  return validProducts;
}
