const express = require('express');

// get the client
const mysql = require('mysql2/promise');

// create the pool of the connections to the database
const pool = mysql.createPool(
	{	host : 'localhost',
		database : 'phone_book',
		user : 'root',
		password : '2323'
	}
);

const app = express();
const port = 3000;

app.get('/', async function(req, res) {
	const data = await pool.query('SELECT * FROM abonent');
	const abonents = data[0];
	res.send(`<!DOCTYPE html>
		<html>
			<body>
				<h1>Телефонная книга</h1>
				<span>Список абонентов  </span><a href="/search">Поиск абонента</a>
				<hr>
				<ul>
					${abonents.map(item => `<li><a href="/abonent-phones/${item.id}">${item.name}</a></li>`).join('')}
				</ul>
			</body>
		</html>`);
});

app.get('/search', async function(req, res) {
	const nameSubstr = req.query.query_param;
	const data = await pool.query(`SELECT abonent.name, phone.number, phone.type 
				FROM abonent 
				JOIN phone ON phone.abonent_id = abonent.id
				WHERE abonent.name LIKE ?
	`, '%'+nameSubstr+'%');	
	const records = data[0];
	res.send(`<!DOCTYPE html>
		<html>
			<body>
				<h1>Телефонная книга</h1>
				<a href="/">Список абонентов</a><span>  Поиск абонента</span>
				<hr>
				<form method="get" action="/search/">
					<input type="text" name="query_param" placeholder="Поисковый запрос" value="${nameSubstr ? nameSubstr : ''}">
					<button type="submit">Применить</button>
				</form>
				Найдено: ${records.length}
				<ul>
					${records.map(item => `<li>${item.name} ${item.number} ${item.type}</li>`).join('')}
				</ul>
			</body>
		</html>`); 
});

app.get('/abonent-phones/:abonent_id', async function(req, res) {
	const { abonent_id:abonentId } = req.params; // {} деструктуризация
	const phonesData = await pool.query(`SELECT * FROM phone WHERE abonent_id = ?`, abonentId);
	const [phones] = phonesData; // [] деструктуризация, phones - массив обьектов-картелей
	const abonentData = await pool.query(`SELECT * FROM abonent WHERE id = ?`, abonentId);
	const [[abonent]] = abonentData; // [] деструктуризация, [abonent] - массив из одного объекта-картеля, 
									// abonent - один обьект-картель
	res.send(`<!DOCTYPE html>
		<html>
			<body>
				<h1>Телефонные номера абонента ${abonent.name}</h1>
				<a href="/">Cписок абонентов</a>
				<hr>
				<ul>
					${phones.map(item => `<li>${item.number} ${item.type}</li>`).join('')}
				</ul>
			</body>
		</html>`);
});

app.get('/a', function(req, res) {
	res.send('success /a !!');
}); 

app.listen(port, function() {
	console.log(`server listening on port ${port} started!`);
});