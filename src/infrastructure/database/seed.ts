import { db } from './db'
import { format, subDays, addDays } from 'date-fns'

export async function seedDatabase() {
  const count = await db.pacientes.count()
  if (count > 0) return

  const now = format(new Date(), "yyyy-MM-dd'T'HH:mm:ss")
  const hoje = format(new Date(), 'yyyy-MM-dd')

  const p1 = await db.pacientes.add({
    nome: 'Ana Clara Souza',
    cpf: '123.456.789-00',
    dataNascimento: '1990-03-15',
    telefone: '(11) 98765-4321',
    email: 'ana.clara@email.com',
    endereco: 'Rua das Flores, 123',
    observacoes: 'Paciente com histórico de ansiedade',
    ativo: true,
    createdAt: now,
    updatedAt: now,
  })
  const p2 = await db.pacientes.add({
    nome: 'Bruno Ferreira Lima',
    cpf: '234.567.890-11',
    dataNascimento: '1985-07-22',
    telefone: '(11) 91234-5678',
    email: 'bruno.lima@email.com',
    endereco: 'Av. Paulista, 456',
    observacoes: '',
    ativo: true,
    createdAt: now,
    updatedAt: now,
  })
  const p3 = await db.pacientes.add({
    nome: 'Carla Mendes Costa',
    cpf: '345.678.901-22',
    dataNascimento: '1992-11-08',
    telefone: '(11) 99876-5432',
    email: 'carla.costa@email.com',
    endereco: 'Rua da Paz, 789',
    observacoes: 'Encaminhada por psiquiatra',
    ativo: true,
    createdAt: now,
    updatedAt: now,
  })
  const p4 = await db.pacientes.add({
    nome: 'Diego Alves Santos',
    cpf: '456.789.012-33',
    dataNascimento: '1988-05-30',
    telefone: '(11) 94567-8901',
    email: 'diego.santos@email.com',
    endereco: 'Rua Verde, 321',
    observacoes: '',
    ativo: true,
    createdAt: now,
    updatedAt: now,
  })
  const p5 = await db.pacientes.add({
    nome: 'Elena Rodrigues',
    cpf: '567.890.123-44',
    dataNascimento: '1995-09-14',
    telefone: '(11) 92345-6789',
    email: 'elena.rodrigues@email.com',
    endereco: 'Alameda Santos, 654',
    observacoes: 'Depressão leve',
    ativo: true,
    createdAt: now,
    updatedAt: now,
  })
  const p6 = await db.pacientes.add({
    nome: 'Fernanda Oliveira',
    cpf: '678.901.234-55',
    dataNascimento: '1980-12-01',
    telefone: '(11) 97654-3210',
    email: 'fernanda.oli@email.com',
    endereco: 'Rua das Orquídeas, 147',
    observacoes: '',
    ativo: true,
    createdAt: now,
    updatedAt: now,
  })

  await db.consultas.bulkAdd([
    {
      pacienteId: p1,
      pacienteNome: 'Ana Clara Souza',
      titulo: 'Sessão de Acompanhamento',
      data: hoje,
      horaInicio: '09:00',
      horaFim: '10:00',
      status: 'confirmada',
      tipo: 'acompanhamento',
      valor: 200,
      createdAt: now,
      updatedAt: now,
    },
    {
      pacienteId: p2,
      pacienteNome: 'Bruno Ferreira Lima',
      titulo: 'Primeira Consulta',
      data: hoje,
      horaInicio: '10:30',
      horaFim: '11:30',
      status: 'agendada',
      tipo: 'avaliacao',
      valor: 250,
      createdAt: now,
      updatedAt: now,
    },
    {
      pacienteId: p3,
      pacienteNome: 'Carla Mendes Costa',
      titulo: 'Sessão Terapêutica',
      data: hoje,
      horaInicio: '14:00',
      horaFim: '15:00',
      status: 'confirmada',
      tipo: 'terapia',
      valor: 200,
      createdAt: now,
      updatedAt: now,
    },
    {
      pacienteId: p4,
      pacienteNome: 'Diego Alves Santos',
      titulo: 'Sessão de Acompanhamento',
      data: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
      horaInicio: '09:00',
      horaFim: '10:00',
      status: 'agendada',
      tipo: 'acompanhamento',
      valor: 200,
      createdAt: now,
      updatedAt: now,
    },
    {
      pacienteId: p5,
      pacienteNome: 'Elena Rodrigues',
      titulo: 'Avaliação Psicológica',
      data: format(addDays(new Date(), 2), 'yyyy-MM-dd'),
      horaInicio: '11:00',
      horaFim: '12:00',
      status: 'agendada',
      tipo: 'avaliacao',
      valor: 300,
      createdAt: now,
      updatedAt: now,
    },
    {
      pacienteId: p1,
      pacienteNome: 'Ana Clara Souza',
      titulo: 'Sessão Terapêutica',
      data: format(subDays(new Date(), 7), 'yyyy-MM-dd'),
      horaInicio: '09:00',
      horaFim: '10:00',
      status: 'realizada',
      tipo: 'terapia',
      valor: 200,
      createdAt: now,
      updatedAt: now,
    },
    {
      pacienteId: p2,
      pacienteNome: 'Bruno Ferreira Lima',
      titulo: 'Sessão Terapêutica',
      data: format(subDays(new Date(), 7), 'yyyy-MM-dd'),
      horaInicio: '10:30',
      horaFim: '11:30',
      status: 'realizada',
      tipo: 'terapia',
      valor: 200,
      createdAt: now,
      updatedAt: now,
    },
    {
      pacienteId: p6,
      pacienteNome: 'Fernanda Oliveira',
      titulo: 'Sessão de Acompanhamento',
      data: format(subDays(new Date(), 14), 'yyyy-MM-dd'),
      horaInicio: '15:00',
      horaFim: '16:00',
      status: 'realizada',
      tipo: 'acompanhamento',
      valor: 200,
      createdAt: now,
      updatedAt: now,
    },
  ])

  await db.acolhimentos.bulkAdd([
    {
      pacienteId: p1,
      pacienteNome: 'Ana Clara Souza',
      queixaPrincipal: 'Ansiedade generalizada e dificuldade em dormir',
      historico:
        'Paciente relata sintomas há 2 anos após mudança de emprego. Sem histórico familiar de transtornos mentais.',
      encaminhamento: 'Médico clínico',
      observacoes: 'Paciente motivada para o tratamento',
      createdAt: format(subDays(new Date(), 30), "yyyy-MM-dd'T'HH:mm:ss"),
      updatedAt: now,
    },
    {
      pacienteId: p3,
      pacienteNome: 'Carla Mendes Costa',
      queixaPrincipal: 'Depressão pós-parto e dificuldade de vínculo com o filho',
      historico: 'Mãe de primeira viagem, 32 anos. Histórico familiar materno de depressão.',
      encaminhamento: 'Psiquiatra Dr. Roberto Almeida',
      observacoes: 'Em uso de antidepressivos desde há 3 meses',
      createdAt: format(subDays(new Date(), 15), "yyyy-MM-dd'T'HH:mm:ss"),
      updatedAt: now,
    },
  ])

  await db.prontuarios.bulkAdd([
    {
      pacienteId: p1,
      pacienteNome: 'Ana Clara Souza',
      titulo: 'Sessão 1 - Anamnese inicial',
      conteudo:
        'Paciente compareceu pontualmente. Relatou episódios de ansiedade principalmente no trabalho. Técnicas de respiração apresentadas.',
      sessaoNumero: 1,
      createdAt: format(subDays(new Date(), 28), "yyyy-MM-dd'T'HH:mm:ss"),
      updatedAt: now,
    },
    {
      pacienteId: p1,
      pacienteNome: 'Ana Clara Souza',
      titulo: 'Sessão 2 - Técnicas de relaxamento',
      conteudo:
        'Paciente praticou técnicas de respiração diafragmática durante a semana. Melhora relatada nos episódios noturnos. Trabalhamos reestruturação cognitiva.',
      sessaoNumero: 2,
      createdAt: format(subDays(new Date(), 21), "yyyy-MM-dd'T'HH:mm:ss"),
      updatedAt: now,
    },
    {
      pacienteId: p1,
      pacienteNome: 'Ana Clara Souza',
      titulo: 'Sessão 3 - Progresso',
      conteudo:
        'Paciente demonstra evolução significativa. Identificados gatilhos de ansiedade relacionados a reuniões de trabalho. Plano de exposição gradual elaborado.',
      sessaoNumero: 3,
      createdAt: format(subDays(new Date(), 14), "yyyy-MM-dd'T'HH:mm:ss"),
      updatedAt: now,
    },
    {
      pacienteId: p1,
      pacienteNome: 'Ana Clara Souza',
      titulo: 'Sessão 4 - Exposição gradual',
      conteudo:
        'Paciente conseguiu conduzir reunião pequena sem episódio de ansiedade. Celebramos o progresso. Continuamos com os exercícios de mindfulness.',
      sessaoNumero: 4,
      createdAt: format(subDays(new Date(), 7), "yyyy-MM-dd'T'HH:mm:ss"),
      updatedAt: now,
    },
  ])

  const meses = ['2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06']
  const receitas: any[] = []
  const despesas: any[] = []

  meses.forEach((mes, i) => {
    const sessoes = [8, 10, 9, 12, 11, 6]
    const qtd = sessoes[i] ?? 0
    for (let j = 0; j < qtd; j++) {
      receitas.push({
        tipo: 'receita',
        descricao: 'Sessão de psicoterapia',
        valor: 200,
        data: `${mes}-${String(j + 1).padStart(2, '0')}`,
        status: i < 5 ? 'pago' : 'pendente',
        categoria: 'Consultas',
        createdAt: now,
        updatedAt: now,
      })
    }
    despesas.push({
      tipo: 'despesa',
      descricao: 'Aluguel consultório',
      valor: 1500,
      data: `${mes}-05`,
      status: i < 5 ? 'pago' : 'pendente',
      categoria: 'Infraestrutura',
      createdAt: now,
      updatedAt: now,
    })
    despesas.push({
      tipo: 'despesa',
      descricao: 'Material de escritório',
      valor: 150,
      data: `${mes}-10`,
      status: 'pago',
      categoria: 'Materiais',
      createdAt: now,
      updatedAt: now,
    })
  })

  await db.financeiro.bulkAdd([...receitas, ...despesas])

  await db.filaEspera.bulkAdd([
    {
      pacienteId: p1,
      pacienteNome: 'Ana Clara Souza',
      status: 'aguardando',
      horaChegada: '08:45',
      prioridade: 2,
      createdAt: now,
      updatedAt: now,
    },
    {
      pacienteId: p2,
      pacienteNome: 'Bruno Ferreira Lima',
      status: 'em_atendimento',
      horaChegada: '09:10',
      horaInicio: '09:30',
      prioridade: 3,
      createdAt: now,
      updatedAt: now,
    },
    {
      pacienteId: p3,
      pacienteNome: 'Carla Mendes Costa',
      status: 'aguardando',
      horaChegada: '10:00',
      prioridade: 3,
      createdAt: now,
      updatedAt: now,
    },
  ])
}
