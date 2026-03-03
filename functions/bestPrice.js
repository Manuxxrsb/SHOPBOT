export function bestPrice(products) {
  if (!Array.isArray(products)) return [];

  const parsePrice = (price) => {
    if (!price) return Infinity;

    return Number(
      price
        .replace(/[^\d]/g, "") // elimina $, puntos, espacios
        .trim(),
    );
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
