import { useState } from "react"
import { useNavigate } from "react-router"
import {
  AlertCircle,
  BookOpen,
  ClipboardList,
  HelpCircle,
  Home,
  Info,
  Users,
  Grid3X3,
  Calendar,
  FileText,
  List,
  School,
  UserCog,
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
 * Página de ajuda para explicar todas as funcionalidades disponíveis para o coordenador
 * @returns Componente de Página de Ajuda
 */
export function CoordenadorHelpPage() {
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
                  <div className="text-muted-foreground pl-4 text-sm leading-relaxed">
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
      titulo: "Propostas de Horário",
      descricao:
        "Criação e gerenciamento de propostas de horário para seus cursos",
      icon: <ClipboardList className="text-primary h-5 w-5" />,
      rota: "/coordenador/propostas-horario",
      detalhes: [
        {
          subtitulo: "Como criar uma nova proposta?",
          conteudo:
            "Acesse a tela de Propostas de Horário, clique em 'Nova Proposta', selecione o curso e período letivo. O sistema carregará automaticamente as disciplinas e turmas que precisam ser alocadas. Defina os horários para cada turma usando o grid interativo.",
        },
        {
          subtitulo: "Como editar uma proposta existente?",
          conteudo:
            "Localize a proposta na lista e clique em 'Editar'. Você pode modificar horários, trocar professores e alterar observações enquanto a proposta estiver em status 'Rascunho' ou 'Rejeitada'.",
        },
        {
          subtitulo: "Quando submeter uma proposta?",
          conteudo:
            "Submeta a proposta apenas quando todos os horários estiverem definidos e você tiver certeza da alocação. Após submissão, a proposta será enviada para aprovação da direção e não poderá mais ser editada até que seja aprovada ou rejeitada.",
        },
        {
          subtitulo: "Como resolver conflitos de horário?",
          conteudo:
            "O sistema detecta automaticamente conflitos como sobreposição de professores ou salas. Use as sugestões do sistema ou ajuste manualmente os horários conflitantes antes de submeter a proposta.",
        },
      ],
    },
    {
      titulo: "Gestão de Disciplinas",
      descricao: "Cadastro e manutenção das disciplinas do curso",
      icon: <FileText className="text-primary h-5 w-5" />,
      rota: "/coordenador/disciplinas",
      detalhes: [
        {
          subtitulo: "Como cadastrar uma nova disciplina?",
          conteudo:
            "Na tela de Disciplinas, clique em 'Nova Disciplina', preencha os dados como código, nome, carga horária, tipo (obrigatória/optativa) e pré-requisitos. A disciplina estará disponível para inclusão nas matrizes curriculares.",
        },
        {
          subtitulo: "Como definir pré-requisitos?",
          conteudo:
            "No cadastro da disciplina, selecione as disciplinas que são pré-requisito na seção apropriada. O sistema validará automaticamente se os alunos cumprem os pré-requisitos ao se matricularem.",
        },
        {
          subtitulo: "Como inativar uma disciplina?",
          conteudo:
            "Edite a disciplina e altere o status para 'Inativa'. Disciplinas inativas não aparecerão nas novas matrizes curriculares, mas continuarão visíveis nas matrizes existentes para fins históricos.",
        },
      ],
    },
    {
      titulo: "Matrizes Curriculares",
      descricao: "Estruturação das grades curriculares dos cursos",
      icon: <Calendar className="text-primary h-5 w-5" />,
      rota: "/coordenador/matrizes-curriculares",
      detalhes: [
        {
          subtitulo: "Como criar uma matriz curricular?",
          conteudo:
            "Acesse Matrizes Curriculares, clique em 'Nova Matriz', selecione o curso e defina o período de vigência. Organize as disciplinas por semestre/período, definindo quais são obrigatórias e optativas para cada fase do curso.",
        },
        {
          subtitulo: "Como organizar disciplinas por período?",
          conteudo:
            "Use a interface de arrastar e soltar para organizar as disciplinas nos períodos apropriados. O sistema calculará automaticamente a carga horária total de cada período e alertará sobre possíveis sobrecargas.",
        },
        {
          subtitulo: "Como versionar matrizes curriculares?",
          conteudo:
            "Quando preciso fazer alterações em uma matriz ativa, crie uma nova versão definindo a data de início de vigência. O sistema manterá o histórico de todas as versões para referência futura.",
        },
      ],
    },
    {
      titulo: "Disciplinas Ofertadas",
      descricao: "Gestão das disciplinas oferecidas em cada período letivo",
      icon: <BookOpen className="text-primary h-5 w-5" />,
      rota: "/coordenador/disciplinas-ofertadas",
      detalhes: [
        {
          subtitulo: "Como definir disciplinas para um período?",
          conteudo:
            "Selecione o período letivo e marque quais disciplinas da matriz curricular serão oferecidas. Considere a demanda de alunos, disponibilidade de professores e recursos necessários.",
        },
        {
          subtitulo: "Como calcular a demanda de turmas?",
          conteudo:
            "O sistema mostra estatísticas de alunos aptos a se matricular em cada disciplina. Use esses dados para determinar quantas turmas de cada disciplina precisam ser abertas.",
        },
        {
          subtitulo: "Como ajustar oferta durante o período?",
          conteudo:
            "Durante o período de matrículas, você pode ajustar a oferta abrindo novas turmas ou cancelando turmas com baixa procura. Sempre considere o impacto na grade horária já aprovada.",
        },
      ],
    },
    {
      titulo: "Gestão de Turmas",
      descricao: "Abertura e alocação de turmas para as disciplinas",
      icon: <Grid3X3 className="text-primary h-5 w-5" />,
      rota: "/coordenador/turmas",
      detalhes: [
        {
          subtitulo: "Como abrir uma nova turma?",
          conteudo:
            "Na tela de Turmas, selecione a disciplina ofertada e clique em 'Nova Turma'. Defina a capacidade máxima, turno preferencial e se há alguma observação especial. A turma ficará disponível para alocação de professor e horário.",
        },
        {
          subtitulo: "Como alocar professores às turmas?",
          conteudo:
            "Selecione a turma e escolha um professor qualificado para a disciplina. O sistema mostrará apenas professores que têm competência na área e estão disponíveis no período.",
        },
        {
          subtitulo: "Como gerenciar vagas e matrículas?",
          conteudo:
            "Monitore o número de alunos matriculados versus a capacidade da turma. Você pode ajustar a capacidade ou abrir turmas adicionais conforme a demanda durante o período de matrículas.",
        },
      ],
    },
    {
      titulo: "Gestão de Professores",
      descricao: "Administração do corpo docente e suas qualificações",
      icon: <Users className="text-primary h-5 w-5" />,
      rota: "/usuarios",
      detalhes: [
        {
          subtitulo: "Como cadastrar um novo professor?",
          conteudo:
            "Acesse a gestão de usuários, clique em 'Novo Professor', preencha os dados pessoais, acadêmicos e defina as áreas de competência. Professores precisam ter suas qualificações documentadas para serem alocados a disciplinas.",
        },
        {
          subtitulo: "Como definir competências de professores?",
          conteudo:
            "No perfil do professor, adicione as disciplinas que ele está qualificado para lecionar, incluindo titulação e experiência na área. Isso ajuda o sistema a sugerir alocações apropriadas.",
        },
        {
          subtitulo: "Como consultar disponibilidade de professores?",
          conteudo:
            "O sistema mostra a disponibilidade declarada por cada professor e seus horários já ocupados. Use essas informações para otimizar a alocação e evitar sobrecarga de trabalho.",
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
            <h2 className="mb-3 text-xl leading-tight font-bold">
              Portal do Coordenador Acadêmico
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Como coordenador, você é responsável pela gestão acadêmica dos
              cursos sob sua coordenação. Seu papel é fundamental na organização
              das disciplinas, matrizes curriculares, alocação de professores e
              criação de propostas de horário que atendam às necessidades dos
              alunos e disponibilidade dos recursos.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCog className="text-primary h-5 w-5" />
              Suas Responsabilidades
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Como Coordenador, você gerencia a estrutura acadêmica dos cursos,
              desde a definição de matrizes curriculares até a criação de
              propostas de horário. Você trabalha diretamente com professores e
              alunos para garantir a qualidade e viabilidade da oferta acadêmica.
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
            <ol className="text-muted-foreground list-decimal space-y-3 pl-4 text-sm leading-relaxed">
              <li>Estruture as matrizes curriculares dos cursos</li>
              <li>Defina quais disciplinas serão ofertadas no período</li>
              <li>Gerencie professores e suas competências</li>
              <li>Abra e aloque turmas conforme a demanda</li>
              <li>Crie e submeta propostas de horário para aprovação</li>
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
          <h3 className="text-lg leading-tight font-medium">
            Nenhum resultado encontrado
          </h3>
          <p className="text-muted-foreground mt-2 max-w-md text-sm leading-relaxed">
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
            <h1 className="text-2xl leading-tight font-bold tracking-tight">
              Central de Ajuda do Coordenador
            </h1>
            <p className="text-muted-foreground leading-relaxed">
              Guia completo sobre todas as funcionalidades disponíveis para
              coordenação acadêmica.
            </p>
          </div>
        </div>
      </div>

      <Separator className="my-6" />

      <div className="mb-4 flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/coordenador")}
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
          <h3 className="mb-3 text-lg leading-tight font-medium">
            Precisa de mais ajuda?
          </h3>
          <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
            Se você não encontrou o que procurava ou precisa de assistência
            adicional, entre em contato com nossa equipe de suporte ou com a
            direção acadêmica.
          </p>
          <Button variant="secondary">Contatar Suporte Técnico</Button>
        </div>
      </div>
    </div>
  )
}
