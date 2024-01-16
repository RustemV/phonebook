const express = require('express');
// get the client
const mysql = require('mysql2/promise');
//const bodyParser = require('body-parser');

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

//app.use(bodyParser.urlencoded());
app.use(express.urlencoded({ extended: false }));

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

app.get('/abonent-phones/:abonent_id', async function(req, res) {
	const { abonent_id:abonentId } = req.params; // {} деструктуризация объекта, получаем abonentId - значение поля abonent_id
	const [phones] = await pool.query(`SELECT * FROM phone WHERE abonent_id = ?`, abonentId); // [] деструктуризация массива, phones - массив обьектов-кортежей
	const [[abonent]] = await pool.query(`SELECT * FROM abonent WHERE id = ?`, abonentId); // [] деструктуризация массива объектов, 
	res.send(`<!DOCTYPE html>
		<html>
			<body>
				<h1>Телефонные номера абонента ${abonent.name}</h1>
				<a href="/">Cписок абонентов</a> 
				<hr>
				<ul>
					${phones.map(item => `<li>${item.number} ${item.type} <a href="/phone-delete/${item.id}">удалить</a> </li>`).join('')}
				</ul>
				<form method="post" action="/phone-add/${abonentId}">
					<input type="text" name="number" placeholder="Номер">
					<input type="text" name="type" placeholder="Тип">
					<input type="submit" value="Добавить">
				</form>
			</body>
		</html>`);
});

app.post('/phone-add/:abonent_id', async function(req, res) {
	const { abonent_id:abonentId } = req.params; // {} деструктуризация объекта, получаем abonentId - значение поля abonent_id
	const {number, type} = req.body;
	console.log('adding number:  ', number);
	await pool.query('INSERT into PHONE SET ?', {abonent_id: abonentId, number: number, type: type});
	res.redirect(`/abonent-phones/${abonentId}`);
});

app.get('/phone-delete/:phone_id', async function(req, res) {
	const phoneId = req.params.phone_id; 
	const [[phone]] = await pool.query(`SELECT * FROM phone WHERE id=?`, phoneId); //нужно только, чтобы сохранить abonent_id
	console.log('deleting...', phone);
	await pool.query(`DELETE FROM phone WHERE id=?`, phoneId);
	res.redirect(`/abonent-phones/${phone.abonent_id}`);
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

app.get('/a', function(req, res) {
	res.send('success /a !!');
}); 

app.listen(port, function() {
	console.log(`server listening on port ${port} started!`);
});