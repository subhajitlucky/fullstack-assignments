export const foodImages = [
  '/images/pizza.jpg',
  '/images/sushi.jpg',
  '/images/burger.jpg',
  '/images/pasta.jpg',
  '/images/shake.jpg',
  '/images/chicken.jpg',
  '/images/salad.jpg',
  '/images/dessert.jpg',
];

const defaultLogoFragment = '1f4e8121-bda8-4c3b-b46f-a21a9389f276';

export function restaurantImage(restaurant, index = 0) {
  const logo = restaurant?.logo;

  if (logo && !logo.includes(defaultLogoFragment)) {
    return logo;
  }

  return foodImages[index % foodImages.length];
}

export function formatAddress(restaurant) {
  const address = restaurant?.address_complete;

  if (!address || address === 'null') {
    return 'Address unavailable';
  }

  return address;
}

export function priceFor(index) {
  return 149 + (index % 4) * 50;
}
