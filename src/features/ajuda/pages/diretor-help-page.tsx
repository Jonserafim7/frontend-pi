import { useState } from "react"
import { useNavigate } from "react-router"
import {
  AlertCircle,
  BookOpen,
  GraduationCap,
  HelpCircle,
  Home,
  Info,
  Settings,
  UserCog,
  Users,
  Building,
  CalendarRange,
  Clock,
  School,
  FileText,
  List,
} from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

interface TopicoProps {
  titulo: string
  descricao: string
  icon: React.ReactNode
  rota: string
  detalhes: Array<{
    subtitulo: string
    conteudo: string
  }>
}

/**
 * Página de ajuda para explicar todas as funcionalidades disponíveis para o diretor
 * @returns Componente de Página de Ajuda
 */
export function DiretorHelpPage() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [activeTab, setActiveTab] = useState<string>("visao-geral")

  /**
   * Filtra os tópicos com base no termo de busca
   * @param topicos Lista de tópicos a serem filtrados
   * @returns Lista de tópicos filtrados
   */
  const filtrarTopicos = (topicos: TopicoProps[]) => {
    if (!searchTerm.trim()) return topicos

    return topicos.filter(
      (topico) =>
        topico.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        topico.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
        topico.detalhes.some(
          (detalhe) =>
            detalhe.subtitulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
            detalhe.conteudo.toLowerCase().includes(searchTerm.toLowerCase()),
        ),
    )
  }

  /**
   * Componente para exibir um tópico de ajuda
   */
  const TopicoAjuda = ({ topic }: { topic: TopicoProps }) => {
    return (
      <Card
        className={cn(
          "overflow-hidden pt-0 transition-all duration-300 hover:shadow-md",
        )}
      >
        <CardHeader className="from-primary/10 bg-gradient-to-r to-transparent py-6">
          <div className="flex items-center gap-3">
            <div className="bg-primary/20 flex items-center justify-center rounded-full p-2">
              {topic.icon}
            </div>
            <div>
              <CardTitle className="text-lg">{topic.titulo}</CardTitle>
              <CardDescription>{topic.descricao}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Accordion
            type="single"
            collapsible
            className="w-full"
          >
            {topic.detalhes.map((detalhe, idx) => (
              <AccordionItem
                key={idx}
                value={`item-${idx}`}
              >
                <AccordionTrigger className="text-left text-sm font-medium">
                  {detalhe.subtitulo}
                </AccordionTrigger>
                <AccordionContent>
                  <div className="text-muted-foreground pl-4 text-sm">
                    {detalhe.conteudo}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          <div className="mt-4 flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(topic.rota)}
              className="text-xs"
            >
              Acessar Funcionalidade
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Definição dos tópicos de ajuda
  const topicosAjuda: TopicoProps[] = [
    {
      titulo: "Configurações de Horários",
      descricao: "Gerenciamento de horários padrões e turnos do sistema",
      icon: <Clock className="text-primary h-5 w-5" />,
      rota: "/diretor/configuracoes-horario",
      detalhes: [
        {
          subtitulo: "Como configurar horários padrões?",
          conteudo:
            "Acesse a tela de Configurações de Horários, selecione o turno desejado (Manhã, Tarde ou Noite) e defina os horários de início de cada aula e do fim do turno. O sistema calculará automaticamente os intervalos entre as aulas.",
        },
        {
          subtitulo: "Como aplicar configurações para todos os cursos?",
          conteudo:
            "As configurações definidas na tela de Configurações de Horários serão utilizadas como padrão para todos os cursos que não possuem horários específicos configurados pelo coordenador.",
        },
        {
          subtitulo: "Quais são as restrições de horários?",
          conteudo:
            "O sistema valida automaticamente para garantir que não haja sobreposição de horários entre aulas do mesmo turno e que os horários estejam dentro dos limites configurados para o início e fim do turno.",
        },
      ],
    },
    {
      titulo: "Gestão de Cursos",
      descricao: "Cadastro e gerenciamento de cursos da instituição",
      icon: <GraduationCap className="text-primary h-5 w-5" />,
      rota: "/diretor/cursos",
      detalhes: [
        {
          subtitulo: "Como cadastrar um novo curso?",
          conteudo:
            "Na tela de Gestão de Cursos, clique no botão 'Novo Curso', preencha os dados como nome, código, tipo (Graduação, Pós-graduação, etc.), turno principal e coordenador responsável.",
        },
        {
          subtitulo: "Como editar um curso existente?",
          conteudo:
            "Localize o curso na lista e clique no ícone de edição. Modifique os dados necessários e salve as alterações.",
        },
        {
          subtitulo: "É possível inativar um curso?",
          conteudo:
            "Sim, na tela de edição do curso, você pode alterar o status para 'Inativo'. Cursos inativos não aparecerão nas listas de programação de horários, mas seus dados históricos serão preservados.",
        },
      ],
    },
    {
      titulo: "Coordenadores",
      descricao: "Gerenciamento de coordenadores e suas atribuições",
      icon: <UserCog className="text-primary h-5 w-5" />,
      rota: "/diretor/coordenadores",
      detalhes: [
        {
          subtitulo: "Como cadastrar um novo coordenador?",
          conteudo:
            "Acesse a tela de Coordenadores, clique em 'Novo Coordenador', selecione um professor existente no sistema e atribua-o ao papel de coordenador. Defina os cursos que ficarão sob sua responsabilidade.",
        },
        {
          subtitulo: "Como alterar cursos atribuídos a um coordenador?",
          conteudo:
            "Edite o cadastro do coordenador e modifique a lista de cursos atribuídos. Um mesmo curso não pode estar sob responsabilidade de mais de um coordenador simultaneamente.",
        },
        {
          subtitulo: "Um coordenador pode ser responsável por múltiplos cursos?",
          conteudo:
            "Sim, um coordenador pode ser responsável por vários cursos, especialmente quando são cursos relacionados ou da mesma área de conhecimento.",
        },
      ],
    },
    {
      titulo: "Professores",
      descricao: "Visualização e gerenciamento de professores",
      icon: <Users className="text-primary h-5 w-5" />,
      rota: "/diretor/professores",
      detalhes: [
        {
          subtitulo: "Como consultar a carga horária de um professor?",
          conteudo:
            "Na lista de professores, clique no nome do professor para ver seus detalhes, incluindo a carga horária atual, distribuição por disciplinas e disponibilidade cadastrada.",
        },
        {
          subtitulo: "Como verificar a disponibilidade de horários?",
          conteudo:
            "Ao visualizar os detalhes de um professor, você pode consultar o calendário de disponibilidade que o próprio professor cadastrou no sistema.",
        },
        {
          subtitulo:
            "Como analisar a distribuição de carga horária entre professores?",
          conteudo:
            "Utilize o relatório de 'Distribuição de Carga Horária' disponível na tela de Professores para visualizar gráficos e estatísticas sobre a alocação atual.",
        },
      ],
    },
    {
      titulo: "Prédios e Salas",
      descricao: "Gerenciamento da infraestrutura física da instituição",
      icon: <Building className="text-primary h-5 w-5" />,
      rota: "/diretor/predios-salas",
      detalhes: [
        {
          subtitulo: "Como cadastrar um novo prédio?",
          conteudo:
            "Acesse a tela de Prédios e Salas, clique em 'Novo Prédio', defina um nome, código, endereço e outras informações relevantes como número de andares e acessibilidade.",
        },
        {
          subtitulo: "Como cadastrar e configurar salas?",
          conteudo:
            "Selecione um prédio e clique em 'Nova Sala'. Defina o tipo (sala de aula, laboratório, auditório), capacidade, recursos disponíveis e restrições de uso.",
        },
        {
          subtitulo: "Como verificar a ocupação das salas?",
          conteudo:
            "Utilize o visualizador de 'Ocupação de Salas' para ver um mapa de calor mostrando os horários mais utilizados e a disponibilidade atual de cada sala por período.",
        },
      ],
    },
    {
      titulo: "Disciplinas",
      descricao: "Catálogo de disciplinas oferecidas pela instituição",
      icon: <BookOpen className="text-primary h-5 w-5" />,
      rota: "/diretor/disciplinas",
      detalhes: [
        {
          subtitulo: "Como cadastrar uma nova disciplina?",
          conteudo:
            "Na tela de Disciplinas, clique em 'Nova Disciplina'. Preencha os dados como nome, código, carga horária, tipo (teórica, prática, estágio), pré-requisitos e departamento responsável.",
        },
        {
          subtitulo: "Como vincular disciplinas a cursos?",
          conteudo:
            "Ao editar uma disciplina, você pode definir em quais cursos ela é oferecida, em qual período/semestre do curso e se é obrigatória ou optativa.",
        },
        {
          subtitulo: "Como gerenciar pré-requisitos?",
          conteudo:
            "Na edição da disciplina, utilize a seção de pré-requisitos para definir quais disciplinas devem ser cursadas antes. O sistema utilizará essas informações para validações na matrícula.",
        },
      ],
    },
    {
      titulo: "Calendário Acadêmico",
      descricao: "Definição de períodos letivos e eventos institucionais",
      icon: <CalendarRange className="text-primary h-5 w-5" />,
      rota: "/diretor/calendario-academico",
      detalhes: [
        {
          subtitulo: "Como configurar um novo período letivo?",
          conteudo:
            "Na tela de Calendário Acadêmico, defina o ano letivo e configure os semestres ou trimestres conforme a organização da instituição, estabelecendo datas de início e fim.",
        },
        {
          subtitulo: "Como cadastrar eventos e feriados?",
          conteudo:
            "Adicione eventos como início de aulas, períodos de provas, feriados e recessos. O sistema considerará essas informações ao gerar a programação de aulas.",
        },
        {
          subtitulo:
            "Como aplicar calendário personalizado para cursos específicos?",
          conteudo:
            "Caso algum curso tenha datas diferenciadas, você pode criar exceções específicas no calendário para determinados cursos ou modalidades de ensino.",
        },
      ],
    },
    {
      titulo: "Configurações do Sistema",
      descricao: "Ajustes de parâmetros globais e funcionalidades do sistema",
      icon: <Settings className="text-primary h-5 w-5" />,
      rota: "/diretor/configuracoes-sistema",
      detalhes: [
        {
          subtitulo: "Como configurar políticas de agendamento?",
          conteudo:
            "Defina regras globais como antecedência mínima para alterações de horários, limite de horas-aula consecutivas, intervalos obrigatórios e outras restrições que o sistema aplicará automaticamente.",
        },
        {
          subtitulo: "Como gerenciar permissões de usuários?",
          conteudo:
            "Configure quais funcionalidades cada tipo de usuário (diretor, coordenador, professor) pode acessar e que tipo de alterações podem realizar no sistema.",
        },
        {
          subtitulo: "Como configurar notificações automáticas?",
          conteudo:
            "Defina quais eventos devem gerar notificações (alterações de horários, aprovação de solicitações, conflitos) e quais usuários devem recebê-las, por email ou no sistema.",
        },
      ],
    },
  ]

  // Filtragem dos tópicos baseada na busca
  const topicosFiltrados = filtrarTopicos(topicosAjuda)

  // Conteúdo de visão geral do sistema
  const VisaoGeralContent = () => (
    <div className="space-y-6">
      <div className="bg-primary/10 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <Info className="text-primary mt-1 h-10 w-10" />
          <div>
            <h2 className="mb-2 text-xl font-bold">
              Sistema de Agendamento Acadêmico
            </h2>
            <p className="text-muted-foreground">
              Este sistema foi desenvolvido para facilitar a gestão completa do
              agendamento acadêmico da instituição, desde a definição de horários
              padrões até a alocação de professores, salas e recursos. Como
              diretor, você tem acesso a todas as funcionalidades e configurações
              globais do sistema.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCog className="text-primary h-5 w-5" />
              Seu Papel no Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              Como Diretor, você é responsável por definir as configurações
              globais do sistema, gerenciar cursos, coordenadores e aprovar grades
              horárias. Você tem acesso completo a todas as funcionalidades e pode
              visualizar ou modificar qualquer dado no sistema dentro das
              políticas institucionais.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <School className="text-primary h-5 w-5" />
              Fluxo de Trabalho
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="text-muted-foreground list-decimal space-y-2 pl-4 text-sm">
              <li>Defina as configurações globais e calendário acadêmico</li>
              <li>Cadastre e gerencie cursos e disciplinas</li>
              <li>Atribua coordenadores aos cursos</li>
              <li>Configure a infraestrutura (prédios e salas)</li>
              <li>Aprove as grades horárias propostas pelos coordenadores</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  // Conteúdo de todas as funcionalidades
  const FuncionalidadesContent = () => (
    <div className="space-y-6">
      <div className="mb-4 flex items-center">
        <div className="flex-1">
          <Input
            type="search"
            placeholder="Buscar funcionalidade ou termo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </div>
        <div className="text-muted-foreground text-sm">
          {topicosFiltrados.length} funcionalidades encontradas
        </div>
      </div>

      {searchTerm && topicosFiltrados.length === 0 ?
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <AlertCircle className="text-muted-foreground mb-4 h-12 w-12" />
          <h3 className="text-lg font-medium">Nenhum resultado encontrado</h3>
          <p className="text-muted-foreground mt-2 max-w-md text-sm">
            Não encontramos nenhuma funcionalidade correspondente à sua busca.
            Tente termos diferentes ou mais gerais.
          </p>
        </div>
      : <div className="grid gap-6 md:grid-cols-2">
          {topicosFiltrados.map((topico, idx) => (
            <TopicoAjuda
              key={idx}
              topic={topico}
            />
          ))}
        </div>
      }
    </div>
  )

  return (
    <div className="container mx-auto space-y-8 px-4 py-8">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 rounded-lg p-2">
            <HelpCircle className="text-primary h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Central de Ajuda do Diretor
            </h1>
            <p className="text-muted-foreground">
              Guia completo sobre todas as funcionalidades disponíveis para sua
              função no sistema.
            </p>
          </div>
        </div>
      </div>

      <Separator className="my-6" />

      <div className="mb-4 flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/diretor")}
          className="flex items-center gap-2"
        >
          <Home className="h-4 w-4" />
          Voltar ao Dashboard
        </Button>
      </div>

      <Tabs
        defaultValue="visao-geral"
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <div className="flex justify-center">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger
              value="visao-geral"
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              <span>Visão Geral</span>
            </TabsTrigger>
            <TabsTrigger
              value="funcionalidades"
              className="flex items-center gap-2"
            >
              <List className="h-4 w-4" />
              <span>Funcionalidades</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent
          value="visao-geral"
          className="animate-in fade-in-50 space-y-4"
        >
          <VisaoGeralContent />
        </TabsContent>

        <TabsContent
          value="funcionalidades"
          className="animate-in fade-in-50 space-y-4"
        >
          <FuncionalidadesContent />
        </TabsContent>
      </Tabs>

      <div className="bg-muted/50 mt-10 rounded-lg p-6">
        <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
          <HelpCircle className="text-primary mb-4 h-10 w-10" />
          <h3 className="mb-2 text-lg font-medium">Precisa de mais ajuda?</h3>
          <p className="text-muted-foreground mb-4 text-sm">
            Se você não encontrou o que procurava ou precisa de assistência
            adicional, entre em contato com nossa equipe de suporte.
          </p>
          <Button variant="secondary">Contatar Suporte Técnico</Button>
        </div>
      </div>
    </div>
  )
}
