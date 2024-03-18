const express = require('express')
const bodyParser = require('body-parser')
const fs = require('fs');
const pdf = require('pdfkit');
const app = express()
const port = 3333



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


const gerarRelatorioPDF = (req, res, next) => {
    const doc = new pdf();
    doc.pipe(fs.createWriteStream('relatorio_laboratorios.pdf'));
    doc.fontSize(14).text('Relatório de Laboratórios\n\n', { align: 'center' });

    laboratorios.forEach(laboratorio => {
        doc.fontSize(12).text(`Nome: ${laboratorio.nome}, Capacidade: ${laboratorio.capacidade}, Descrição: ${laboratorio.descricao}\n\n`);
    });

    doc.end();
    next();
};

app.use(bodyParser.json());


app.get('/laboratorio/todos', (req, res) => {
    res.json(laboratorios);
});


app.post('/laboratorio/novo', (req, res) => {
    const novoLaboratorio = req.body;
    laboratorios.push(novoLaboratorio);
    res.status(201).send('Laboratório cadastrado com sucesso!');
});


app.use(horarioMiddleware);


app.get('/laboratorio/relatorio', gerarRelatorioPDF, (req, res) => {
    res.download('relatorio_laboratorios.pdf', 'relatorio_laboratorios.pdf', (err) => {
        if (err) {
            res.status(500).send('Erro ao baixar o arquivo PDF');
        } else {
            fs.unlinkSync('relatorio_laboratorios.pdf'); 
        }
    });
});


app.listen(port, () => {
  console.log(`App runninig on port ${port}`)
})