<script setup lang="ts">
import LegalDocumentShell from '@/components/legal/LegalDocumentShell.vue'
import { TERMS_VERSION } from '@/constants/consent'
</script>

<template>
  <LegalDocumentShell
    title="Termos de Uso"
    :subtitle="`Versão ${TERMS_VERSION} — última atualização: junho de 2026`"
  >
    <section>
      <h2>1. Aceitação</h2>
      <p>
        Ao criar uma conta ou utilizar a plataforma Glow Up Connect, você declara ter lido e
        concordado com estes Termos de Uso. Se não concordar, não utilize os serviços.
      </p>
    </section>

    <section>
      <h2>2. Objeto</h2>
      <p>
        A Glow Up Connect oferece software como serviço (SaaS) para gestão de estabelecimentos de
        beleza e bem-estar, incluindo agenda, equipe, serviços, financeiro e comunicação com clientes.
      </p>
    </section>

    <section>
      <h2>3. Cadastro e conta</h2>
      <ul>
        <li>Você deve fornecer informações verdadeiras e mantê-las atualizadas.</li>
        <li>É sua responsabilidade proteger suas credenciais de acesso.</li>
        <li>O uso da conta por terceiros sem autorização é proibido.</li>
      </ul>
    </section>

    <section>
      <h2>4. Uso permitido</h2>
      <p>
        É vedado utilizar a plataforma para fins ilícitos, enviar spam, tentar acessar dados de
        outros usuários sem permissão, realizar engenharia reversa ou sobrecarregar a infraestrutura.
      </p>
    </section>

    <section>
      <h2>5. Assinaturas e pagamentos</h2>
      <p>
        Planos pagos são cobrados conforme condições exibidas no momento da contratação. Pagamentos
        podem ser processados por parceiros como o Mercado Pago, sujeitos também às políticas desses
        provedores. Cancelamentos e reembolsos seguem a legislação aplicável e as regras do plano
        contratado.
      </p>
    </section>

    <section>
      <h2>6. Dados pessoais e terceiros</h2>
      <p>
        O tratamento de dados pessoais é regido pela nossa política de privacidade e pela LGPD.
        Alguns recursos dependem de APIs de terceiros (pagamentos, consulta de CEP, mensageria).
        O compartilhamento com esses parceiros ocorre somente com base legal adequada, incluindo seu
        consentimento quando exigido — configure suas preferências na
        política de cookies do aplicativo.
      </p>
    </section>

    <section>
      <h2>7. Propriedade intelectual</h2>
      <p>
        Marcas, layout, código e conteúdos da plataforma pertencem à Glow Up Connect ou a seus
        licenciadores. O conteúdo inserido por você permanece de sua titularidade, concedendo-nos
        licença limitada para hospedar e processar esse conteúdo na prestação do serviço.
      </p>
    </section>

    <section>
      <h2>8. Disponibilidade e limitação de responsabilidade</h2>
      <p>
        Empregamos esforços razoáveis para manter o serviço disponível, mas não garantimos
        funcionamento ininterrupto. Na extensão permitida pela lei, não nos responsabilizamos por
        lucros cessantes ou danos indiretos decorrentes do uso da plataforma.
      </p>
    </section>

    <section>
      <h2>9. Alterações e rescisão</h2>
      <p>
        Podemos atualizar estes termos mediante publicação de nova versão. O uso continuado após a
        alteração constitui aceitação. Você pode encerrar sua conta a qualquer momento; podemos
        suspender contas que violem estes termos.
      </p>
    </section>

    <section>
      <h2>10. Contato</h2>
      <p>
        Dúvidas sobre estes termos: contato@glowup.com.br
      </p>
    </section>
  </LegalDocumentShell>
</template>
