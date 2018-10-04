USE sakila;

SELECT * FROM actor;

# 1a
SELECT first_name, last_name FROM actor;
#1b
SELECT upper(concat(first_name, ' ', last_name)) AS ActorName FROM actor;

#2a
SELECT actor_id, first_name, last_name FROM actor WHERE first_name = "Joe";
#2b
SELECT * FROM actor WHERE last_name LIKE "%GEN%";
#2c
SELECT last_name, first_name FROM actor WHERE last_name LIKE "%LI%";
#2d
SELECT country_id, country FROM country WHERE country = "Afghanistan" OR country = "Bangladesh" OR country = "China";

#3a
ALTER TABLE actor
ADD COLUMN description BLOB(512);
#3b
ALTER TABLE actor
DROP COLUMN description;

#4a
SELECT last_name, count(last_name) FROM actor GROUP BY last_name;
#4b
SELECT last_name, count(last_name) FROM actor GROUP BY last_name HAVING count(last_name) > 1; 
#4c
UPDATE actor
SET first_name = "HARPO"
WHERE first_name = "GROUCHO" AND last_name = "WILLIAMS";
#4d
# Don't need to disable safe update if using first and last name in WHERE
#SET SQL_SAFE_UPDATES = 0;
UPDATE actor
SET first_name = "GROUCHO"
WHERE first_name = "HARPO" AND last_name = "WILLIAMS";
#SET SQL_SAFE_UPDATES = 1;

#5a
SHOW CREATE TABLE address;

#6a
#SELECT * FROM address;
#SELECT * FROM staff;
SELECT staff.first_name, staff.last_name, address.address
FROM staff
LEFT JOIN address ON
staff.address_id = address.address_id;
#6b
#SELECT * FROM payment;
SELECT p2.first_name, p2.last_name, p1.TotalSpent FROM
(SELECT staff_id, sum(amount) AS TotalSpent FROM payment WHERE date(payment_date) LIKE "2005-08%" GROUP BY staff_id) p1
INNER JOIN
(SELECT staff.first_name, staff.last_name, staff.staff_id FROM staff) p2
ON p1.staff_id = p2.staff_id;
#6c
SELECT * FROM film_actor;
#SELECT * FROM film;
SELECT f1.title, f2.ActorCount FROM 
(SELECT title, film_id FROM film) f1
INNER JOIN 
(SELECT film_id, count(film_id) AS ActorCount FROM film_actor GROUP BY film_actor.film_id) f2
ON f1.film_id = f2.film_id;
#6d
#SELECT * FROM inventory;
SELECT i1.title, i2.InventoryCount FROM
(SELECT film_id, title FROM film WHERE title = "Hunchback Impossible") i1
INNER JOIN
(SELECT film_id, count(film_id) AS InventoryCount FROM inventory GROUP BY film_id) i2
ON i1.film_id = i2.film_id;
#6e
#SELECT * FROM payment;
#SELECT * FROM customer;
SELECT p1.first_name, p1.last_name, p2.`Total Amount Paid` FROM
(SELECT first_name, last_name, customer_id FROM customer) p1
INNER JOIN
(SELECT customer_id, sum(amount) AS 'Total Amount Paid' FROM payment GROUP BY customer_id) p2
ON p1.customer_id = p2.customer_id ORDER BY p1.last_name;

#7a
#SELECT * FROM film;
#SELECT * FROM language;
SELECT f1.title AS FilmTitle_K_Q, l1.name AS Language FROM
(SELECT title, language_id FROM film WHERE title LIKE "K%" OR title LIKE "Q%") f1
INNER JOIN
(SELECT language_id, `name` FROM language WHERE name = "English") l1
ON f1.language_id = l1.language_id;
#7b
SELECT concat(first_name, ' ', last_name) AS 'Actors in Alone Trip'
FROM actor act
WHERE actor_id IN
(
SELECT actor_id
FROM film_actor fa
WHERE film_id IN
(
SELECT film_id
FROM film
WHERE title = 'Alone Trip'
)
);
#7c
#SELECT * FROM customer;
#SELECT * FROM address;
#SELECT * FROM country;
#SELECT * FROM city;
SELECT Cust.first_name, Cust.last_name, Cust.email 
FROM customer Cust
JOIN address A ON A.address_id = Cust.address_id
JOIN city Cty ON Cty.city_id = A.city_id
JOIN country Ctry ON Ctry.country_id = Cty.country_id
WHERE Ctry.country = "Canada";
#7d
#SELECT * FROM category;
#SELECT * FROM film_category;
#SELECT * FROM film;
SELECT Flm.title AS FamilyFilms
FROM film Flm
JOIN film_category FlmCat ON Flm.film_id = FlmCat.film_id
JOIN category Cat ON Cat.category_id = FlmCat.category_id
WHERE Cat.name = "Family";
#7e
#SELECT * FROM film;
#SELECT * FROM inventory;
#SELECT * FROM rental;
SELECT Flm.title AS MostRentedMovies
FROM film Flm
JOIN inventory I ON Flm.film_id = I.film_id
JOIN rental R ON R.inventory_id = I.inventory_id
GROUP BY R.inventory_id ORDER BY count(R.inventory_id) DESC;
#7f
#SELECT * FROM store;
#SELECT * FROM staff;
#SELECT * FROM payment;
SELECT Str.store_id, sum(P.amount) AS 'Sales($)'
FROM store Str
JOIN staff Stf ON Str.store_id = Stf.store_id
JOIN payment P ON P.staff_id = Stf.staff_id
GROUP BY P.staff_id ORDER BY Str.store_id;
#7g
#SELECT * FROM store;
#SELECT * FROM address;
#SELECT * FROM city;
#SELECT * FROM country;
SELECT S.store_id, Cty.city, Ctry.country
FROM store S
JOIN address A ON S.address_id = A.address_id
JOIN city Cty ON A.city_id = Cty.city_id
JOIN country Ctry ON Cty.country_id = Ctry.country_id;
#7h
#SELECT * FROM category;
#SELECT * FROM film_category;
#SELECT * FROM inventory;
#SELECT * FROM rental;
#SELECT * FROM payment;
SELECT C.name AS TopGenre, sum(P.amount) AS GrossRevenue
FROM category C
JOIN film_category FC ON FC.category_id = C.category_id
JOIN inventory I ON I.film_id = FC.film_id
JOIN rental R ON R.inventory_id = I.inventory_id
JOIN payment P ON P.rental_id = R.rental_id
GROUP BY C.name ORDER BY GrossRevenue DESC LIMIT 5;

#8a
CREATE VIEW top_five_genre AS
SELECT C.name AS TopGenre, sum(P.amount) AS GrossRevenue
FROM category C
JOIN film_category FC ON FC.category_id = C.category_id
JOIN inventory I ON I.film_id = FC.film_id
JOIN rental R ON R.inventory_id = I.inventory_id
JOIN payment P ON P.rental_id = R.rental_id
GROUP BY C.name ORDER BY GrossRevenue DESC LIMIT 5;
#8b
SELECT * FROM top_five_genre;
#8c
DROP VIEW top_five_genre;