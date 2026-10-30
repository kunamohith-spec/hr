import jsonServer from 'json-server';
import fs from 'fs';
import path from 'path';

const server = jsonServer.create();

// Read db.json
const dbPath = path.join(process.cwd(), 'db.json');
const dbData = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
const router = jsonServer.router(dbData);
const middlewares = jsonServer.defaults();

// Use rewrite to strip /api prefix so /api/employees routes to /employees in json-server router
server.use(middlewares);
server.use(jsonServer.rewriter({
  '/api/*': '/$1'
}));
server.use(router);

export default (req, res) => {
  return server(req, res);
};
