-- Insert sample cars data
-- Run this after creating the cars table (run cars.sql first)
-- Note: pics_number is set based on the number of images in the component

INSERT INTO cars (
  brand, 
  model, 
  year, 
  price, 
  mileage, 
  fuel_type, 
  transmission, 
  color, 
  power, 
  displacement, 
  condition, 
  seats, 
  doors, 
  body_type, 
  consumption, 
  pics_number
) VALUES
-- Car 1: Audi A6 3.0 TDi quattro
(
  'Audi',
  'A6 3.0 TDi quattro',
  2005,
  12990.00,
  330000,
  'Gasóleo',
  'Automático',
  'Azul',
  224,
  2967,
  'Com pouco uso',
  4,
  5,
  'Hatchback',
  6.3,
  12
),
-- Car 2: BMW Série 1
(
  'BMW',
  'Série 1',
  2014,
  12990.00,
  195000,
  'Gasóleo',
  'Manual de 6 velocidades',
  'Branco',
  177,
  1995,
  'Com pouco uso',
  4,
  3,
  'Coupe',
  6.3,
  9
),
-- Car 3: Mini Clubman D
(
  'Mini',
  'Clubman D',
  2013,
  12990.00,
  190000,
  'Gasóleo',
  'Manual de 6 velocidades',
  'Azul escuro',
  110,
  1598,
  'Com pouco uso',
  4,
  5,
  'Utilitário',
  6.3,
  16
),
-- Car 4: Mini Cooper
(
  'Mini',
  'Cooper',
  2013,
  8640.00,
  50000,
  'Elétrico',
  'Manual de 6 velocidades',
  'Azul escuro',
  110,
  1598,
  'Com pouco uso',
  4,
  5,
  'Utilitário',
  6.3,
  13
),
-- Car 5: BMW Serie 1 (Gray)
(
  'BMW',
  'Serie 1',
  2013,
  12990.00,
  190000,
  'Gasóleo',
  'Manual de 6 velocidades',
  'Azul escuro',
  110,
  1598,
  'Com pouco uso',
  4,
  5,
  'Utilitário',
  6.3,
  14
);
