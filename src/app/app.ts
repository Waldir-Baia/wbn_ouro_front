import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

type MenuItem = {
  label: string;
  route: string;
};

type MenuSection = {
  title: string;
  items: MenuItem[];
};

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private static readonly MENU_STRUCTURE: MenuSection[] = [
    {
      title: 'Cadastro',
      items: [
        { label: 'Clientes', route: '/cadastro/clientes' },
        { label: 'Peças & Modelos', route: '/cadastro/pecas' },
        { label: 'Serviços e Procedimentos', route: '/cadastro/servicos' },
        { label: 'Matérias-primas', route: '/cadastro/materias-primas' },
        { label: 'Fornecedores', route: '/cadastro/fornecedores' },
        { label: 'Tabelas de preço', route: '/cadastro/tabelas-preco' }
      ]
    },
    {
      title: 'Produção',
      items: [
        { label: 'Orçamentos', route: '/producao/orcamentos' },
        { label: 'Ordens de Serviço', route: '/producao/ordens-servico' },
        { label: 'Controle de Bancada', route: '/producao/bancada' },
        { label: 'Controle de Estoque', route: '/producao/estoque' },
        { label: 'Qualidade e Revisão', route: '/producao/qualidade' }
      ]
    },
    {
      title: 'Vendas',
      items: [
        { label: 'Propostas Comerciais', route: '/vendas/propostas' },
        { label: 'Pedidos', route: '/vendas/pedidos' },
        { label: 'Faturamento', route: '/vendas/faturamento' },
        { label: 'Comissões', route: '/vendas/comissoes' }
      ]
    },
    {
      title: 'Logística',
      items: [
        { label: 'Expedição', route: '/logistica/expedicao' },
        { label: 'Rastreio', route: '/logistica/rastreio' },
        { label: 'Devoluções & Garantias', route: '/logistica/devolucoes' }
      ]
    },
    {
      title: 'Financeiro',
      items: [
        { label: 'Contas a Receber', route: '/financeiro/receber' },
        { label: 'Contas a Pagar', route: '/financeiro/pagar' },
        { label: 'Fluxo de Caixa', route: '/financeiro/fluxo-caixa' },
        { label: 'Centros de Custo', route: '/financeiro/centros-custo' }
      ]
    },
    {
      title: 'Relatórios',
      items: [
        { label: 'Painel de Produção', route: '/relatorios/producao' },
        { label: 'Painel de Vendas', route: '/relatorios/vendas' },
        { label: 'Painel de Estoque', route: '/relatorios/estoque' },
        { label: 'Painel Financeiro', route: '/relatorios/financeiro' },
        { label: 'Desempenho de Ourives', route: '/relatorios/desempenho' }
      ]
    },
    {
      title: 'Configurações',
      items: [
        { label: 'Perfis & Usuários', route: '/configuracoes/usuarios' },
        { label: 'Permissões', route: '/configuracoes/permissoes' },
        { label: 'Parâmetros de Metais e Pedras', route: '/configuracoes/parametros' },
        { label: 'Integrações', route: '/configuracoes/integrações' },
        { label: 'Preferências do Sistema', route: '/configuracoes/preferencias' }
      ]
    }
  ];

  protected readonly title = signal('wbn_ouro_front');
  protected readonly sidebarOpen = signal(true);
  protected readonly menuSections = App.MENU_STRUCTURE;
  protected readonly openSections = signal(new Set<string>());

  protected toggleSidebar(): void {
    this.sidebarOpen.update((value) => !value);
  }

  protected toggleSection(title: string): void {
    this.openSections.update((current) => {
      const next = new Set(current);
      if (next.has(title)) {
        next.delete(title);
      } else {
        next.add(title);
      }
      return next;
    });
  }

  protected isSectionExpanded(title: string): boolean {
    return this.openSections().has(title);
  }
}
