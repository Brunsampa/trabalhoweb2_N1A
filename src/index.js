const express = require('express');
const bodyParser = require('body-parser');
const pdf = require('pdfkit');
const { PassThrough } = require('stream');
const app = express();
const port = 3333;

let laboratorios = [
    { nome: 'Laboratório 1', capacidade: 50, descricao: 'Laboratório de Biologia' },
    { nome: 'Laboratório 2', capacidade: 30, descricao: 'Laboratório de Química' },
    { nome: 'Laboratório 3', capacidade: 40, descricao: 'Laboratório de Física' },
    { nome: 'Laboratório 4', capacidade: 60, descricao: 'Laboratório de Informática' },
    { nome: 'Laboratório 5', capacidade: 35, descricao: 'Laboratório de Matemática' },
    { nome: 'Laboratório 6', capacidade: 25, descricao: 'Laboratório de Artes' }
];

const horarioMiddleware = (req, res, next) => {
    const horaAtual = new Date().getHours();
    if (horaAtual < 8 || horaAtual >= 17) {
        return res.status(403).send('Acesso não permitido fora do horário de expediente (08:00 às 17:00)');
    }
    next();
};

const gerarRelatorioPDF = (laboratorios) => {
    const doc = new pdf();
    const stream = new PassThrough();
    doc.pipe(stream);
    doc.fontSize(14).text('Relatório de Laboratórios\n\n', { align: 'center' });

    laboratorios.forEach(laboratorio => {
        doc.fontSize(12).text(`Nome: ${laboratorio.nome}, Capacidade: ${laboratorio.capacidade}, Descrição: ${laboratorio.descricao}\n\n`);
    });

    doc.end();
    return stream;
};

app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.json({
        "Para ver os laboratorios Existentes, adcione": "/laboratorio/todos",
        "para fazer o donwload do relatorio, adcione": "/laboratorio/relatorio",
        "Para cadastrar um novo laboratorio, adcione": "/laboratorio/todos/novo"
    });
});

app.get('/laboratorio/todos', (req, res) => {
    res.json(laboratorios);
});

app.post('/laboratorio/novo', (req, res) => {
    const novoLaboratorio = req.body;
    laboratorios.push(novoLaboratorio);
    res.status(201).send('Laboratório cadastrado com sucesso!');
});

app.use(horarioMiddleware);

app.get('/laboratorio/relatorio', (req, res) => {
    const stream = gerarRelatorioPDF(laboratorios);
    res.setHeader('Content-Disposition', 'attachment; filename="relatorio_laboratorios.pdf"');
    res.setHeader('Content-Type', 'application/pdf');
    stream.pipe(res);
});

app.listen(port, () => {
    console.log(`App runninig on port ${port}`);
});
