import { LegalPage, CONTROLLER, CONTACT } from "@/components/LegalPage";

export const metadata = { title: "Termos de uso" };

export default function Terms() {
  return (
    <LegalPage title="Termos de uso" updated="setembro de 2026">
      <p>
        Estes termos regem o uso da plataforma QR Monitor, oferecida por {CONTROLLER}. Ao criar uma conta, você concorda com as
        condições abaixo.
      </p>
      <h2>1. O serviço</h2>
      <p>
        O QR Monitor permite criar QR Codes estáticos (gratuitos, com o conteúdo gravado na imagem) e dinâmicos (que passam pela
        plataforma antes de chegar ao destino, permitindo relatório de leituras, troca de destino e validade).
      </p>
      <h2>2. Créditos</h2>
      <ul>
        <li>QR Codes dinâmicos e recursos adicionais são pagos com créditos, conforme a tabela exibida no site no momento do uso.</li>
        <li>Créditos não expiram, não são reembolsáveis após o uso e não podem ser convertidos em dinheiro.</li>
        <li>Toda conta nova recebe créditos de boas-vindas. Criar contas múltiplas para obter créditos gratuitos é proibido.</li>
        <li>Excluir um QR Code não devolve os créditos usados.</li>
      </ul>
      <h2>3. Validade dos QR Codes</h2>
      <p>
        QR Codes de 30 dias deixam de redirecionar ao fim do prazo e passam a exibir um aviso de expiração, até serem renovados.
        QR Codes permanentes funcionam enquanto a conta existir e o serviço estiver em operação. Você é responsável por renovar os
        códigos que imprimiu.
      </p>
      <h2>4. Uso proibido</h2>
      <p>É proibido usar a plataforma para direcionar a conteúdo ilegal, golpes, phishing, malware, pirataria ou que viole direitos de terceiros. QR Codes nessas condições podem ser desativados sem aviso e a conta, encerrada.</p>
      <h2>5. Responsabilidades</h2>
      <p>
        Você é responsável pelo conteúdo e pelos destinos dos seus QR Codes, e por testá-los antes de imprimir. Empregamos esforços
        razoáveis para manter o serviço disponível, mas não garantimos funcionamento ininterrupto nem nos responsabilizamos por
        custos de impressão ou perdas indiretas.
      </p>
      <h2>6. Alterações</h2>
      <p>Estes termos e a tabela de créditos podem ser atualizados. Mudanças relevantes serão comunicadas por e-mail ou no site.</p>
      <h2>7. Contato e foro</h2>
      <p>Dúvidas: {CONTACT}. Fica eleito o foro da comarca de São Paulo/SP.</p>
    </LegalPage>
  );
}
