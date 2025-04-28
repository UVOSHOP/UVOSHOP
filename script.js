* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: Arial, sans-serif;
  background-color: #f4f4f9;
}

header {
  background-color: #1a1a1a;
  color: #fff;
  display: flex;
  justify-content: space-between;
  padding: 20px;
  align-items: center;
}

header .logo img {
  width: 150px;
  height: auto;
}

header input, header select {
  padding: 10px;
  border: none;
  border-radius: 5px;
}

header select {
  margin-left: 10px;
}

.banners img {
  width: 100%;
  height: 300px;
  object-fit: cover;
}

main {
  padding: 20px;
}

.game-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}

.game-card {
  background-color: #fff;
  border-radius: 10px;
  padding: 15px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.game-card img {
  width: 100%;
  max-width: 150px;
  margin-bottom: 10px;
}

.game-card h3 {
  font-size: 1.1rem;
  margin-bottom: 10px;
}

footer {
  background-color: #1a1a1a;
  color: #fff;
  text-align: center;
  padding: 10px;
}

footer a {
  color: #fff;
  text-decoration: none;
  margin: 0 5px;
}
