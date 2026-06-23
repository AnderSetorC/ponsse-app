export type Funcionario = {
  id: string;
  nome: string;
  setor: string;
  telefone: string;
  foto?: string; // caminho em /fotos/xxx.jpg ou URL
  ativo: boolean; // se o admin marcou como ativo no dia
  visivel: boolean; // se aparece na página principal
  horarioInicio: string; // "08:00"
  horarioFim: string; // "17:00"
};

export type Config = {
  modalHabilitado: boolean; // se true, mostra o modal com setor+resumo
  mensagemPadrao: string; // mensagem usada quando o modal está desativado
};

export const CONFIG_PADRAO: Config = {
  modalHabilitado: false, // padrão: manda direto com mensagem simples
  mensagemPadrao: "Olá, vim pelo aplicativo de atendimento Ponsse!",
};

export const STORAGE_KEY = "ponsse-funcionarios-v1";
export const SETORES_KEY = "ponsse-setores-v1";
export const CONFIG_KEY = "ponsse-config-v1";

export const setoresDefault = [
  "Comercial",
  "Corporativo",
  "Logística",
  "Almoxarifado",
  "Pós-venda",
  "Administrativo",
  "Financeiro",
];

export const funcionariosIniciais: Funcionario[] = [
  {
    id: "1",
    nome: "Rafael Moraes",
    setor: "Ponsse",
    telefone: "+55 73 9831-6864",
    ativo: true,
    visivel: true,
    horarioInicio: "08:00",
    horarioFim: "18:00",
  },
  {
    id: "2",
    nome: "Victor Gonçalves",
    setor: "Corporativo",
    telefone: "+55 11 95322-5820",
    ativo: true,
    visivel: true,
    horarioInicio: "08:00",
    horarioFim: "18:00",
  },
  {
    id: "3",
    nome: "Wagner Paulo",
    setor: "Logística",
    telefone: "+55 11 91569-5916",
    ativo: true,
    visivel: true,
    horarioInicio: "08:00",
    horarioFim: "18:00",
  },
  {
    id: "4",
    nome: "Jonatah Cardoso",
    setor: "Comercial",
    telefone: "+55 11 92058-8178",
    ativo: true,
    visivel: true,
    horarioInicio: "08:00",
    horarioFim: "18:00",
  },
  {
    id: "5",
    nome: "Almoxarifado Base SLP",
    setor: "Almoxarifado",
    telefone: "+55 11 91027-7752",
    ativo: true,
    visivel: false,
    horarioInicio: "08:00",
    horarioFim: "18:00",
  },
];
