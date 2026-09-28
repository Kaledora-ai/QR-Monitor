import { LegalPage, CONTROLLER, CONTACT } from "@/components/LegalPage";

export const metadata = { title: "Política de privacidade" };

export default function Privacy() {
  return (
    <LegalPage title="Política de privacidade" updated="setembro de 2026">
      <p>
        Esta política explica como {CONTROLLER} (&quot;QR Monitor&quot;), controladora dos dados, trata informações pessoais nos
        termos da Lei Geral de Proteção de Dados (Lei 13.709/2018).
      </p>
      <h2>1. Dados de quem tem conta</h2>
      <ul>
        <li>E-mail e senha (armazenada de forma criptografada) para acesso.</li>
        <li>QR Codes criados, arquivos enviados (logos, PDFs, cardápios) e histórico de créditos.</li>
      </ul>
      <p>Base legal: execução do contrato de prestação do serviço.</p>
      <h2>2. Dados de quem escaneia um QR Code</h2>
      <p>Quando alguém escaneia um QR Code dinâmico, registramos:</p>
      <ul>
        <li>data e hora da leitura;</li>
        <li>cidade, estado e país aproximados, estimados pela rede de internet;</li>
        <li>tipo de aparelho, sistema operacional e navegador;</li>
        <li>uma impressão digital irreversível (hash) usada apenas para estimar visitantes únicos.</li>
      </ul>
      <p>
        <strong>Não armazenamos o endereço IP</strong> nem qualquer dado que identifique diretamente a pessoa. Base legal: legítimo
        interesse do dono do QR Code em medir o alcance da sua divulgação.
      </p>
      <h2>3. Compartilhamento</h2>
      <p>
        Os dados de leitura aparecem, agregados, para o dono do QR Code e para quem ele enviar o link do relatório. Usamos
        fornecedores de infraestrutura (hospedagem e banco de dados) que tratam dados sob nossas instruções. Não vendemos dados.
      </p>
      <h2>4. Retenção</h2>
      <p>Mantemos os dados enquanto a conta existir. Ao excluir um QR Code, suas leituras são apagadas. Ao encerrar a conta, todos os dados são excluídos, salvo obrigação legal.</p>
      <h2>5. Seus direitos</h2>
      <p>Você pode pedir acesso, correção, portabilidade ou exclusão dos seus dados pelo e-mail {CONTACT}.</p>
      <h2>6. Cookies</h2>
      <p>Usamos apenas cookies necessários para manter você conectado. Não usamos cookies de publicidade.</p>
    </LegalPage>
  );
}
